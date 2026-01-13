const server = Bun.serve({
    port: 4047,
    async fetch(req: Request): Promise<Response> {
        // URL de nuestro sitio
        const url = new URL(req.url);

        // Rutas de la API, si se solicita el recurso llama a handleApiRoutes()
        if (url.pathname.startsWith("/api/")) {
            return handleApiRoutes(req, url);
        }

        // Rutas de SRC y logica de transpilacion a codigo JS
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
                if (filePath.endsWith(".ts")){
                    const tsCode = await file.text()
                    const transpiler = new Bun.Transpiler({loader: "ts"})
                    const jsCode = transpiler.transformSync(tsCode);
                    return new Response(jsCode, {
                        headers: {"Content-Type": "application/javascript"}
                    })
                }
            }
            return new Response(file);
        }

        // Ruta del servidor Estático (Frontend)
        let publicPath = `./public${url.pathname === "/" ? "/index.html" : url.pathname}`
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

/* console.log(`Port: ${server.port}`);
console.log(`Server Running at ${server.url}`); */