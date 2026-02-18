import { Component } from "../components/Component";
import { LibrosService } from "../services/LibroService";
import { PrestamoService } from "../services/PrestamoService";
import type { Libro, Socio } from "../../shared/types";
import { SociosService } from "../services/SocioService";

const html = String.raw;

export class HomeView extends Component {
	private libroService: LibrosService;
	private prestamoService: PrestamoService;
	private socioService: SociosService;

	// Filtrar los libros en memoria sin llamar a la API constantemente
	private allBooks: Libro[] = [];

	constructor() {
		super();
		this.libroService = new LibrosService();
		this.prestamoService = new PrestamoService();
		this.socioService = new SociosService();
	}

	render(): string {
		return html`
        <div class="home-container">
            <div class="section-header" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2>Catálogo</h2>
                    <p>Explora las adquisiciones</p>
                </div>
                
                <div style="display: flex; gap: 1rem; align-items: center;">
					<input type="text" 
						id="book-search" 
						placeholder="Buscar por título..." 
						class="input-field" 
						style="width: 200px;">
                    <select id="genre-filter" class="input-field" style="width: auto; min-width: 150px; cursor: pointer; background-color: #111;">
                        <option value="todos">Todos los géneros</option>
                    </select>
                </div>
				
            </div>

            <div id="books-grid" class="books-grid">
                <div class="loader">Cargando catálogo...</div>
            </div>

            <dialog id="loan-modal" class="modal">
                <div class="modal-content" style="text-align: left; min-width: 350px;">
                    <h3 style="margin-bottom: 1rem;">Registrar Préstamo</h3>
                    
                    <form id="loan-form" style="display: flex; flex-direction: column; gap: 1rem;">
                        
                        <div class="form-group">
                            <label>Socio</label>
                            <select id="socio-select" name="socio_id" class="input-field" required>
                                <option value="">Cargando socios...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Libro</label>
                            <select id="libro-select" name="libro_id" class="input-field" required>
                                <option value="">Cargando libros...</option>
                            </select>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Fecha Préstamo</label>
                                <input type="date" id="fecha-inicio" name="fecha_inicio" class="input-field" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Fecha Límite</label>
                                <input type="date" id="fecha-limite" name="fecha_limite" class="input-field" required>
                            </div>
                        </div>

                        <div class="modal-actions" style="justify-content: flex-end; margin-top: 1rem;">
                            <button type="button" id="cancel-loan-btn" class="btn btn-secondary">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Confirmar</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
        `;
	}

	async afterRender() {
		const gridContainer = document.getElementById('books-grid');
		const genreFilter = document.getElementById('genre-filter') as HTMLSelectElement;

		// Referencias del Modal
		const modal = document.getElementById('loan-modal') as HTMLDialogElement;
		const form = document.getElementById('loan-form') as HTMLFormElement;
		const cancelBtn = document.getElementById('cancel-loan-btn');
		const fechaInicioInput = document.getElementById('fecha-inicio') as HTMLInputElement;
		const fechaLimiteInput = document.getElementById('fecha-limite') as HTMLInputElement;
		const libroSelect = document.getElementById('libro-select') as HTMLSelectElement;

		if (!gridContainer || !modal) return;

		// 1. CARGAR CATÁLOGO
		await this.loadInitialData();

		genreFilter?.addEventListener('change', () => {
			this.renderGrid(genreFilter.value);
		});

		const searchInput = document.getElementById('book-search') as HTMLInputElement;

		searchInput?.addEventListener('input', async () => {
			const query = searchInput.value.trim();

			if (query.length >= 2) {
				// Llamamos al backend con el término
				const results = await this.libroService.searchBooks(query);
				this.renderGridWithData(results); // Usamos un helper para pintar
			} else if (query.length === 0) {
				// Si borra todo, mostramos el catálogo completo de nuevo
				this.renderGrid('todos');
			}
		});

		// 2. LÓGICA DEL MODAL (EVENT DELEGATION EN EL GRID)
		gridContainer.addEventListener('click', async (e) => {
			// Detectar clic en el botón "Prestar"
			const trigger = (e.target as HTMLElement).closest('.loan-trigger');

			if (trigger) {
				const bookId = trigger.getAttribute('data-id');
				form.reset();

				// Configurar Fechas
				const today = new Date();
				const limit = new Date();
				limit.setDate(today.getDate() + 15);

				const todayStr = today.toISOString().split('T')[0];

				fechaInicioInput.value = todayStr;
				fechaInicioInput.min = todayStr; // Bloquear pasado

				fechaLimiteInput.value = limit.toISOString().split('T')[0];
				fechaLimiteInput.min = todayStr;

				// Cargar datos en los selects
				await this.loadSelectOptions();

				// TRUCO UX: Pre-seleccionar el libro que acabamos de clicar
				if (bookId && libroSelect) {
					libroSelect.value = bookId;
				}

				modal.showModal();
			}
		});

		// 3. ACTUALIZAR FECHA LÍMITE DINÁMICAMENTE
		fechaInicioInput?.addEventListener('change', () => {
			if (fechaInicioInput.value) {
				fechaLimiteInput.min = fechaInicioInput.value;
				const newDate = new Date(fechaInicioInput.value);
				newDate.setDate(newDate.getDate() + 15);
				fechaLimiteInput.value = newDate.toISOString().split('T')[0];
			}
		});

		// 4. CERRAR MODAL
		cancelBtn?.addEventListener('click', () => modal.close());

		// 5. ENVIAR PRÉSTAMO
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = new FormData(form);

			const nuevoPrestamo = {
				libroId: Number(formData.get('libro_id')),
				socioId: Number(formData.get('socio_id')),
				fechaPrestamo: formData.get('fecha_inicio') as string,
				fechaLimite: formData.get('fecha_limite') as string
			};

			const success = await this.prestamoService.createPrestamo(nuevoPrestamo);

			if (success) {
				modal.close();
				alert("Préstamo realizado con éxito ");
				// Recargamos el catálogo para actualizar el estado
				await this.loadInitialData();
				this.renderGrid(genreFilter.value);
			} else {
				alert("Error al realizar el préstamo.");
			}
		});
	}

	private renderGridWithData(books: Libro[]) {
		const container = document.getElementById('books-grid');
		if (!container) return;
		container.innerHTML = '';

		if (books.length === 0) {
			container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No se encontraron libros.</p>';
			return;
		}
		books.forEach(book => {
			container.insertAdjacentHTML('beforeend', this.generateBookCard(book));
		});
	}

	private async loadInitialData() {
		const container = document.getElementById('books-grid');
		try {
			// Cargamos todos los libros en memoria
			this.allBooks = await this.libroService.getAllBooks();

			// Rellenamos el selector de géneros automáticamente
			this.populateGenreSelect();

			// Renderizamos todo por defecto
			this.renderGrid('todos');
		} catch (Error) {
			console.error(Error);
			if (container) container.innerHTML = '<p class="error"> No se ha podido cargar los libros </p>';
		}
	}

	private populateGenreSelect() {
		const select = document.getElementById('genre-filter') as HTMLSelectElement;
		if (!select) return;

		// Obtenemos géneros únicos usando un Set
		const generos = Array.from(new Set(this.allBooks.map(b => b.genero).filter(g => g)));
		const currentVal = select.value;

		select.innerHTML = '<option value="todos">Todos los géneros</option>';
		generos.sort().forEach(g => {
			select.innerHTML += `<option value="${g}">${g}</option>`;
		});

		if (currentVal && generos.includes(currentVal)) {
			select.value = currentVal;
		}
	}

	private async loadCatalog(container: HTMLElement) {
		try {
			const books = await this.libroService.getAllBooks();
			container.innerHTML = '';

			if (books.length === 0) {
				container.innerHTML = '<p> No hay libros disponibles </p>';
				return;
			}

			books.forEach(book => {
				const cardHTML = this.generateBookCard(book);
				container.insertAdjacentHTML('beforeend', cardHTML);
			});

		} catch (Error) {
			console.error(Error);
			container.innerHTML = '<p class="error"> No se ha podido cargar los libros </p>'
		}
	}

	private renderGrid(filter: string) {
		const container = document.getElementById('books-grid');
		if (!container) return;

		container.innerHTML = '';

		// Filtramos en memoria
		const filtered = filter === 'todos'
			? this.allBooks
			: this.allBooks.filter(b => b.genero === filter);

		if (filtered.length === 0) {
			container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No hay libros en esta categoría.</p>';
			return;
		}

		filtered.forEach(book => {
			const cardHTML = this.generateBookCard(book);
			container.insertAdjacentHTML('beforeend', cardHTML);
		});
	}

	private generateBookCard(book: Libro): string {
		const coverUrl = this.libroService.getCoverUrl(book.isbn, 'M');
		const statusClass = book.disponible ? 'status-available' : 'status-unavailable';
		const statusText = book.disponible ? 'Disponible' : 'Prestado';

		const fallbackImage = this.libroService.getPlaceHolderImage();

		return html`
		<article class="book-card">
		<div class="card-cover">
			<img src="${coverUrl}" 
					alt="${book.titulo}" 
					loading="lazy"
					onerror="this.onerror=null;this.src='${fallbackImage}'">
			<span class="status-badge ${statusClass}">${statusText}</span>
		</div>
		
		<div class="card-content">
			<span class="book-genre">${book.genero}</span>
			<h3 class="book-title" title="${book.titulo}">${book.titulo}</h3>
			<p class="book-author">${book.autor}</p>
		</div>
		
		<div class="card-actions">
			<button class="btn ${book.disponible ? 'loan-trigger' : 'btn-disabled'}" ${book.disponible ? '' : 'disabled'} data-id="${book.id}">
				${book.disponible ? 'Prestar' : 'No disponible'}
			</button>
		</div>
		</article>
		`;
	}
	private async loadSelectOptions() {
		const socioSelect = document.getElementById('socio-select') as HTMLSelectElement;
		const libroSelect = document.getElementById('libro-select') as HTMLSelectElement;

		if (!socioSelect || !libroSelect) return;

		// Cargar Socios
		try {
			const socios = await this.socioService.getAllSocios();
			socioSelect.innerHTML = '<option value="">Selecciona un socio...</option>';
			socios.forEach((s: Socio) => {
				socioSelect.innerHTML += `<option value="${s.id}">${s.nombre} ${s.apellidos}</option>`;
			});
		} catch (e) {
			socioSelect.innerHTML = '<option>Error cargando socios</option>';
		}

		// Cargar Libros (Aunque ya sepamos cuál es, cargamos la lista por si quiere cambiar)
		try {
			const libros = await this.libroService.getAllBooks();
			// Solo mostramos los disponibles
			const disponibles = libros.filter((l: Libro) => l.disponible);

			libroSelect.innerHTML = '<option value="">Selecciona un libro...</option>';
			disponibles.forEach((l: Libro) => {
				libroSelect.innerHTML += `<option value="${l.id}">${l.titulo}</option>`;
			});
		} catch (e) {
			libroSelect.innerHTML = '<option>Error cargando libros</option>';
		}
	}
}