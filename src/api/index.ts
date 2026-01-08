const server = Bun.serve({
    port: 4047,
    async fetch(req: Request): Promise<Response> {
        // URL de nuestro sitio
        const url = new URL(req.url);

        // Rutas de la API, si se solicita el recurso llama a handleApiRoutes()
        if (url.pathname.startsWith("/api/")) {
            return handleApiRoutes(req, url);
        }

        // Ruta del servidor Estático (Frontend)
        const publicPath = `./public${url.pathname === "/" ? "index.html" : url.pathname}`
        const file = Bun.file(publicPath);

        if (await file.exists()) return new Response(file);

        // Garantizamos que siempre hay response
        return new Response("Not Found", { status: 404 })
    },
});

// Funcion para manejar las rutas de cada endpoint
// return: devuelve 404 si aun no esta implementado
function handleApiRoutes(req: Request, url: URL) {
    if (url.pathname == "/api/status")
        return Response.json("ALMI Online", {status: 200});
    // Respuesta por defecto para la API
    return Response.json("Endpoint no implementado", { status: 404 });
}

console.log(`Port: ${server.port}`);
console.log(`Server Running at ${server.url}`);