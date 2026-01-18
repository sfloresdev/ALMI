import { db } from "./database";


try {

    const insertSocio = db.prepare(`
        INSERT INTO socios (nombre, apellidos, email, telefono) 
        VALUES ($nombre, $apellidos, $email, $telefono)
    `);

    insertSocio.run({
        $nombre: "Ana",
        $apellidos: "García",
        $email: "ana@biblioteca.com",
        $telefono: "666777888"
    });

} catch (error) {
    console.error("Error al instar usuarios de prueba", error);
}