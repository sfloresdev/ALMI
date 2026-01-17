import { Component } from "./Component";

const html = String.raw;

export class Header extends Component {

    render(): string {
        return html`
        <header class="main-header">
            <div class="header-container">
                <div class="brand">
                    <span class="brand-icon">📚</span>
                    <h1 class="brand-name">ALMI</h1>
                </div>
                
                <nav class="nav-menu">
                    <a href="/" data-link class="nav-link">Inicio</a>
                    <a href="/socios" data-link class="nav-link">Socios</a>
                    <a href="/libros" data-link class="nav-link">Libros</a>
                    <a href="/prestamos" data-link class="nav-link">Préstamos</a>
                </nav>
            </div>
        </header>`;
    }

    afterRender(): void {
    }
}