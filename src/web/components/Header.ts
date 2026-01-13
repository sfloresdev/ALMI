import { Component } from "./Component";

export class Header extends Component {

    render(): string {
        return `<header class="app-header">
            <div class="header-content">
                <div class="logo">
                    <h1>📚 Biblioteca ALXI-ALMI</h1>
                </div>
                
                <nav class="main-nav">
                    <ul>
                        <li>
                            <a href="/" data-link class="nav-link">Inicio</a>
                        </li>
                        <li>
                            <a href="/socios" data-link class="nav-link">Socios</a>
                        </li>
                        <li>
                            <a href="/libros" data-link class="nav-link">Libros</a>
                        </li>
                        <li>
                            <a href="/prestamos" data-link class="nav-link">Préstamos</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>`;
    }
}