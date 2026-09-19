"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trophy } from "lucide-react";
import { badgeClass } from "@/components/ui/styles";
import { formatMoneyShort } from "@/lib/format";

const CURRENCIES = ["ARS", "USD"];

function CurrencyToggle({ currencyMode, onChange }) {
  return (
    <div className="inline-flex shrink-0 gap-1 rounded-lg bg-[#0F1115] p-1">
      {CURRENCIES.map((code) => (
        <button
          className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
            currencyMode === code
              ? "bg-[#1A1D24] text-[#F3F4F6]"
              : "text-[#9CA3AF]"
          }`}
          key={code}
          onClick={() => onChange(code)}
          type="button"
        >
          {code}
        </button>
      ))}
    </div>
  );
}

export default function TopExpenses({ limit = 5, subscriptions }) {
  const [currencyMode, setCurrencyMode] = useState("ARS");

  const top = subscriptions
    .filter((subscription) => subscription.currency === currencyMode)
    .slice(0, limit);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <CurrencyToggle currencyMode={currencyMode} onChange={setCurrencyMode} />
      </div>

      {top.length === 0 ? (
        <p className="text-sm leading-6 text-muted">
          No hay suscripciones activas en {currencyMode}.
        </p>
      ) : (
        <ol className="divide-y divide-line">
          {top.map((subscription, index) => (
            <li
              className="group -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-all duration-300 ease-in-out first:pt-3 last:pb-3 hover:bg-inset"
              key={subscription.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-md font-mono text-xs tabular-nums transition-colors duration-300 ease-in-out ${
                    index === 0
                      ? "bg-primary/10 text-primary"
                      : "bg-inset text-muted"
                  }`}
                >
                  {index === 0 ? <Trophy size={13} /> : index + 1}
                </span>
                <span className="truncate text-sm font-medium text-ink">
                  {subscription.name}
                </span>
                {subscription.billingCycle === "annual" ? (
                  <span className={badgeClass("neutral")}>anual</span>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-mono text-sm font-semibold tabular-nums text-ink">
                  {formatMoneyShort(subscription.monthly, subscription.currency)}
                </span>
                <Link
                  aria-label={`Editar ${subscription.name}`}
                  className="flex size-7 items-center justify-center rounded-md text-muted opacity-0 transition-all duration-300 ease-in-out hover:bg-line hover:text-ink group-hover:opacity-100"
                  href={`/dashboard/subscriptions/${subscription.id}/edit`}
                >
                  <Pencil size={13} />
                </Link>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
