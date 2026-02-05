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
    return html`
    <div class="home-container">
      
      <div class="section-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h2>Gestión de Libros</h2>
            <p>Administra y edita el inventario</p>
        </div>
        <button id="add-book-btn" class="btn btn-primary">
            + Nuevo Libro
        </button>
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

      <dialog id="create-modal" class="modal">
        <div class="modal-content" style="text-align: left;">
          <h3 style="margin-bottom: 1rem;">Nuevo Libro</h3>
          <form id="create-book-form" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group">
              <label>ISBN</label>
              <input type="text" name="isbn" class="input-field" required placeholder="Ej: 978-1234567890">
            </div>
            <div class="form-group">
              <label>Título</label>
              <input type="text" name="titulo" class="input-field" required>
            </div>
            <div class="form-group">
              <label>Autor</label>
              <input type="text" name="autor" class="input-field" required>
            </div>
            <div class="form-group">
              <label>Género</label>
              <select name="genero" class="input-field">
                <option value="Novela">Novela</option>
                <option value="Ciencia Ficción">Ciencia Ficción</option>
                <option value="Terror">Terror</option>
                <option value="Ensayo">Ensayo</option>
                <option value="Técnico">Técnico</option>
              </select>
            </div>

            <div class="modal-actions" style="justify-content: flex-end; margin-top: 1rem;">
              <button type="button" id="cancel-create-btn" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
    `;
  }

  async afterRender(): Promise<void> {
    const tbody = document.getElementById('libros-tbody');
    const deleteModal = document.getElementById('delete-modal') as HTMLDialogElement;
    const createModal = document.getElementById('create-modal') as HTMLDialogElement;

    if (!tbody || !deleteModal || !createModal) return;

    // 1. Cargar tabla inicialmente
    await this.loadTable();

    // LOGICA DE CREACION
    const addBookBtn = document.getElementById('add-book-btn');
    const createForm = document.getElementById('create-book-form') as HTMLFormElement;
    const cancelCreateBtn = document.getElementById('cancel-create-btn');

    // Abrir modal crear
    addBookBtn?.addEventListener('click', () => {
        createForm.reset();
        createModal.showModal();
    });

    // Cancelar crear
    cancelCreateBtn?.addEventListener('click', () => createModal.close());

    // Submit crear
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(createForm);
        
        const newBook = {
            isbn: formData.get('isbn') as string,
            titulo: formData.get('titulo') as string,
            autor: formData.get('autor') as string,
            genero: formData.get('genero') as string
        };

        const success = await this.libroService.createBook(newBook);
        
        if (success) {
            createModal.close();
            this.loadTable(); // Recargamos la tabla para ver el nuevo libro
        } else {
            alert("Error al crear libro. Revisa los datos.");
        }
    });

    // LOGICA DE BORRADO
    const cancelDeleteBtn = document.getElementById('cancel-btn');
    const confirmDeleteBtn = document.getElementById('confirm-btn');

    // Event delegation para abrir modal borrar
    tbody.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.delete-trigger');
      if (target) {
        this.currentDeleteId = Number(target.getAttribute('data-id'));
        deleteModal.showModal();
      }
    });

    // Cancelar borrar
    cancelDeleteBtn?.addEventListener('click', () => {
      deleteModal.close();
      this.currentDeleteId = null;
    });

    // Confirmar borrar
    confirmDeleteBtn?.addEventListener('click', async () => {
      if (this.currentDeleteId) {
        const success = await this.libroService.deleteBook(this.currentDeleteId);
        if (success) {
          // Recargamos tabla para asegurar consistencia.
          document.getElementById(`row-${this.currentDeleteId}`)?.remove();
          deleteModal.close();
        } else {
          alert("Error al eliminar");
        }
      }
    });
  }

  private async loadTable() {
    const tbody = document.getElementById('libros-tbody');
    if (!tbody) return;

    try {
      const books = await this.libroService.getAllBooks();
      tbody.innerHTML = '';

      if (books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 1rem;">No hay libros disponibles</td></tr>';
        return;
      }

      books.forEach(book => {
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
    } catch (error) {
      console.error(error);
      tbody.innerHTML = '<tr><td colspan="5" class="error">No se ha podido cargar los libros</td></tr>';
    }
  }
}