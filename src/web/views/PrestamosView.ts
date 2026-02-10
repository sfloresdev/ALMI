import { Component } from "../components/Component";
import { PrestamoService } from "../services/PrestamoService";
import { SociosService } from "../services/SocioService";
import type { Prestamo, Libro, Socio } from "../../shared/types";
import { LibrosService } from "../services/LibroService";

const html = String.raw;
export class PrestamosView extends Component {

	private prestamoService: PrestamoService;
	private socioService: SociosService;
	private libroService: LibrosService;

	constructor() {
		super()
		this.prestamoService = new PrestamoService();
		this.socioService = new SociosService();
		this.libroService = new LibrosService();
	}

	render(): string {
		return html`
        <div class="home-container">
            <div class="section-header" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2>Préstamos Activos</h2>
                    <p>Control de libros prestados</p>
                </div>
                <button id="new-loan-btn" class="btn btn-primary">
                    + Nuevo Préstamo
                </button>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Libro</th>
                            <th>Socio</th>
                            <th>Fecha Inicio</th>
                            <th class="text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="prestamos-tbody">
                        <tr><td colspan="5" class="loader" style="text-align: center; padding: 2rem;">Cargando préstamos...</td></tr>
                    </tbody>
                </table>
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
                            <label>Libro (Solo Disponibles)</label>
                            <select id="libro-select" name="libro_id" class="input-field" required>
                                <option value="">Cargando libros...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Fecha Préstamo</label>
                            <input type="date" id="fecha-inicio" name="fecha_inicio" class="input-field" required readonly>
                        </div>

                        <div class="modal-actions" style="justify-content: flex-end; margin-top: 1rem;">
                            <button type="button" id="cancel-loan-btn" class="btn btn-secondary">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Confirmar</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>`;
	}

	async afterRender(): Promise<void> {
		const tbody = document.getElementById('prestamos-tbody');
		const modal = document.getElementById('loan-modal') as HTMLDialogElement;
		const form = document.getElementById('loan-form') as HTMLFormElement;
		const newLoanBtn = document.getElementById('new-loan-btn');
		const cancelBtn = document.getElementById('cancel-loan-btn');

		if (!tbody || !modal) return;

		// 2. Cargar datos iniciales de la tabla
		await this.loadPrestamosActivos();

		// 3. EVENTO: Abrir Modal
		newLoanBtn?.addEventListener('click', async () => {
			form.reset();

			const today = new Date().toISOString().split('T')[0];
			(document.getElementById('fecha-inicio') as HTMLInputElement).value = today;

			modal.showModal();

			// Cargamos los desplegables
			await this.loadSelectOptions();
		});

		// 4. Cerrar Modal
		cancelBtn?.addEventListener('click', () => modal.close());

		// 5. Enviar Formulario (Crear Préstamo)
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = new FormData(form);

			// Preparamos los datos
			// Nota: Aquí usamos Omit<Prestamo, 'id'>, así que construimos el objeto
			const nuevoPrestamo = {
				libroId: Number(formData.get('libro_id')),
				socioId: Number(formData.get('socio_id')),
				fechaPrestamo: formData.get('fecha_inicio') as string,
				fechaLimite: "" // Opcional, depende de tu lógica
			};

			const success = await this.prestamoService.createPrestamo(nuevoPrestamo);

			if (success) {
				modal.close();
				await this.loadPrestamosActivos(); // Recargar tabla
				alert("Préstamo registrado correctamente.");
			} else {
				alert("Error al registrar el préstamo.");
			}
		});

		// 6. Devolver Libro
		tbody.addEventListener('click', async (e) => {
			const target = (e.target as HTMLElement).closest('.return-trigger');

			if (target) {
				const id = Number(target.getAttribute('data-id'));

				// Usamos prompt para pedir comentario opcional
				const comentario = prompt("¿Confirmar devolución? Puedes añadir un comentario (opcional):", "Devolución correcta");

				if (comentario !== null) {
					const success = await this.prestamoService.createDevolucion(id, comentario);

					if (success) {
						// Eliminamos la fila visualmente para que sea rápido
						target.closest('tr')?.remove();
						// Opcional: await this.loadPrestamosActivos();
					} else {
						alert("Error al procesar la devolución.");
					}
				}
			}
		});
	}

	private async loadPrestamosActivos() {
		const tbody = document.getElementById('prestamos-tbody');
		if (!tbody) return;

		try {
			const prestamos = await this.prestamoService.getPrestamosActivos();
			tbody.innerHTML = '';

			if (prestamos.length === 0) {
				tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">No hay préstamos activos.</td></tr>';
				return;
			}
			prestamos.forEach((p: any) => {
				const fecha = p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString() : '-';

				const rowHTML = html`
                <tr>
                    <td><span class="id-badge">#${p.id}</span></td>
                    <td class="font-medium">
                        ${p.libro_titulo || p.libroTitulo || 'Libro ID ' + (p.libro_id || p.libroId)}
                    </td>
                    <td>
                        ${p.socio_nombre || p.socioNombre || 'Socio ID ' + (p.socio_id || p.socioId)}
                    </td>
                    <td>${fecha}</td>
                    <td class="text-right">
                        <button class="btn return-trigger" 
                                style="font-size: 0.8rem; padding: 0.3rem 0.8rem;"
                                data-id="${p.id}">
                            Devolver ↩️
                        </button>
                    </td>
                </tr>
              `;
				tbody.insertAdjacentHTML('beforeend', rowHTML);
			});
		} catch (error) {
			tbody.innerHTML = '<tr><td colspan="5" class="error-cell">Error cargando datos</td></tr>';
		}
	}

	private async loadSelectOptions() {
		const socioSelect = document.getElementById('socio-select') as HTMLSelectElement;
		const libroSelect = document.getElementById('libro-select') as HTMLSelectElement;

		if (!socioSelect || !libroSelect) return;

		// 1. Cargar Socios
		try {
			const socios = await this.socioService.getAllSocios();
			socioSelect.innerHTML = '<option value="">Selecciona un socio...</option>';
			socios.forEach((s: Socio) => {
				socioSelect.innerHTML += `<option value="${s.id}">${s.nombre} ${s.apellidos}</option>`;
			});
		} catch (e) {
			socioSelect.innerHTML = '<option>Error cargando socios</option>';
		}

		// 2. Cargar Libros
		try {
			const libros = await this.libroService.getAllBooks();
			// Filtramos solo libros con disponible === true (o 1)
			const disponibles = libros.filter((l: Libro) => l.disponible);

			libroSelect.innerHTML = '<option value="">Selecciona un libro...</option>';
			if (disponibles.length === 0) {
				libroSelect.innerHTML += '<option disabled>No hay libros disponibles</option>';
			} else {
				disponibles.forEach((l: Libro) => {
					libroSelect.innerHTML += `<option value="${l.id}">${l.titulo} (${l.isbn})</option>`;
				});
			}
		} catch (e) {
			libroSelect.innerHTML = '<option>Error cargando libros</option>';
		}
	}
}