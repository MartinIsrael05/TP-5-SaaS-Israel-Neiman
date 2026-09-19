// Constantes puras de la entidad, sin dependencias.
//
// Viven aparte de `subscriptions.js` a proposito: ese archivo importa
// firebase-admin, que es solo de servidor. Al tenerlas aca, los componentes de
// cliente (como el importador de Excel) pueden usarlas sin arrastrar el SDK de
// administrador al bundle del navegador.

export const CATEGORIES_FALLBACK_LABEL = "Sin categoria";
export const CURRENCIES = ["ARS", "USD"];
export const DEFAULT_CURRENCY = "ARS";
export const BILLING_CYCLES = ["monthly", "annual"];
export const STATUSES = ["active", "paused", "cancelled"];
export const USAGE_LEVELS = ["Alto", "Medio", "Bajo"];
