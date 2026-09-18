import SubscriptionsBoard from "@/components/subscriptions/SubscriptionsBoard";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserItems } from "@/lib/items/items";
import { listUserSubscriptions } from "@/lib/subscriptions/subscriptions";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();
  const [subscriptions, categories] = await Promise.all([
    listUserSubscriptions(user.uid),
    listUserItems(user.uid),
  ]);

  return <SubscriptionsBoard categories={categories} subscriptions={subscriptions} />;
}
