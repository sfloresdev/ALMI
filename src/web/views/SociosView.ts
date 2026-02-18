import { Component } from "../components/Component";
import { SociosService } from "../services/SocioService";
import { PrestamoService } from "../services/PrestamoService";
import type { Socio } from "../../shared/types";

const html = String.raw;
export class SociosView extends Component {

  private sociosService: SociosService;
  private prestamoService: PrestamoService;

  constructor() {
    super();
    this.sociosService = new SociosService();
    this.prestamoService = new PrestamoService();
  }

  render(): string {
    return html`
    <div class="home-container">
      <div class="section-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>  
            <h2>Gestión de Socios</h2>
            <p>Listado completo de miembros</p>
          </div>
          <button id="add-socio-btn" class="btn btn-primary">
            + Nuevo Socio
          </button>
      </div>

      <div class="table-container">
          <table class="data-table">
              <thead>
                  <tr>
                      <th>ID</th>
                      <th>Nombre Completo</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th class="text-right">Acciones</th>
                  </tr>
              </thead>
              <tbody id="socios-tbody">
                  <tr><td colspan="5" class="loading-cell">Cargando socios...</td></tr>
              </tbody>
          </table>
      </div>

      <dialog id="socio-modal" class="modal">
        <div class="modal-content" style="text-align: left;">
            <h3 id="modal-title" style="margin-bottom: 1rem;">Registrar Nuevo Socio</h3>
            
            <form id="socio-form" style="display: flex; flex-direction: column; gap: 1rem;">
                
                <input type="hidden" id="socio-id" name="id">

                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" name="nombre" required class="input-field">
                </div>
                <div class="form-group">
                    <label>Apellidos</label>
                    <input type="text" name="apellidos" required class="input-field">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required class="input-field">
                </div>
                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="tel" name="telefono" class="input-field">
                </div>

                <div class="modal-actions" style="justify-content: flex-end; margin-top: 1rem;">
                    <button type="button" id="cancel-form-btn" class="btn btn-secondary">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        </div>
      </dialog>

      <dialog id="view-socio-modal" class="modal">
        <div class="modal-content" style="text-align: left; max-width: 600px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h3 id="view-socio-full-name">Nombre del Socio</h3>
                    <p id="view-socio-info" style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.2rem;"></p>
                </div>
                <button type="button" style="color: #eee;" class="btn-icon" onclick="this.closest('dialog').close()">✕</button>
            </div>

            <h4 style="margin-top: 1.5rem; margin-bottom: 0.8rem; border-bottom: 1px solid #333; padding-bottom: 0.5rem;">
                Historial de Préstamos
            </h4>

            <div style="max-height: 300px; overflow-y: auto; border-radius: 8px; background: #111;">
                <table class="data-table" style="font-size: 0.95rem;">
                    <thead>
                        <tr>
                            <th>Libro</th>
                            <th>Inicio</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="view-socio-loans-tbody">
                        <tr><td colspan="3" style="text-align:center; padding: 2rem;">Cargando préstamos...</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="modal-actions" style="justify-content: flex-end; margin-top: 1.5rem;">
                <button type="button" class="btn btn-secondary" onclick="this.closest('dialog').close()">Cerrar</button>
            </div>
        </div>
      </dialog>
    </div>
    `;
  }

  async afterRender() {
    await this.loadTable();

    // Modales
    const modal = document.getElementById('socio-modal') as HTMLDialogElement;
    const viewModal = document.getElementById('view-socio-modal') as HTMLDialogElement;
    // Referencias a elementos del DOM
    const form = document.getElementById('socio-form') as HTMLFormElement;
    const modalTitle = document.getElementById('modal-title');
    const tbody = document.getElementById('socios-tbody');
    // --- LÓGICA DEL MODAL ---

    // BOTÓN NUEVO SOCIO
    document.getElementById('add-socio-btn')?.addEventListener('click', () => {
      form.reset(); // Limpia el formulario
      (document.getElementById('socio-id') as HTMLInputElement).value = ''; // Limpia el ID oculto
      if (modalTitle) modalTitle.innerText = "Registrar Nuevo Socio"; // Cambia título
      modal.showModal();
    });

    // BOTÓN CANCELAR
    document.getElementById('cancel-form-btn')?.addEventListener('click', () => modal.close());

    // C. Guardar (Submit del formulario)
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const idValue = formData.get('id') as string; // Leemos el input oculto

      const socioData = {
        nombre: formData.get('nombre') as string,
        apellidos: formData.get('apellidos') as string,
        email: formData.get('email') as string,
        telefono: formData.get('telefono') as string
      };

      let success = idValue
        ? await this.sociosService.updateSocio(Number(idValue), socioData)
        : await this.sociosService.createSocio(socioData);

      if (success) {
        modal.close();
        this.loadTable();
      } else {
        alert("Error al guardar los datos.");
      }
    });

    // EDITAR y BORRAR
    tbody?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;

      // LÓGICA DE VISUALIZACION
      const viewBtn = target.closest('.view-trigger');
      if (viewBtn) {
        const id = Number(viewBtn.getAttribute('data-id'));
        const socioString = viewBtn.getAttribute('data-json');

        if (socioString) {
          const socio = JSON.parse(socioString);

          // Datos básicos
          document.getElementById('view-socio-full-name')!.innerText = `${socio.nombre} ${socio.apellidos}`;
          document.getElementById('view-socio-info')!.innerText = `Email: ${socio.email} | Tel: ${socio.telefono || '-'}`;

          const loansTbody = document.getElementById('view-socio-loans-tbody')!;
          loansTbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 1.5rem;">Cargando actividad...</td></tr>';

          viewModal.showModal();

          // Cargar historial desde el service
          try {
            const prestamos = await this.prestamoService.getPrestamosBySocio(id);
            loansTbody.innerHTML = '';

            if (prestamos.length === 0) {
              loansTbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 1.5rem; color: #666;">Sin préstamos registrados.</td></tr>';
            } else {
              prestamos.forEach((p: any) => {
                const fecha = new Date(p.fechaInicio || p.fecha_inicio).toLocaleDateString();
                const isDevuelto = !!p.fechaDevolucion;
                const badgeClass = isDevuelto ? 'status-badge' : 'status-badge status-available';
                const statusText = isDevuelto ? 'Devuelto' : 'Activo';

                loansTbody.insertAdjacentHTML('beforeend', `
                  <tr>
                    <td style="font-weight: 500;">${p.libro_titulo}</td>
                    <td>${fecha}</td>
                    <td><span class="${badgeClass}" style="${isDevuelto ? 'background: #333;' : ''}">${statusText}</span></td>
                  </tr>
                `);
              });
            }
          } catch (err) {
            loansTbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color: var(--status-unavailable);">Error al conectar.</td></tr>';
          }
        }
        return;
      }

      // LÓGICA DE BORRAR
      const deleteBtn = target.closest('.delete-trigger');
      if (deleteBtn) {
        const id = Number(deleteBtn.getAttribute('data-id'));
        if (confirm('¿Eliminar socio?')) {
          await this.sociosService.deleteSocio(id);
          this.loadTable();
        }
      }

      // LÓGICA DE EDITAR
      const editBtn = target.closest('.edit-trigger'); // Buscamos el botón editar
      if (editBtn) {
        // Recuperamos el objeto socio que guardamos en el atributo data-json
        const socioString = editBtn.getAttribute('data-json');
        if (socioString) {
          const socio = JSON.parse(socioString);

          // Rellenamos el formulario con los datos
          (document.getElementById('socio-id') as HTMLInputElement).value = socio.id.toString();
          (form.elements.namedItem('nombre') as HTMLInputElement).value = socio.nombre;
          (form.elements.namedItem('apellidos') as HTMLInputElement).value = socio.apellidos;
          (form.elements.namedItem('email') as HTMLInputElement).value = socio.email;
          (form.elements.namedItem('telefono') as HTMLInputElement).value = socio.telefono || '';

          if (modalTitle) modalTitle.innerText = "Editar Socio";
          modal.showModal();
        }
      }
    });
  }

  private async loadTable() {
    const tbody = document.getElementById('socios-tbody');
    if (!tbody) return;

    // Ponemos el loader mientras carga
    tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Cargando datos...</td></tr>';

    try {
      const socios = await this.sociosService.getAllSocios();
      tbody.innerHTML = ''; // Limpiamos el loader

      if (socios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">No hay socios registrados.</td></tr>';
        return;
      }

      socios.forEach((socio: Socio) => {
        const row = this.generateRow(socio);
        tbody.insertAdjacentHTML('beforeend', row);
      });

    } catch (err) {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="5" class="error-cell">Error cargando datos del servidor.</td></tr>';
    }
  }

  private generateRow(socio: Socio): string {
    const socioData = JSON.stringify(socio).replace(/'/g, "&apos;");

    return html`
    <tr>
      <td><span class="id-badge">#${socio.id}</span></td>
      <td class="font-medium">${socio.nombre} ${socio.apellidos}</td>
      <td class="text-secondary">${socio.email}</td>
      <td>${socio.telefono || '-'}</td>
      <td class="text-right">
        <button class="btn-icon view-trigger" data-id="${socio.id}" data-json='${socioData}' title="Ver historial">
            🔍
        </button>
        <button class="btn-icon edit-trigger" data-json='${socioData}' title="Editar">
            ✏️
        </button>
        
        <button class="btn-icon delete-trigger" data-id="${socio.id}" title="Eliminar">
            🗑️
        </button>
      </td>
    </tr>    
    `;
  }
}