import { LibroService } from "../services/libro.services";
import { Libro } from '../models/Libro';

export class LibroController {

    private libroService: LibroService;

    constructor() {
        this.libroService = new LibroService();
    }

    // GET ("/api/libros")
    public getLibros(): Response {
        try {
            const libros = this.libroService.getAllBooks();
            return Response.json(libros, { status: 200 });
        } catch (error) {
            console.error("Error fetching libros: ", error);
            return Response.json({ error: "Error interno" }, { status: 500 });
        }
    }

    // POST ("/api/libros")
    public async createLibro(req: Request): Promise<Response> {
        try {
            const body = await req.json();
            // Validamos los datos usando el modelo
            const nuevoLibro = new Libro(body);
            const id = this.libroService.createLibro(nuevoLibro);
            return Response.json({
                message: "Libro creado",
                id: id,
                libro: nuevoLibro
            }, { status: 201 });
        } catch (error) {
            return Response.json({ error: (error as Error).message }, { status: 400 })
        }
    }

    // DELETE ("api/libros:id")
    public deleteLibro(id: number) {
        const succes = this.libroService.deleteLibro(id);
        if (!succes) return Response.json({ error: "Libro not found" }, { status: 404 });
        return Response.json({ message: "Libro deleted successfully" })
    }
}
