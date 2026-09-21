import NumberTicker from "@/components/ui/NumberTicker";
import { cardClass, eyebrowClass } from "@/components/ui/styles";

/*
  Anatomia del manual: rotulo, cifra y variacion forman un bloque indivisible
  (proximidad), dentro de su propia superficie (region comun).

  La cifra va en monoespaciada aunque sea grande: por gobernanza, todo importe
  y fecha usa JetBrains Mono, nunca la tipografia de titulares.

  El icono es el ancla visual del dato: vive en su propia caja, en el tono de
  la metrica, y solo se ilumina un poco mas al pasar el mouse.
*/

const toneClasses = {
  muted: "text-muted",
  positive: "text-positive",
  alert: "text-alert",
};

const iconBoxTones = {
  // Decorativo por defecto: indigo muteado, el acento de marca sin semantica.
  muted: "bg-primary/10 text-[#6366F1]",
  positive: "bg-positive/10 text-positive",
  alert: "bg-alert/10 text-alert",
};

export default function StatTile({
  accent = false,
  hint,
  icon: Icon,
  label,
  numberFormat,
  numberValue,
  span = "",
  tone = "muted",
  value,
  valueSuffix,
}) {
  return (
    <div
      className={`${cardClass} group relative flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out hover:bg-[#20242d] ${span} ${
        accent ? "border-t-2 border-t-primary" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={eyebrowClass}>{label}</span>
        {Icon ? (
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ease-in-out group-hover:scale-110 ${
              iconBoxTones[tone] || iconBoxTones.muted
            }`}
          >
            <Icon size={16} />
          </span>
        ) : null}
      </div>
      <strong className="font-mono text-3xl font-bold tabular-nums tracking-tight text-[#F3F4F6]">
        {typeof numberValue === "number" ? (
          <>
            <NumberTicker format={numberFormat} value={numberValue} />
            {valueSuffix}
          </>
        ) : (
          value
        )}
      </strong>
      {hint ? (
        <span className={`text-sm leading-6 ${toneClasses[tone] || toneClasses.muted}`}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
