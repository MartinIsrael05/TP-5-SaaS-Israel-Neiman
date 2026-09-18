import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import Wordmark from "@/components/ui/Wordmark";
import { getCurrentUser } from "@/lib/firebase/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#0F1115] p-4">
      <Link
        className="absolute left-8 top-8 flex items-center gap-2 text-sm text-[#9CA3AF] transition-colors hover:text-[#F3F4F6]"
        href="/"
      >
        <ArrowLeft size={16} />
        Volver al inicio
      </Link>
      <Wordmark className="mb-8" rule size="lg" />
      <LoginForm />
    </main>
  );
}
