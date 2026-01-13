import { HomeView } from "../views/HomeView.ts";
import { SociosView } from "../views/SociosView.ts";
import { LibrosView } from "../views/LibrosView.ts";

export const routes = {
  "/": HomeView,
  "/socios": SociosView,
  "/libros": LibrosView,
  "/404": () => "<h2>404 - Página no encontrada</h2>"
};
