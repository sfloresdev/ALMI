import { Component } from "../components/Component";
import { PrestamoService } from "../services/PrestamoService";
import { SociosService } from "../services/SocioService";
import { LibrosService } from "../services/LibroService";
import type { Libro, Socio, Prestamo } from "../../shared/types";

type PrestamoConEstado = Prestamo & { esHistorial: boolean }

const html = String.raw;

export class PrestamosView extends Component {

	private prestamoService: PrestamoService;
	private socioService: SociosService;
	private libroService: LibrosService;

	private allLoans: PrestamoConEstado[] = [];

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
                    <h2>Gestión de Préstamos</h2>
                    <p>Control y devoluciones</p>
                </div>
                
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <select id="filter-loans" class="input-field" style="width: auto; cursor: pointer; background-color: #111;">
                        <option value="activos">Activos</option>
                        <option value="vencidos">Vencidos (Fuera de plazo)</option>
                        <option value="historial">Historial (Devueltos)</option>
                        <option value="todos">Todos</option>
                    </select>

                    <button id="new-loan-btn" class="btn btn-primary">
                        + Nuevo Préstamo
                    </button>
                </div>
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
                            <th>Estado</th>
                            <th class="text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="prestamos-tbody">
                        <tr><td colspan="7" class="loader" style="text-align: center; padding: 2rem;">Cargando préstamos...</td></tr>
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
		const filterSelect = document.getElementById('filter-loans') as HTMLSelectElement;
		const modal = document.getElementById('loan-modal') as HTMLDialogElement;
		const form = document.getElementById('loan-form') as HTMLFormElement;
		const newLoanBtn = document.getElementById('new-loan-btn');
		const cancelBtn = document.getElementById('cancel-loan-btn');

		const fechaInicioInput = document.getElementById('fecha-inicio') as HTMLInputElement;
		const fechaLimiteInput = document.getElementById('fecha-limite') as HTMLInputElement;

		if (!tbody || !modal) return;

		await this.loadAllData();
		this.renderTable();

		filterSelect?.addEventListener('change', () => {
			console.log("Cambiando filtro a:", filterSelect.value); // Debug
			this.renderTable(filterSelect.value);
		});

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

			const nuevoPrestamo = {
				libroId: Number(formData.get('libro_id')),
				socioId: Number(formData.get('socio_id')),
				fechaPrestamo: formData.get('fecha_inicio') as string,
				fechaLimite: formData.get('fecha_limite') as string
			};

			const success = await this.prestamoService.createPrestamo(nuevoPrestamo);

			if (success) {
				modal.close();
				await this.loadAllData();
				filterSelect.value = 'activos';
				this.renderTable('activos');
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
					try {
						// 1. Ejecutamos la acción en el servidor
						const result = await this.prestamoService.createDevolucion(id, comentario);

						if (result.success) {
							// 2. IMPORTANTE: Esperamos a que los datos se recarguen de verdad
							await this.loadAllData();

							// 3. Repintamos la tabla con el filtro actual
							this.renderTable(filterSelect.value);

							console.log(`Devolución del préstamo #${id} completada.`);
						} else {
							alert("Error del servidor: " + result.message);
							(target as HTMLButtonElement).disabled = false; // Re-habilitar si falló
						}
					} catch (err) {
						console.error("Fallo en la comunicación con el Service:", err);
						alert("Hubo un problema de conexión al procesar la devolución.");
						(target as HTMLButtonElement).disabled = false;
					}
				} else {
					(target as HTMLButtonElement).disabled = false;
				}
			}
		});
	}

	private renderTable(filter: string = 'activos') {
		const tbody = document.getElementById('prestamos-tbody');
		if (!tbody) return;

		tbody.innerHTML = '';
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const filtered = this.allLoans.filter(loan => {
			const isReturned = loan.esHistorial;

			// Usamos 'fechaLimite' (alias del backend)
			const fLimiteStr = (loan as any).fechaLimite;
			const fLimite = fLimiteStr ? new Date(fLimiteStr) : null;

			const isOverdue = !isReturned && fLimite && fLimite < today;

			if (filter === 'activos') return !isReturned;
			if (filter === 'historial') return isReturned;
			if (filter === 'vencidos') return isOverdue;
			return true;
		});

		if (filtered.length === 0) {
			tbody.innerHTML = '<tr><td colspan="7" class="empty-cell" style="text-align: center; padding: 2rem;">No hay registros en esta categoría.</td></tr>';
			return;
		}

		filtered.forEach(p => {
			// Accedemos a las propiedades que devuelve el backend
			// El backend devuelve: fechaInicio, fechaLimite, libro_titulo, socio_nombre
			const pAny = p as any;

			const fInicio = pAny.fechaInicio ? new Date(pAny.fechaInicio).toLocaleDateString() : '-';
			const fLimite = pAny.fechaLimite ? new Date(pAny.fechaLimite).toLocaleDateString() : '-';

			// Lógica de estado (Badge)
			let badge = '';
			const fechaLimiteDate = pAny.fechaLimite ? new Date(pAny.fechaLimite) : null;

			if (p.esHistorial) {
				badge = '<span class="status-badge" style="background-color: #666;">Devuelto</span>';
			} else if (fechaLimiteDate && fechaLimiteDate < today) {
				badge = '<span class="status-badge status-unavailable">Vencido</span>';
			} else {
				badge = '<span class="status-badge status-available">Activo</span>';
			}

			// Botón de acción (solo si es activo)
			const actionBtn = !p.esHistorial
				? `<button class="btn return-trigger" style="font-size: 0.8rem; padding: 0.3rem 0.8rem;" data-id="${p.id}">Devolver ↩️</button>`
				: '<span style="color: #666; font-size: 0.8rem;">---</span>';

			const rowHTML = html`
            <tr>
                <td><span class="id-badge">#${p.id}</span></td>
                <td class="font-medium">${pAny.libro_titulo || 'Libro ' + p.libroId}</td>
                <td>${pAny.socio_nombre || 'Socio ' + p.socioId}</td>
                <td>${fInicio}</td>
                <td style="color: var(--text-secondary);">${fLimite}</td>
                <td>${badge}</td>
                <td class="text-right">${actionBtn}</td>
            </tr>`;

			tbody.insertAdjacentHTML('beforeend', rowHTML);
		});
	}

	private async loadAllData() {
		try {
			// Llamamos a ambos endpoints
			const [activos, historial] = await Promise.all([
				this.prestamoService.getPrestamosActivos(),
				this.prestamoService.getHistorialDevoluciones()
			]);

			// Mapeamos a nuestro tipo extendido PrestamoConEstado
			const activosMarcados: PrestamoConEstado[] = activos.map(p => ({ ...p, esHistorial: false }));
			const historialMarcados: PrestamoConEstado[] = historial.map(p => ({ ...p, esHistorial: true }));

			this.allLoans = [...activosMarcados, ...historialMarcados] as PrestamoConEstado[];

			// Ordenar por fecha
			this.allLoans.sort((a, b) => {
				const fechaA = new Date(a.fechaPrestamo || '').getTime();
				const fechaB = new Date(b.fechaPrestamo || '').getTime();
				return fechaB - fechaA;
			});

		} catch (error) {
			console.error("Error cargando datos", error);
			this.allLoans = [];
		}
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