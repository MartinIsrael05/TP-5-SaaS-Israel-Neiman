import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import CookieBanner from "@/components/ui/CookieBanner";
import "./globals.css";

/*
  Los pesos son exactamente los que el DOM pide, ni uno mas ni uno menos.
  Declarar de mas hace que el navegador precargue un archivo que despues no usa
  (avisa por consola); declarar de menos lo obliga a fabricar una negrita falsa.
*/

// Jakarta sostiene la jerarquia (titulos, secciones, botones).
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Mono garantiza que importes y fechas formen columna.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "TECA",
  description: "Controla tus suscripciones y gastos recurrentes en un solo lugar.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${jakarta.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-base text-ink antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
