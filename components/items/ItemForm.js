"use client";

import { useEffect, useMemo, useState } from "react";
import { getClientAuth } from "@/lib/firebase/client";
import { uploadEntityImage } from "@/lib/firebase/storage";

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
    <form onSubmit={handleSubmit} className="grid gap-4 border border-zinc-800 p-5">
      <label className="grid gap-2 text-sm font-medium text-zinc-300">
        <span>Titulo</span>
        <input
          className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none transition focus:border-cyan-400"
          name="title"
          defaultValue={item?.title || ""}
          disabled={loading}
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-zinc-300">
        <span>Descripcion</span>
        <textarea
          className="min-h-28 resize-y border border-zinc-800 bg-zinc-950 px-3 py-3 text-zinc-100 outline-none transition focus:border-cyan-400"
          name="description"
          defaultValue={item?.description || ""}
          disabled={loading}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-zinc-300">
        <span>Estado</span>
        <select
          className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none transition focus:border-cyan-400"
          name="status"
          defaultValue={item?.status || "pending"}
          disabled={loading}
        >
          <option value="pending">Pendiente</option>
          <option value="active">Activo</option>
          <option value="completed">Completado</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium text-zinc-300">
        <span>Imagen</span>
        {useFirebaseStorage ? (
          <>
            <input name="imageUrl" type="hidden" defaultValue={item?.imageUrl || ""} />
            <input name="imagePath" type="hidden" defaultValue={item?.imagePath || ""} />
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition file:mr-4 file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-100 hover:file:bg-zinc-700 focus:border-cyan-400"
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
              className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-400"
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
        <div className="border border-zinc-800 bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Preview del item"
            className="h-44 w-full object-cover"
            src={previewUrl}
          />
        </div>
      ) : null}

      <label className="flex items-start gap-3 border border-zinc-800 p-3 text-sm font-medium text-zinc-300">
        <input
          className="mt-1 size-4 border border-zinc-700 bg-zinc-950 accent-cyan-400"
          name="published"
          type="checkbox"
          defaultChecked={Boolean(item?.published)}
          disabled={loading}
        />
        <span>
          Publicado
          <span className="mt-1 block text-sm font-normal leading-6 text-zinc-500">
            Si esta activo, el item se mostrara en la home publica y tendra una
            ruta publica propia.
          </span>
        </span>
      </label>

      <button
        className="h-11 border border-cyan-400 bg-cyan-400 px-4 text-sm font-semibold text-zinc-950 transition hover:border-cyan-300 hover:bg-cyan-300"
        disabled={loading}
        type="submit"
      >
        {loading ? "Guardando..." : submitLabel}
      </button>

      {error ? (
        <p className="border border-red-900/70 bg-red-950/40 p-3 text-sm leading-6 text-red-300">
          {error}
        </p>
      ) : null}
    </form>
  );
}
