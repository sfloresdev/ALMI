import { PrestamoService } from "../services/prestamo.services";

export class PrestamoController {

    private prestamosService: PrestamoService;

    constructor() {
        this.prestamosService = new PrestamoService();
    }

    // POST ("/api/prestamos")
    public async createPrestamo(req: Request): Promise<Response> {
        try {
            const body = await req.json();

            if (!body.socioId || !body.libroId)
                return Response.json({ error: "Faltan datos (socioId, libroId)" });

            const resultado = this.prestamosService.createPrestamo(body.socioId, body.libroId);

            if (!resultado.success)
                return Response.json({ error: resultado.message }, { status: 404 });

            return Response.json(resultado, { status: 201 });
        } catch (error) {
            return Response.json({ error: "Internal server error" }, { status: 500 });
        }
    }

    // GET ("/api/prestamos/socio/:id")
    public getPrestamosPorSocio(id: number): Response {
        try {
            // Llamamos al método que acabas de definir en el servicio
            const prestamos = this.prestamosService.getPrestamosBySocio(id);
            
            // Si el socio no tiene préstamos, .all() devolverá un array vacío []
            return Response.json(prestamos, { status: 200 });
            
        } catch (error) {
            console.error(`Error obteniendo préstamos del socio ${id}:`, error);
            return Response.json({ error: "Error interno al obtener el historial del socio" }, { status: 500 });
        }
    }

    // POST ("api/prestamos/devoluciones")
    public async createDevolucion(req: Request): Promise<Response> {
        try {
            const body = await req.json();

            if (!body.prestamoId)
                return Response.json({ error: "Faltan datos (prestamoId)" }, { status: 400 })

            const resultado = this.prestamosService.registrarDevolucion(body.prestamoId, body.comentarios)

            if (!resultado.success)
                return Response.json({ error: resultado.message }, { status: 400 })

            return Response.json(resultado, { status: 201 });
        } catch (error) {
            return Response.json({ error: "Internal server error" }, { status: 500 })
        }
    }

    // GET ("api/prestamos/activos")
    public getActivos(): Response {
        const prestamos = this.prestamosService.getPrestamosActivos();
        return Response.json(prestamos);
    }

    // GET ("api/prestamos/devoluciones")
    public getHistorial(): Response {
        const historial = this.prestamosService.getHistorialDevoluciones();
        return Response.json(historial);
    }
}