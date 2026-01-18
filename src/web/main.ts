import { Header } from "./components/Header"
import { Footer } from "./components/Footer";
import { Router } from "./router/Router";
import { routes } from "./router/routes";


document.addEventListener('DOMContentLoaded', () => {

    const headerContainer = document.getElementById('main-header')
    const footerContainer = document.getElementById('main-footer')

    if (headerContainer) headerContainer.innerHTML = new Header().render();
    if (footerContainer) footerContainer.innerHTML = new Footer().render();

    const router = new Router(routes, "router-outlet");
    router.loadRoute();
});