import { SocioService } from '../services/socio.services';
import { Socio } from '../models/Socio';

export class SocioController {

    private socioService: SocioService;

    constructor() {
        this.socioService = new SocioService();
    }

    // GET "api/socios"
    public getSocios(): Response {
        try {
            const socios = this.socioService.getAll();
            return Response.json(socios, { status: 200 });
        } catch (error) {
            return Response.json({ error: "Internal server error" }, { status: 500 });
        }
    }

    // GET "api/socios/:id"
    public getSocioById(id: number): Response {
        try {
            const socio = this.socioService.getById(id);
            if (!socio) {
                return Response.json({ error: "Socio not found" }, { status: 404 });
            }
            return Response.json(socio, { status: 200 });
        } catch (error) {
            return Response.json({ error: "Internal server error" }, { status: 500 })
        }
    }

    // POST "api/socios"
    public async createSocio(req: Request): Promise<Response> {
        try {
            const body = await req.json();
            const newSocio = new Socio(body);
            const id = this.socioService.createUser(newSocio);

            return Response.json({
                message: "Socio creado correctamente",
                id: id,
                socio: newSocio
            }, { status: 201 });
        } catch (error) {
            // Error validacion Modelo (ej: Email vacio o mal formateado)
            return Response.json(
                { error: (error as Error).message },
                { status: 400 }
            );
        }
    }

    // PUT "api/socios/:id"
    public async updateSocio(id: number, req: Request): Promise<Response> {
        try {
            const body = await req.json();
            const updatedSocio = new Socio(body);

            const success = this.socioService.updateUser(id, updatedSocio);
            if (!success)
                return Response.json({ error: "Socio not found for update" }, { status: 404 });
            return Response.json({ message: "Socio updated successfully" }, { status: 204 })
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 400 });
        }
    }

    // DELETE "api/socios/:id"
    public deleteSocio(id: number) {
        const success = this.socioService.deleteUser(id);
        if (!success) return Response.json({ error: "Socio not found for update" }, { status: 404 });
        return Response.json({ message: "Socio deleted successfully" })
    }
}