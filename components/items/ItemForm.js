"use client";

import { useEffect, useMemo, useState } from "react";
import { getClientAuth } from "@/lib/firebase/client";
import { uploadEntityImage } from "@/lib/firebase/storage";
import {
  buttonClass,
  cardClass,
  fileInputClass,
  inputClass,
  labelClass,
  textareaClass,
} from "@/components/ui/styles";

function normalizeLocalImagePath(imageName, imageBasePath) {
  const value = String(imageName || "").trim();

  if (!value) {
    return "";
  }

  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `/${imageBasePath}/${value}`;
}

function getLocalImageInputValue(imageUrl, imageBasePath) {
  const value = String(imageUrl || "");
  const prefix = `/${imageBasePath}/`;

  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export default function ItemForm({
  action,
  imageBasePath = "items",
  item,
  storageItemId,
  submitLabel = "Guardar",
  useFirebaseStorage = false,
}) {
  const cleanImageBasePath = useMemo(
    () => imageBasePath.replace(/^\/+|\/+$/g, "") || "items",
    [imageBasePath],
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(item?.imageUrl || "");
  const [objectPreviewUrl, setObjectPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (objectPreviewUrl) {
        URL.revokeObjectURL(objectPreviewUrl);
      }
    };
  }, [objectPreviewUrl]);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(form);

      if (useFirebaseStorage) {
        const imageFile = formData.get("imageFile");
        const hasNewImage = imageFile instanceof File && imageFile.size > 0;
        formData.delete("imageFile");

        if (hasNewImage) {
          const currentUser = getClientAuth().currentUser;

          if (!currentUser) {
            throw new Error("Tenes que iniciar sesion para subir imagenes.");
          }

          const uploadedImage = await uploadEntityImage({
            entity: cleanImageBasePath,
            file: imageFile,
            itemId: storageItemId || item?.id || "uploads",
            userId: currentUser.uid,
          });

          formData.set("imageUrl", uploadedImage.imageUrl);
          formData.set("imagePath", uploadedImage.imagePath);
        } else {
          formData.set("imageUrl", item?.imageUrl || "");
          formData.set("imagePath", item?.imagePath || "");
        }
      } else {
        const imageName = String(formData.get("imageUrl") || "").trim();
        formData.set(
          "imageUrl",
          normalizeLocalImagePath(imageName, cleanImageBasePath),
        );
        formData.set("imagePath", "");
      }

      await action(formData);
      if (!item) {
        form.reset();
        setPreviewUrl("");
        setObjectPreviewUrl("");
      }
    } catch (err) {
      setError(err.message || "No se pudo guardar el item.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`grid min-w-0 gap-4 ${cardClass}`}>
      <label className={labelClass}>
        <span>Titulo</span>
        <input
          className={inputClass}
          name="title"
          defaultValue={item?.title || ""}
          disabled={loading}
          required
        />
      </label>

      <label className={labelClass}>
        <span>Descripcion</span>
        <textarea
          className={textareaClass}
          name="description"
          defaultValue={item?.description || ""}
          disabled={loading}
        />
      </label>

      <label className={labelClass}>
        <span>Estado</span>
        <select
          className={inputClass}
          name="status"
          defaultValue={item?.status || "pending"}
          disabled={loading}
        >
          <option value="pending">Pendiente</option>
          <option value="active">Activo</option>
          <option value="completed">Completado</option>
        </select>
      </label>

      <label className={labelClass}>
        <span>Imagen</span>
        {useFirebaseStorage ? (
          <>
            <input
              name="imageUrl"
              type="hidden"
              defaultValue={item?.imageUrl || ""}
            />
            <input
              name="imagePath"
              type="hidden"
              defaultValue={item?.imagePath || ""}
            />
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={fileInputClass}
              name="imageFile"
              type="file"
              disabled={loading}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) {
                  setObjectPreviewUrl("");
                  setPreviewUrl(item?.imageUrl || "");
                  return;
                }

                const nextPreviewUrl = URL.createObjectURL(file);
                setObjectPreviewUrl(nextPreviewUrl);
                setPreviewUrl(nextPreviewUrl);
              }}
            />
            <span className="text-sm font-normal leading-6 text-zinc-500">
              Modo Storage activo. Requiere Cloud Storage for Firebase y plan Blaze.
              Formatos admitidos: JPG, PNG, WEBP o GIF. Tamano maximo: 2 MB.
            </span>
          </>
        ) : (
          <>
            <input
              className={inputClass}
              name="imageUrl"
              type="text"
              defaultValue={getLocalImageInputValue(
                item?.imageUrl,
                cleanImageBasePath,
              )}
              disabled={loading}
              placeholder="imagen.jpg"
              onChange={(event) => {
                const value = event.target.value.trim();
                setPreviewUrl(normalizeLocalImagePath(value, cleanImageBasePath));
              }}
            />
            <span className="text-sm font-normal leading-6 text-zinc-500">
              Guardar la imagen en `public/{cleanImageBasePath}` y escribir solamente
              el nombre del archivo, por ejemplo `imagen.jpg`.
            </span>
          </>
        )}
      </label>

      {previewUrl ? (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Preview de la categoria"
            className="h-44 w-full object-cover"
            src={previewUrl}
          />
        </div>
      ) : null}

      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm font-medium text-zinc-300">
        <input
          className="mt-1 size-4 rounded border border-white/20 bg-zinc-950 accent-emerald-400"
          name="published"
          type="checkbox"
          defaultChecked={Boolean(item?.published)}
          disabled={loading}
        />
        <span>
          Publicado
          <span className="mt-1 block text-sm font-normal leading-6 text-zinc-500">
            Si esta activo, la categoria se mostrara en la home publica y
            tendra una ruta publica propia.
          </span>
        </span>
      </label>

      <button className={buttonClass("primary", "w-full")} disabled={loading} type="submit">
        {loading ? "Guardando..." : submitLabel}
      </button>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm leading-6 text-red-300">
          {error}
        </p>
      ) : null}
    </form>
  );
}
