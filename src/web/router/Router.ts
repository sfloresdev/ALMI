type View = () => Promise<string> | string;

export class Router {
  private routes: Record<string, View>;
  private outlet: HTMLElement;

  constructor(routes: Record<string, View>, outletId: string) {
    const el = document.getElementById(outletId);
    if (!el) throw new Error("View outlet not found");

    this.routes = routes;
    this.outlet = el;

    window.addEventListener("popstate", () => this.loadRoute());
    document.addEventListener("click", this.handleLinkClick.bind(this));
  }

  async loadRoute(path = window.location.pathname) {
    const view = this.routes[path] || this.routes["/404"];
    this.outlet.innerHTML = await view();
  }

  navigate(path: string) {
    history.pushState({}, "", path);
    this.loadRoute(path);
  }

  private handleLinkClick(e: Event) {
    const target = e.target as HTMLElement;
    if (target.matches("[data-link]")) {
      e.preventDefault();
      this.navigate(target.getAttribute("href")!);
    }
  }
}
