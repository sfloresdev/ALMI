import { initDb } from "../data/database";
import { SocioController } from "./controllers/socio.controller";

const socioController = new SocioController();

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
        return new Response("Not Found", { status: 404 })
    },
});

/*
Funcion para manejar las rutas de cada endpoint
return: devuelve 404 si aun no esta implementado
*/
function handleApiRoutes(req: Request, url: URL) {
    if (url.pathname == "/api/socios" && req.method === "GET") {
        return socioController.getSocios();
    }

    

    if (url.pathname == "/api/status")
        return Response.json("ALMI Online", { status: 200 });

    return Response.json("Endpoint no implementado", { status: 404 });
}

console.log(`Port: ${server.port}`);
console.log(`Server Running at ${server.url}`);