import { cardClass, eyebrowClass } from "@/components/ui/styles";

/*
  Anatomia del manual: rotulo, cifra y variacion forman un bloque indivisible
  (proximidad), dentro de su propia superficie (region comun). Sin icono: la
  norma de sobriedad pide que ningun recurso decorativo compita con el dato.

  La cifra va en monoespaciada aunque sea grande: por gobernanza, todo importe
  y fecha usa JetBrains Mono, nunca la tipografia de titulares.
*/

const toneClasses = {
  muted: "text-muted",
  positive: "text-positive",
  alert: "text-alert",
};

export default function StatTile({ hint, label, tone = "muted", value }) {
  return (
    <div className={`${cardClass} flex flex-col gap-2`}>
      <span className={eyebrowClass}>{label}</span>
      <strong className="text-3xl font-medium tabular-nums tracking-tight text-ink">
        {value}
      </strong>
      {hint ? (
        <span className={`text-sm leading-6 ${toneClasses[tone] || toneClasses.muted}`}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
