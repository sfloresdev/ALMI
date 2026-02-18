import { Component } from "../components/Component";
import { LibrosService } from "../services/LibroService";
import type { Libro } from "../../shared/types";

const html = String.raw;

export class LibrosView extends Component {
  private libroService: LibrosService
  private currentDeleteId: number | null = null;
  private currentEditId: number | null = null;

  private allBooksCache: Libro[] = [];

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
        
        <div style="display: flex; gap: 1rem;">
             <select id="genre-filter" class="input-field" style="width: auto; min-width: 150px; cursor: pointer; background-color: #111;">
                <option value="todos">Todos los géneros</option>
                </select>

            <button id="add-book-btn" class="btn btn-primary">
                + Nuevo Libro
            </button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
              <tr>
                <th>ISBN</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Género</th> <th>Estado</th> 
                <th class="text-right">Acciones</th>
              </tr>
          </thead>
          <tbody id="libros-tbody">
              <tr><td colspan="6" class="loader" style="text-align: center; padding: 2rem;">Cargando catálogo...</td></tr>
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
          <h3 id="modal-title" style="margin-bottom: 1rem;">Nuevo Libro</h3>
          
          <form id="create-book-form" style="display: flex; flex-direction: column; gap: 1rem;">
            
            <div class="form-group">
              <label>ISBN</label>
              <input type="text" id="input-isbn" name="isbn" class="input-field" required placeholder="Ej: 978-1234567890">
            </div>
            
            <div class="form-group">
              <label>Título</label>
              <input type="text" id="input-titulo" name="titulo" class="input-field" required>
            </div>
            
            <div class="form-group">
              <label>Autor</label>
              <input type="text" id="input-autor" name="autor" class="input-field" required>
            </div>
            
            <div class="form-group">
              <label>Género</label>
              <input type="text" 
                     name="genero" 
                     id="input-genero" 
                     class="input-field" 
                     list="genre-suggestions" 
                     placeholder="Escribe o selecciona..."
                     required>
              <datalist id="genre-suggestions"></datalist>
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
    const genreFilter = document.getElementById('genre-filter') as HTMLSelectElement;

    // Modales
    const deleteModal = document.getElementById('delete-modal') as HTMLDialogElement;
    const createModal = document.getElementById('create-modal') as HTMLDialogElement;
    const modalTitle = document.getElementById('modal-title');

    if (!tbody || !deleteModal || !createModal) return;

    // 1. Cargar tabla inicialmente
    await this.loadInitialData();

    genreFilter?.addEventListener('change', async () => {
      const genero = genreFilter.value;
      if (genero === 'todos') {
        // Si selecciona todos, tiramos de cache o recargamos todo
        this.renderTable(this.allBooksCache);
      } else {
        // Si selecciona un género, llamamos al endpoint específico
        const filteredBooks = await this.libroService.getBooksByGenre(genero);
        this.renderTable(filteredBooks);
      }
    });

    // LOGICA DE CREACION
    const addBookBtn = document.getElementById('add-book-btn');
    const createForm = document.getElementById('create-book-form') as HTMLFormElement;
    const cancelCreateBtn = document.getElementById('cancel-create-btn');

    // Abrir modal crear
    addBookBtn?.addEventListener('click', () => {
      this.currentEditId = null; // Reseteamos ID
      createForm.reset();
      if (modalTitle) modalTitle.textContent = "Nuevo Libro";
      createModal.showModal();
    });

    // Cancelar crear
    cancelCreateBtn?.addEventListener('click', () => createModal.close());

    // Submit (Crear o Editar)
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(createForm);

      const bookData = {
        isbn: formData.get('isbn') as string,
        titulo: formData.get('titulo') as string,
        autor: formData.get('autor') as string,
        genero: formData.get('genero') as string
      };

      let success;

      // 4. LÓGICA CONDICIONAL: ¿Editamos o Creamos?
      if (this.currentEditId) {
        success = await this.libroService.updateBook(this.currentEditId, bookData);
      } else {
        success = await this.libroService.createBook(bookData);
      }

      if (success) {
        createModal.close();
        await this.loadInitialData();
        genreFilter.value = 'todos'
      } else {
        alert("Error al guardar libro.");
      }
    });

    // LOGICA DE BORRADO Y EDICIÓN (Event Delegation)
    const cancelDeleteBtn = document.getElementById('cancel-btn');
    const confirmDeleteBtn = document.getElementById('confirm-btn');

    tbody.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement);

      // A. Click en BORRAR
      const deleteTrigger = target.closest('.delete-trigger');
      if (deleteTrigger) {
        this.currentDeleteId = Number(deleteTrigger.getAttribute('data-id'));
        deleteModal.showModal();
        return;
      }

      // B. Click en EDITAR (AÑADIDO)
      const editTrigger = target.closest('.edit-trigger') as HTMLElement;
      if (editTrigger) {
        this.currentEditId = Number(editTrigger.dataset.id);

        // Rellenamos el formulario leyendo los datos del botón
        (document.getElementById('input-isbn') as HTMLInputElement).value = editTrigger.dataset.isbn || '';
        (document.getElementById('input-titulo') as HTMLInputElement).value = editTrigger.dataset.titulo || '';
        (document.getElementById('input-autor') as HTMLInputElement).value = editTrigger.dataset.autor || '';
        (document.getElementById('input-genero') as HTMLInputElement).value = editTrigger.dataset.genero || '';

        if (modalTitle) modalTitle.textContent = "Editar Libro";
        createModal.showModal();
      }
    });

    cancelDeleteBtn?.addEventListener('click', () => {
      deleteModal.close();
      this.currentDeleteId = null;
    });

    confirmDeleteBtn?.addEventListener('click', async () => {
      if (this.currentDeleteId) {
        const success = await this.libroService.deleteBook(this.currentDeleteId);
        if (success) {
          document.getElementById(`row-${this.currentDeleteId}`)?.remove();
          deleteModal.close();
        } else {
          alert("Error al eliminar");
        }
      }
    });
  }

  // Carga inicial: Para rellenar el select
  private async loadInitialData() {
    try {
      this.allBooksCache = await this.libroService.getAllBooks();
      this.populateFilters();
      this.renderTable(this.allBooksCache);
    } catch (e) {
      console.error(e);
    }
  }
  // Rellena el select con los generos de manera unica
  private populateFilters() {
    const select = document.getElementById('genre-filter') as HTMLSelectElement;
    const datalist = document.getElementById('genre-suggestions'); // Para el modal de crear

    if (!select) return;

    const generos = Array.from(new Set(this.allBooksCache.map(b => b.genero).filter(g => g)));
    generos.sort();

    // Rellenar Select de Filtro
    select.innerHTML = '<option value="todos">Todos los géneros</option>';
    generos.forEach(g => {
      select.innerHTML += `<option value="${g}">${g}</option>`;
    });

    // Rellenar Datalist del Modal (Sugerencias)
    if (datalist) {
      datalist.innerHTML = '';
      generos.forEach(g => {
        datalist.innerHTML += `<option value="${g}"></option>`;
      });
    }
  }

  private renderTable(books: Libro[]) {
    const tbody = document.getElementById('libros-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (books.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 1rem;">No se encontraron libros</td></tr>';
      return;
    }

    books.forEach(book => {
      const isAvailable = Boolean(book.disponible);
      const statusClass = isAvailable ? 'status-available' : 'status-unavailable';
      const statusText = isAvailable ? 'Disponible' : 'Prestado';

      const rowHTML = html`
        <tr id="row-${book.id}">
           <td style="font-family: monospace; font-size: 0.9em;">${book.isbn}</td>
           <td style="font-weight: 500;">${book.titulo}</td>
           <td style="color: var(--text-secondary);">${book.autor}</td>
           <td><span style="font-size: 0.85em; background: #222; padding: 2px 6px; border-radius: 4px;">${book.genero}</span></td>
           <td>
              <span class="status-badge ${statusClass}">${statusText}</span>
           </td>
           <td class="text-right">
              <button class="btn-icon edit-trigger" 
                      title="Editar"
                      data-id="${book.id}"
                      data-isbn="${book.isbn}"
                      data-titulo="${book.titulo}"
                      data-autor="${book.autor}"
                      data-genero="${book.genero}">
                  ✏️
              </button>
              <button class="btn-icon delete-trigger" data-id="${book.id}" title="Eliminar">🗑️</button>
           </td>
        </tr>
      `;
      tbody.insertAdjacentHTML('beforeend', rowHTML);
    });
  }
}