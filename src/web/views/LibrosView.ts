import { Component } from "../components/Component";
import { LibrosService } from "../services/LibroService";
import type { Libro } from "../../shared/types";

const html = String.raw;

export class LibrosView extends Component {
  private libroService: LibrosService
  private currentDeleteId: number | null = null;

  constructor() {
    super();
    this.libroService = new LibrosService();
  }

  render(): string {
    return html`<div class="home-container">
      
      <div class="section-header">
        <h2>Gestión de Libros</h2>
        <p>Administra y edita el inventario</p>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
              <tr>
                <th>ISBN</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Estado</th> <th class="text-right">Acciones</th>
              </tr>
          </thead>
          <tbody id="libros-tbody">
              <tr><td colspan="5" class="loader" style="text-align: center; padding: 2rem;">Cargando catálogo...</td></tr>
          </tbody>
        </table>
      </div>

      <dialog id="delete-modal" class="modal">
        <div class="modal-content">
          <h3>¿Eliminar libro?</h3>
          <p>Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button id="cancel-btn" class="btn btn-secondary">Cancelar</button>
            <button id="confirm-btn" class="btn btn-danger">Eliminar</button>
          </div>
        </div>
      </dialog>
    </div>
    `;
  }

  async afterRender(): Promise<void> {
    const tbody = document.getElementById('libros-tbody');
    const modal = document.getElementById('delete-modal') as HTMLDialogElement;
    const cancelBtn = document.getElementById('cancel-btn');
    const confirmBtn = document.getElementById('confirm-btn');

    if (!tbody || !modal) return;

    try {
      const books = await this.libroService.getAllBooks();
      tbody.innerHTML = '';

      if (books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 1rem;">No hay libros disponibles</td></tr>';
        return;
      }

      books.forEach(book => {
        // --- REUTILIZACIÓN DE LÓGICA  HOME ---
        const statusClass = book.disponible ? 'status-available' : 'status-unavailable';
        const statusText = book.disponible ? 'Disponible' : 'Prestado';

        const rowHTML = html`
          <tr id="row-${book.id}">
             <td style="font-family: monospace; font-size: 0.9em;">${book.isbn}</td>
             <td style="font-weight: 500;">${book.titulo}</td>
             <td style="color: var(--text-secondary);">${book.autor}</td>
             <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
             </td>
             <td class="text-right">
                <button class="btn-icon delete-trigger" data-id="${book.id}" title="Eliminar">🗑️</button>
             </td>
          </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', rowHTML);
      });

      // --- MODAL ---

      // 1. Abrir modal
      tbody.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement).closest('.delete-trigger');
        if (target) {
          this.currentDeleteId = Number(target.getAttribute('data-id'));
          modal.showModal();
        }
      });

      // 2. Cancelar
      cancelBtn?.addEventListener('click', () => {
        modal.close();
        this.currentDeleteId = null;
      });

      // 3. Confirmar Borrado
      confirmBtn?.addEventListener('click', async () => {
        if (this.currentDeleteId) {
          const success = await this.libroService.deleteBook(this.currentDeleteId);
          if (success) {
            document.getElementById(`row-${this.currentDeleteId}`)?.remove();
            modal.close();
          } else {
            alert("Error al eliminar");
          }
        }
      });

    } catch (error) {
      console.error(error);
      tbody.innerHTML = '<tr><td colspan="5" class="error">No se ha podido cargar los libros</td></tr>';
    }
  }
}