import Link from "next/link";
import { buttonClass } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0F1115] px-4 text-center">
      <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
        Error 404
      </p>
      <h1 className="mt-4 max-w-xl font-sans text-3xl font-bold leading-tight tracking-tight text-[#F3F4F6] sm:text-4xl">
        Parece que esta página no existe... o ya la cancelaste.
      </h1>
      <Link className={buttonClass("primary", "mt-8")} href="/">

        Volver al inicio
      </Link>
    </main>
  );
}
