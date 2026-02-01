import { initDb } from "../data/database";
import { LibroController } from './controllers/libro.controller';
import { SocioController } from "./controllers/socio.controller";
import { PrestamoController } from "./controllers/prestamo.controller";

const socioController = new SocioController();
const libroController = new LibroController();
const prestamoController = new PrestamoController();

initDb();

/*
Servidor HTTP nativo de Bun:
1. Se crea la URL de nuestro sitio
2. Manejamos las rutas de la API con un condicional, llama a una funcion
3. Automatizamos la transpilacion de TS a JS
4. Maneja el sevidor estatico (index.html) punto de entrada a la app
*/
const server = Bun.serve({
    port: 4047,
    async fetch(req: Request): Promise<Response> {
        // 1.
        const url = new URL(req.url);

        //2. Rutas de la API
        if (url.pathname.startsWith("/api/")) {
            return handleApiRoutes(req, url);
        }

        // 3. Logica de transpilacion
        if (url.pathname.startsWith("/src")) {
            let filePath = `.${url.pathname}`
            const fileRef = Bun.file(filePath);

            // Si el archivo no tiene la extension ".ts"
            if (!await fileRef.exists()) {
                const tsPath = filePath + ".ts";
                if (await Bun.file(tsPath).exists())
                    filePath = tsPath;
            }

            const file = Bun.file(filePath);

            if (await file.exists()) {
                if (filePath.endsWith(".ts")) {
                    const tsCode = await file.text()
                    const transpiler = new Bun.Transpiler({ loader: "ts" })
                    const jsCode = transpiler.transformSync(tsCode);
                    return new Response(jsCode, {
                        headers: { "Content-Type": "application/javascript" }
                    })
                }
            }
            return new Response(file);
        }

        //4. Ruta del servidor Estático (Frontend)
        let publicPath = `./public${url.pathname === "/" ? "/index.html" : url.pathname}`
        const file = Bun.file(publicPath);

        if (await file.exists()) return new Response(file);

        // Garantizamos que siempre hay response
        return new Response(Bun.file("./public/index.html"));
    },
});

/*
Funcion para manejar las rutas de cada endpoint
return: devuelve 404 si aun no esta implementado
*/
function handleApiRoutes(req: Request, url: URL) {

    // SOCIOS
    if (url.pathname == "/api/socios") {
        if (req.method === "GET") return socioController.getSocios();
        if (req.method === "POST") return socioController.createSocio(req);
    }
    const matchSocio = url.pathname.match(/^\/api\/socios\/(\d+)$/);
    if (matchSocio) {
        const id = parseInt(matchSocio[1]);

        if (req.method === "GET") return socioController.getSocioById(id);
        if (req.method === "PUT") return socioController.updateSocio(id, req);
        if (req.method === "DELETE") return socioController.deleteSocio(id);
    }

    // LIBROS
    if (url.pathname == "/api/libros") {
        if (req.method === "GET") return libroController.getLibros();
        if (req.method === "POST") return libroController.createLibro(req);
    }
    const matchGenero = url.pathname.match(/^\/api\/libros\/genero\/(.+)$/)
    if (matchGenero) {
        const genero = matchGenero[1];
        if (req.method === "GET") return libroController.getLibrosPorGenero(genero);
    }
    const matchLibro = url.pathname.match(/^\/api\/libros\/(\d+)$/)
    if (matchLibro) {
        const id = parseInt(matchLibro[1]);
        if (req.method === "DELETE") return libroController.deleteLibro(id);
    }

    // PRESTAMOS
    if (url.pathname === "/api/prestamos/")
        if (req.method === "POST") return prestamoController.createPrestamo(req);

    if (url.pathname === "/api/prestamos/activos")
        if (req.method === "GET") return prestamoController.getActivos();

    if (url.pathname === "/api/prestamos/devoluciones") {
        if (req.method === "GET") return prestamoController.getHistorial();
        if (req.method === "POST") return prestamoController.createDevolucion(req);
    }

    // STATUS/HEALTH
    if (url.pathname == "/api/status")
        return Response.json("ALMI Online", { status: 200 });

    return Response.json("Endpoint no implementado", { status: 404 });
}

console.log(`Port: ${server.port}`);
console.log(`Server Running at ${server.url}`);
