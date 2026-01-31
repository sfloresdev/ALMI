import { Component } from "../components/Component";
import { LibrosService } from "../services/LibroService";
import  type { Libro } from "../../shared/types";

const html = String.raw;

export class HomeView extends Component {
  private libroService: LibrosService ;

  constructor() {
    super();
    this.libroService = new LibrosService();
  }

  render(): string {
    return html`
    <div class="home-container">
      <div class="section-header">
          <h2>Catálogo </h2>
          <p>Explora las adquisiciones</p>
      </div>

      <div id="books-grid" class="books-grid">
          <div class="loader">Cargando catálogo...</div>
      </div>
    </div>
    `;
  }

  async afterRender() {
    const gridContainer = document.getElementById('books-grid');

    if (!gridContainer) return;

    try {
      const books = await this.libroService.getAllBooks();

      gridContainer.innerHTML = '';

      if (books.length === 0) {
        gridContainer.innerHTML = '<p> No hay libros disponibles </p>';
        return ;
      }

      books.forEach(book => {
        const cardHTML = this.generateBookCard(book);
        gridContainer.insertAdjacentHTML('beforeend', cardHTML);
      });

    } catch(Error) {
      console.error(Error);
      gridContainer.innerHTML = '<p class="error"> No se ha podido cargar los libros </p>'
    }

  }

  private generateBookCard(book: Libro): string {
    const coverUrl = this.libroService.getCoverUrl(book.isbn, 'M');
    const statusClass = book.disponible ? 'status-available' : 'status-unavailable';
    const statusText = book.disponible ? 'Disponible': 'Prestado';

    const fallbackImage = "";

    return html`
    <article class="book-card">
      <div class="card-cover">
          <img src="${coverUrl}" 
                alt="${book.titulo}" 
                loading="lazy"
                onerror="this.src='${fallbackImage}'">
          <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      
      <div class="card-content">
          <span class="book-genre">${book.genero}</span>
          <h3 class="book-title" title="${book.titulo}">${book.titulo}</h3>
          <p class="book-author">${book.autor}</p>
      </div>
      
      <div class="card-actions">
          <button class="btn ${book.disponible ? '' : 'btn-disabled'}" ${book.disponible ? '' : 'disabled'}>
              ${book.disponible ? 'Prestar' : 'No disponible'}
          </button>
      </div>
      </article>
      `;
  }
}