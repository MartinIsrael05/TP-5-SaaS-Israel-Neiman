import { formatMoney } from "@/lib/format";
import {
  CATEGORIES_FALLBACK_LABEL,
  resolveNextChargeDate,
} from "./subscriptions";

// Todas las funciones de este archivo son puras: reciben las suscripciones ya
// leidas y devuelven numeros. No tocan Firestore, asi que se pueden reusar
// desde el panel, el calendario o donde haga falta.

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function parseDateOnly(value) {
  if (!value) {
    return null;
  }

  // "YYYY-MM-DD" leido en hora local, para no correr un dia por zona horaria.
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Lleva cualquier suscripcion a su costo mensual equivalente, para poder
 * sumar mensuales y anuales en un mismo total.
 */
export function monthlyAmount(subscription) {
  const amount = Number(subscription.amount) || 0;

  return subscription.billingCycle === "annual" ? amount / 12 : amount;
}

export function isActive(subscription) {
  return subscription.status === "active";
}

/**
 * Los numeros grandes de la fila superior del panel.
 */
export function summarize(subscriptions) {
  const active = subscriptions.filter(isActive);
  const paused = subscriptions.filter((item) => item.status === "paused");
  const cancelled = subscriptions.filter((item) => item.status === "cancelled");

  const monthlyTotal = active.reduce(
    (total, subscription) => total + monthlyAmount(subscription),
    0,
  );

  // Lo que se ahorraria por año si las pausadas se cancelaran en vez de
  // quedar esperando que alguien se acuerde de ellas.
  const potentialAnnualSavings = paused.reduce(
    (total, subscription) => total + monthlyAmount(subscription) * 12,
    0,
  );

  return {
    monthlyTotal,
    annualProjection: monthlyTotal * 12,
    activeCount: active.length,
    pausedCount: paused.length,
    cancelledCount: cancelled.length,
    annualCount: active.filter((item) => item.billingCycle === "annual").length,
    potentialAnnualSavings,
  };
}

/**
 * Gasto mensual por categoria, de mayor a menor.
 */
export function spendByCategory(subscriptions, categories = []) {
  const titles = new Map(
    categories.map((category) => [category.id, category.title]),
  );
  const totals = new Map();

  for (const subscription of subscriptions.filter(isActive)) {
    const label =
      titles.get(subscription.categoryItemId) || CATEGORIES_FALLBACK_LABEL;

    totals.set(label, (totals.get(label) || 0) + monthlyAmount(subscription));
  }

  const grandTotal = [...totals.values()].reduce((sum, value) => sum + value, 0);

  return [...totals.entries()]
    .map(([label, amount]) => ({
      label,
      amount,
      share: grandTotal > 0 ? amount / grandTotal : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Cobros que caen dentro de los proximos `days` dias.
 */
export function upcomingCharges(subscriptions, { from = new Date(), days = 30 } = {}) {
  const today = startOfDay(from);
  const limit = startOfDay(from);
  limit.setDate(limit.getDate() + days);

  return subscriptions
    .filter(isActive)
    .map((subscription) => {
      const chargeDate = parseDateOnly(resolveNextChargeDate(subscription, today));

      if (!chargeDate) {
        return null;
      }

      return {
        id: subscription.id,
        name: subscription.name,
        categoryItemId: subscription.categoryItemId,
        amount: Number(subscription.amount) || 0,
        billingCycle: subscription.billingCycle,
        chargeDate,
        daysUntil: Math.round((chargeDate - today) / 86400000),
      };
    })
    .filter((charge) => charge && charge.chargeDate <= limit)
    .sort((a, b) => a.chargeDate - b.chargeDate);
}

/**
 * Cuanto se paga cada uno de los proximos meses, separando la base mensual de
 * las renovaciones anuales. Es lo que explica por que un mes duele mas que otro.
 */
export function monthlyProjection(subscriptions, { from = new Date(), months = 6 } = {}) {
  const active = subscriptions.filter(isActive);
  const today = startOfDay(from);

  const monthlyBase = active
    .filter((subscription) => subscription.billingCycle !== "annual")
    .reduce((total, subscription) => total + (Number(subscription.amount) || 0), 0);

  const annuals = active
    .filter((subscription) => subscription.billingCycle === "annual")
    .map((subscription) => ({
      name: subscription.name,
      amount: Number(subscription.amount) || 0,
      date: parseDateOnly(resolveNextChargeDate(subscription, today)),
    }))
    .filter((item) => item.date);

  const result = [];

  for (let offset = 0; offset < months; offset += 1) {
    const cursor = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const renewals = annuals.filter(
      (item) =>
        item.date.getFullYear() === cursor.getFullYear() &&
        item.date.getMonth() === cursor.getMonth(),
    );
    const annualTotal = renewals.reduce((total, item) => total + item.amount, 0);

    result.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      label: MONTH_LABELS[cursor.getMonth()],
      monthly: monthlyBase,
      annual: annualTotal,
      total: monthlyBase + annualTotal,
      renewalNames: renewals.map((item) => item.name),
    });
  }

  return result;
}

/**
 * Las mas caras, normalizadas a costo mensual para poder comparar peras con peras.
 */
export function topSubscriptions(subscriptions, limit = 5) {
  return subscriptions
    .filter(isActive)
    .map((subscription) => ({
      id: subscription.id,
      name: subscription.name,
      billingCycle: subscription.billingCycle,
      monthly: monthlyAmount(subscription),
    }))
    .sort((a, b) => b.monthly - a.monthly)
    .slice(0, limit);
}

/**
 * Avisos accionables: plata dormida, renovaciones anuales caras que se vienen
 * y suscripciones canceladas que siguen ocupando lugar.
 */
export function reviewSuggestions(subscriptions, { from = new Date() } = {}) {
  const today = startOfDay(from);
  const suggestions = [];

  for (const subscription of subscriptions) {
    if (subscription.status === "paused") {
      suggestions.push({
        id: `paused-${subscription.id}`,
        tone: "warning",
        title: `${subscription.name} esta pausada`,
        detail: `Si la cancelas te ahorras ${formatMoney(monthlyAmount(subscription) * 12)} por año.`,
        subscriptionId: subscription.id,
      });
      continue;
    }

    if (subscription.status === "cancelled") {
      suggestions.push({
        id: `cancelled-${subscription.id}`,
        tone: "neutral",
        title: `${subscription.name} esta cancelada`,
        detail: "Ya no se cobra. Podes eliminarla para dejar la lista limpia.",
        subscriptionId: subscription.id,
      });
      continue;
    }

    if (subscription.billingCycle === "annual") {
      const chargeDate = parseDateOnly(
        resolveNextChargeDate(subscription, today),
      );

      if (chargeDate) {
        const daysUntil = Math.round((chargeDate - today) / 86400000);

        if (daysUntil <= 45) {
          suggestions.push({
            id: `annual-${subscription.id}`,
            tone: "serious",
            title: `${subscription.name} renueva en ${daysUntil} dias`,
            detail: `Es un cobro anual de ${formatMoney(subscription.amount)} de una sola vez.`,
            subscriptionId: subscription.id,
          });
        }
      }
    }
  }

  return suggestions;
}
