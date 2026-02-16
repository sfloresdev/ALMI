import { Component } from "../components/Component";
import { PrestamoService } from "../services/PrestamoService";
import { SociosService } from "../services/SocioService";
import { LibrosService } from "../services/LibroService";
import type { Libro, Socio } from "../../shared/types";

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
                            <th>Fecha Límite</th>
                            <th class="text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="prestamos-tbody">
                        <tr><td colspan="6" class="loader" style="text-align: center; padding: 2rem;">Cargando préstamos...</td></tr>
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
        </div>`;
	}

	async afterRender(): Promise<void> {
		const tbody = document.getElementById('prestamos-tbody');
		const modal = document.getElementById('loan-modal') as HTMLDialogElement;
		const form = document.getElementById('loan-form') as HTMLFormElement;
		const newLoanBtn = document.getElementById('new-loan-btn');
		const cancelBtn = document.getElementById('cancel-loan-btn');

		const fechaInicioInput = document.getElementById('fecha-inicio') as HTMLInputElement;
		const fechaLimiteInput = document.getElementById('fecha-limite') as HTMLInputElement;

		if (!tbody || !modal) return;

		await this.loadPrestamosActivos();

		// ABRIR MODAL
		newLoanBtn?.addEventListener('click', async () => {
			form.reset();

			// Lógica de fechas (Hoy y +15 días)
			const today = new Date();
			const limit = new Date();
			limit.setDate(today.getDate() + 15);

			const todayStr = today.toISOString().split('T')[0];

			fechaInicioInput.value = todayStr;
			fechaLimiteInput.value = limit.toISOString().split('T')[0];

			fechaInicioInput.min = todayStr;
			fechaLimiteInput.min = todayStr;

			modal.showModal();

			// Cargar los desplegables
			await this.loadSelectOptions();
		});

		// Actualizar fecha límite automáticamente al cambiar inicio
		fechaInicioInput?.addEventListener('change', () => {
			if (fechaInicioInput.value) {
				fechaLimiteInput.min = fechaInicioInput.value;
				const newDate = new Date(fechaInicioInput.value);
				newDate.setDate(newDate.getDate() + 15);
				fechaLimiteInput.value = newDate.toISOString().split('T')[0];
			}
		});

		cancelBtn?.addEventListener('click', () => modal.close());

		// ENVIAR FORMULARIO
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = new FormData(form);

			// SIMPLIFICACIÓN TOTAL:
			// Al usar <select>, el valor que nos llega YA ES EL ID.
			// No hace falta buscar paréntesis ni hacer regex.
			const nuevoPrestamo = {
				libroId: Number(formData.get('libro_id')),
				socioId: Number(formData.get('socio_id')),
				fechaPrestamo: formData.get('fecha_inicio') as string,
				fechaLimite: formData.get('fecha_limite') as string
			};

			const success = await this.prestamoService.createPrestamo(nuevoPrestamo);

			if (success) {
				modal.close();
				await this.loadPrestamosActivos();
				alert("Préstamo registrado correctamente.");
			} else {
				alert("Error al registrar el préstamo.");
			}
		});

		// DEVOLVER LIBRO
		tbody.addEventListener('click', async (e) => {
			const target = (e.target as HTMLElement).closest('.return-trigger');
			if (target) {
				const id = Number(target.getAttribute('data-id'));
				const comentario = prompt("¿Confirmar devolución? Comentario (opcional):", "Devolución correcta");

				if (comentario !== null) {
					const success = await this.prestamoService.createDevolucion(id, comentario);
					if (success) {
						target.closest('tr')?.remove();
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
				tbody.innerHTML = '<tr><td colspan="6" class="empty-cell" style="text-align: center; padding: 1rem;">No hay préstamos activos.</td></tr>';
				return;
			}
			prestamos.forEach((p: any) => {
				const fInicio = p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString() : '-';
				const fLimite = p.fecha_limite ? new Date(p.fecha_limite).toLocaleDateString() : '-';

				const rowHTML = html`
                <tr>
                    <td><span class="id-badge">#${p.id}</span></td>
                    <td class="font-medium">
                        ${p.libro_titulo || 'Libro ' + p.libro_id}
                    </td>
                    <td>
                        ${p.socio_nombre || 'Socio ' + p.socio_id}
                    </td>
                    <td>${fInicio}</td>
                    <td style="color: var(--text-secondary);">${fLimite}</td>
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
			tbody.innerHTML = '<tr><td colspan="6" class="error-cell">Error cargando datos</td></tr>';
		}
	}

	// CARGA DE SELECTS (Clásico y efectivo)
	private async loadSelectOptions() {
		const socioSelect = document.getElementById('socio-select') as HTMLSelectElement;
		const libroSelect = document.getElementById('libro-select') as HTMLSelectElement;

		if (!socioSelect || !libroSelect) return;

		// 1. Cargar Socios
		try {
			const socios = await this.socioService.getAllSocios();
			socioSelect.innerHTML = '<option value="">Selecciona un socio...</option>';
			socios.forEach((s: Socio) => {
				// VALUE = ID, TEXTO = Nombre
				socioSelect.innerHTML += `<option value="${s.id}">${s.nombre} ${s.apellidos}</option>`;
			});
		} catch (e) {
			socioSelect.innerHTML = '<option value="">Error cargando socios</option>';
		}

		// 2. Cargar Libros
		try {
			const libros = await this.libroService.getAllBooks();
			const disponibles = libros.filter((l: Libro) => l.disponible);

			libroSelect.innerHTML = '<option value="">Selecciona un libro...</option>';

			if (disponibles.length === 0) {
				libroSelect.innerHTML = '<option value="" disabled>No hay libros disponibles</option>';
			} else {
				disponibles.forEach((l: Libro) => {
					// VALUE = ID, TEXTO = Título
					libroSelect.innerHTML += `<option value="${l.id}">${l.titulo} (${l.isbn})</option>`;
				});
			}
		} catch (e) {
			libroSelect.innerHTML = '<option value="">Error cargando libros</option>';
		}
	}
}