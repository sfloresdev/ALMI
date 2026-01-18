import { SocioService } from '../services/SocioService';
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
            console.error(error);
            return Response.json({ error: "Internal server error" }, { status: 500 });
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
            return Response.json(
                { error: (error as Error).message },
                { status: 400 }
            );
        }
    }
}