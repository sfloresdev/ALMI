import { db } from "./database";
import { sociosData, librosData, prestamosData, devolucionesData } from "./seedData";

console.log("Seeding database...");

const seedTransaction = db.transaction(() => {

    console.log("Cleaning tables...");
    db.run("DELETE FROM devoluciones");
    db.run("DELETE FROM prestamos");
    db.run("DELETE FROM socios");
    db.run("DELETE FROM libros");
    console.log("\x1b[92mTables cleaned ✔\x1b[0m");

    db.run("DELETE FROM sqlite_sequence WHERE name IN ('socios', 'libros', 'prestamos', 'devoluciones')");

    const insertSocio = db.prepare(`
        INSERT INTO socios (nombre, apellidos, email, telefono) 
        VALUES ($nombre, $apellidos, $email, $telefono)`)

    for (const socio of sociosData) {
        insertSocio.run({
            $nombre: socio.nombre,
            $apellidos: socio.apellidos,
            $email: socio.email,
            $telefono: socio.telefono
        })
    }
    console.log("\x1b[92mSocios data inserted ✔\x1b[0m");

    const insertLibro = db.prepare(`
        INSERT INTO libros (isbn, titulo, autor, genero, disponible) 
        VALUES ($isbn, $titulo, $autor, $genero, $disponible)`
    );

    for (const libro of librosData) {
        insertLibro.run({
            $isbn: libro.isbn,
            $titulo: libro.titulo,
            $autor: libro.autor,
            $genero: libro.genero,
            $disponible: libro.disponible ? 1 : 0
        })
    }
    console.log("\x1b[92mLibros data inserted ✔\x1b[0m");

    const insertPrestamo = db.prepare(`
        INSERT INTO prestamos (socio_id, libro_id, fecha_prestamo, fecha_limite, fecha_devolucion) 
        VALUES ($s_id, $l_id, $f_prestamo, $f_limite, $f_dev)
    `);

    for (const prestamo of prestamosData) {
        insertPrestamo.run({
            $s_id: prestamo.socioId,
            $l_id: prestamo.libroId,
            $f_prestamo: prestamo.fechaPrestamo,
            $f_limite: prestamo.fechaLimite,
            $f_dev: prestamo.fechaDevolucion || null
        });
    }

    console.log("\x1b[92mPrestamos data inserted ✔\x1b[0m");

    const insertDevolucion = db.prepare(`
        INSERT INTO devoluciones (prestamo_id, fecha_devolucion, comentarios)
        VALUES ($p_id, $f_dev, $comentarios)
    `);

    for (const devolucion of devolucionesData) {
        insertDevolucion.run({
            $p_id: devolucion.prestamoId,
            $f_dev: devolucion.fechaDevolucion,
            $comentarios: devolucion.comentarios || null
        });
    }
    console.log("\x1b[92mDevoluciones data inserted ✔\x1b[0m");
});

try {
    seedTransaction();
    console.log("\x1b[92mDatabase seeded ✔\x1b[0m");
} catch (error) {
    console.error("\x1b[91m✖Database seed failed\x1b[0m", error);
}