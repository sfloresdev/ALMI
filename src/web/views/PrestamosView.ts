import { Component } from "../components/Component";
import { PrestamoService } from "../services/PrestamoService";
import { SociosService } from "../services/SocioService";
import type { Prestamo } from "../../shared/types";
import { LibrosService } from "../services/LibroService";

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
		return ``;
	}
	
	afterRender(): void {

	}
}