import { Component } from "../components/Component";
import { SociosService } from "../services/SocioService";
import type { Socio } from "../../shared/types";

const html = String.raw;
export class SociosView extends Component {

  private sociosService: SociosService;

  constructor() {
    super();
    this.sociosService = new SociosService();
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
    </div>
    `;
  }

  async afterRender() {
    await this.loadTable();

    // 2. Referencias a elementos del DOM (Botones y Modal)
    const modal = document.getElementById('socio-modal') as HTMLDialogElement;
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

      let success;

      // CAMBIO 3: Si hay ID, actualizamos. Si no, creamos.
      if (idValue)
        success = await this.sociosService.updateSocio(Number(idValue), socioData);
      else
        success = await this.sociosService.createSocio(socioData);
      if (success) {
        modal.close();
        this.loadTable();
      }
      else
        alert("Error al guardar los datos.");
    });

    // EDITAR y BORRAR
    tbody?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;

      // LÓGICA DE BORRAR
      const deleteBtn = target.closest('.delete-trigger');
      if (deleteBtn) {
        const id = Number(deleteBtn.getAttribute('data-id'));
        if (confirm('¿Eliminar socio?')) {
          await this.sociosService.deleteSocio(id);
          this.loadTable();
        }
      }

      // CAMBIO 2: LÓGICA DE EDITAR
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