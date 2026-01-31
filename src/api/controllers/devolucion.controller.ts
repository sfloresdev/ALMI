import { DevolucionService } from '../services/devolucion.services';

export class DevolucionController {

    private devolucionService: DevolucionService;

    constructor() {
        this.devolucionService = new DevolucionService();
    }

    public getDevoluciones(): Response {
        try {
            const devoluciones = this.devolucionService.getAll();
            return Response.json(devoluciones, { status: 200 });
        } catch (error) {
            console.error(error);
            return Response.json({ error: "Error interno del servidor" }, { status: 500 })
        }
    }
}