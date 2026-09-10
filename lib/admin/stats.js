import { getDb } from "@/lib/firebase/firestore";
import { monthlyAmount } from "@/lib/subscriptions/metrics";

// Metricas agregadas de toda la plataforma, para la seccion de administracion.
// A diferencia del resto de la app, estas consultas NO filtran por userId: son
// el unico lugar que mira los datos de todos, y solo las puede pedir un admin.

const DAYS_30 = 30 * 24 * 60 * 60 * 1000;

export async function getPlatformStats() {
  const db = getDb();
  const [usersSnapshot, subscriptionsSnapshot, itemsSnapshot] = await Promise.all([
    db.collection("users").get(),
    db.collection("subscriptions").get(),
    db.collection("items").get(),
  ]);

  const now = Date.now();

  let admins = 0;
  let newUsers = 0;

  for (const doc of usersSnapshot.docs) {
    const data = doc.data();

    if (data.user_type === "admin") {
      admins += 1;
    }

    const createdAt = data.createdAt?.toDate?.();

    if (createdAt && now - createdAt.getTime() <= DAYS_30) {
      newUsers += 1;
    }
  }

  const ownersWithData = new Set();
  const statusCounts = { active: 0, paused: 0, cancelled: 0 };
  const serviceCounts = new Map();
  let platformMonthly = 0;

  for (const doc of subscriptionsSnapshot.docs) {
    const data = doc.data();

    if (data.userId) {
      ownersWithData.add(data.userId);
    }

    if (statusCounts[data.status] !== undefined) {
      statusCounts[data.status] += 1;
    }

    if (data.status === "active") {
      platformMonthly += monthlyAmount(data);
    }

    const name = String(data.name || "").trim();

    if (name) {
      serviceCounts.set(name, (serviceCounts.get(name) || 0) + 1);
    }
  }

  const totalUsers = usersSnapshot.size;
  const totalSubscriptions = subscriptionsSnapshot.size;

  return {
    totalUsers,
    admins,
    newUsers,
    totalSubscriptions,
    totalCategories: itemsSnapshot.size,
    activatedUsers: ownersWithData.size,
    // Cuantos de los registrados llegaron a cargar al menos una suscripcion.
    activationRate: totalUsers > 0 ? ownersWithData.size / totalUsers : 0,
    averagePerUser:
      ownersWithData.size > 0 ? totalSubscriptions / ownersWithData.size : 0,
    platformMonthly,
    statusCounts,
    topServices: [...serviceCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"))
      .slice(0, 5),
  };
}
