import PageTransition from "@/components/ui/PageTransition";

// Se remonta en cada navegacion (a diferencia de layout.js), asi el fade corre por ruta.
export default function DashboardTemplate({ children }) {
  return <PageTransition>{children}</PageTransition>;
}
