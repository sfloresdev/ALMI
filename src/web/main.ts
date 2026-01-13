import { Header } from "./components/Header"


document.addEventListener('DOMContentLoaded', () => {

    const headerContainer = document.getElementById('main-header')
    if (headerContainer) {
        const header = new Header();
        headerContainer.innerHTML = header.render();
        if (header.afterRender) header.afterRender();
    } else
        console.log('No se encontró el elemento header')
});