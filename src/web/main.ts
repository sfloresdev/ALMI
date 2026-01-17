import { Header } from "./components/Header"
import { Footer } from "./components/Footer";
import { HomeView } from "./views/HomeView";


document.addEventListener('DOMContentLoaded', () => {

    const headerContainer = document.getElementById('main-header')
    if (headerContainer) {
        const header = new Header();
        headerContainer.innerHTML = header.render();
        if (header.afterRender) header.afterRender();
    } else
        console.log('No se encontró el elemento header')

    const routerContainer = document.getElementById('router-outlet');
    if (routerContainer) {
        const home = new HomeView();
        routerContainer.innerHTML = home.render()
        if (home.afterRender) home.afterRender();
    } else
        console.log('No se cargó el elemento home');

    const footerContainer = document.getElementById('main-footer')
    if (footerContainer) {
        const footer = new Footer();
        footerContainer.innerHTML = footer.render();
    } else
        console.log('No se encontró el elemento footer')
});