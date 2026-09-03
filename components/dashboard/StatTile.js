import { cardClass } from "@/components/ui/styles";

export default function StatTile({ hint, icon: Icon, label, value }) {
  return (
    <div className={cardClass}>
      <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
        <Icon size={18} />
      </span>
      <span className="mt-4 block text-sm text-zinc-500">{label}</span>
      <strong className="mt-1 block text-3xl font-semibold tracking-tight text-zinc-50">
        {value}
      </strong>
      {hint ? (
        <span className="mt-1.5 block text-sm leading-6 text-zinc-500">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
