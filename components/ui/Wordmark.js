/*
  Marca denominativa. Existe como componente para que la grafia normativa
  —siempre TECA, en mayusculas, sin acento y sin variantes— quede en un solo
  lugar y no se degrade al copiarse entre pantallas.

  El filete indigo es el recurso de marca del manual: senala la identidad sin
  gastar color semantico en la interfaz.
*/
export default function Wordmark({ className = "", rule = false, size = "md" }) {
  const sizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <span className={`inline-flex flex-col gap-1.5 ${className}`}>
      {rule ? <span className="h-0.5 w-7 bg-primary" aria-hidden="true" /> : null}
      <span
        className={`font-sans font-extrabold tracking-tight text-ink ${sizes[size] || sizes.md}`}
      >
        TECA
      </span>
    </span>
  );
}
