import { HomeView } from "../views/HomeView.ts";
import { SociosView } from "../views/SociosView.ts";
//import { LibrosView } from "../views/LibrosView.ts";
import { Component } from "../components/Component.ts";


class NotFoundView extends Component {
  render(): string {
    return `<div style="text-align: center; padding: 2rem;"><h2>404 - Página no encontrada</h2><a href="/" data-link>Volver al inicio</a></div>`;
  }
}

export const routes = {
  "/": HomeView,
  "/socios": SociosView,
  //"/libros": LibrosView,
  "/404": NotFoundView
};
