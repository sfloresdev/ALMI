import { Component } from "../components/Component";

type ViewConstructor = new () => Component;

export class Router {
  private routes: Record<string, ViewConstructor>;
  private outlet: HTMLElement;

  constructor(routes: Record<string, ViewConstructor>, outletId: string) {
    const el = document.getElementById(outletId);
    if (!el) throw new Error("View outlet not found");

    this.routes = routes;
    this.outlet = el;

    window.addEventListener("popstate", () => this.loadRoute());
    document.addEventListener("click", this.handleLinkClick.bind(this));
  }

  async loadRoute(path = window.location.pathname) {
    const ViewClass = this.routes[path] || this.routes["/404"];
    if (!ViewClass) {
      this.outlet.innerHTML = "<h2>404 - Ruta no definida</h2>";
      return;
    }

    const viewInstance = new ViewClass();
    this.outlet.innerHTML = viewInstance.render();
    if (viewInstance.afterRender) {
      await viewInstance.afterRender();
    }
  }

  navigate(path: string) {
    history.pushState({}, "", path);
    this.loadRoute(path);
  }

  private handleLinkClick(e: Event) {
    const target = (e.target as HTMLElement).closest("a");

    if (target && target.matches("[data-link]")) {
      e.preventDefault();
      const href = target.getAttribute("href")
      if (href) this.navigate(href);
    }
  }
}
