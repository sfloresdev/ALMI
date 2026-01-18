import { Component } from "../components/Component";
import { SociosService } from "../services/SociosService";
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
    <div class="view-container">
      <div class="section-header">
          <h2>Gestión de Socios</h2>
          <p>Listado completo de miembros de la biblioteca</p>
      </div>

      <div class="table-container">
          <table class="data-table" id="socios-table">
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
                  <tr>
                      <td colspan="5" class="loading-cell">Cargando socios...</td>
                  </tr>
              </tbody>
          </table>
      </div>
      </div>
    `;
  }

  async afterRender() {
    const tbody = document.getElementById('socios-tbody');
    if (!tbody) return ;

    try {
      const socios = await this.sociosService.getAllSocios();

      tbody.innerHTML = '';

      // Importante reutilizar estos componentes de 'error' en Prestamos
      if (socios.length === 0){
        tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">No hay socios registrados.</td></tr>';
      }

      socios.forEach(socio => {
        const row = this.generateRow(socio);
        tbody.insertAdjacentHTML('beforeend', row);
      });
    } catch (error) {
      tbody.innerHTML = '<tr><td colspan="5" class="error-cell">Error al cargar los datos</td></tr>';
    }
  }

  private generateRow(socio: Socio): string {
    return html`
    <tr>
      <td><span class="id-badge">#${socio.id}</span></td>
      <td class="font-medium">${socio.nombre} ${socio.apellidos}</td>
      <td class="text-secondary">${socio.email}</td>
      <td>${socio.telefono || '-'}</td>
      <td class="text-right">
          <button class="btn-icon" title="Editar"></button>
          <button class="btn-icon delete" title="Eliminar"></button>
      </td>
    </tr>    
    `;
  }
}