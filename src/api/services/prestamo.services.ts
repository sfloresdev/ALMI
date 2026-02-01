import { db } from "../../data/database";
import { Prestamo, Devolucion } from '../../shared/types';

export class PrestamoService {

    public createPrestamo(socioId: number, libroId: number): { success: boolean, message: string, id?: number } {

        const libro = db.query(`SELECT disponible FROM libros WHERE id = $id`).get({ $id: libroId }) as any;

        if (!libro) return { success: false, message: "The book does not exist" };
        if (libro.disponible === 0) return { success: false, message: "The nook is not available" }

        /*
        En la transaccion creamos la fecha que se realiza prestamo
        y al mismo tiempo creamos la fecha limite de devolución
        */
        const transaction = db.transaction(() => {
            const fechaPrestamo = new Date().toISOString();

            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() + 15);

            // Insertar prestamo
            const result = db.prepare(`
                INSERT INTO prestamos (socio_id, libro_id, fecha_prestamo, fecha_limite)
                VALUES ($s, $l, $fp, $fl)
            `).run({
                $s: socioId,
                $l: libroId,
                $fp: fechaPrestamo,
                $fl: fechaLimite.toISOString()
            });

            // Actualizar libro no disponible (0)
            db.prepare(`UPDATE libros SET disponible = 0 WHERE id = $id`).run({ $id: libroId })
            return result.lastInsertRowid;
        });

        const prestamoId = transaction() as number;
        return { success: true, message: "Loan done succesfully", id: prestamoId };
    }

    public registrarDevolucion(prestamoId: number, comentarios?: string): { success: boolean, message: string } {

        const prestamo = db.query(`SELECT * FROM prestamos WHERE id = $id`).get({ $id: prestamoId }) as any;

        if (!prestamo) return { success: false, message: "The loan does not exist" };
        if (prestamo.fecha_devolucion !== null) return { success: false, message: "Este prestamo ya fue devuelto" }

        const transtaction = db.transaction(() => {
            const fechaActual = new Date().toISOString();

            db.prepare(`
                INSERT INTO devoluciones (prestamo_id, fecha_devolucion, comentarios)
                VALUES ($pid, $fdev, $com)    
            `).run({
                $pid: prestamoId,
                $fdev: fechaActual,
                $com: comentarios || null
            });

            db.prepare(`
                UPDATE prestamos SET fecha_devolucion = $fdev WHERE id = $pid    
            `).run({ $fdev: fechaActual, $pid: prestamoId });

            db.prepare(`
                UPDATE libros SET disponible = 1 WHERE id = $lid
            `).run({ $lid: prestamo.libro_id });
        });
        transtaction();
        return { success: true, message: "Devolución registrada correctamente" }
    }

    public getPrestamosActivos() {
        return db.query(`
            SELECT p.id, p.fecha_prestamo, p.fecha_limite,
                   l.titulo, l.isbn,
                   s.nombre || ' ' || s.apellidos as nombre_socio
            FROM prestamos p
            JOIN libros l ON p.libro_id = l.id
            JOIN socios s ON p.socio_id = s.id
            WHERE p.fecha_devolucion IS NULL
        `).all();
    }

    public getHistorialDevoluciones() {
        return db.query(`
            SELECT d.id, d.fecha_devolucion, d.comentarios,
                   l.titulo, s.nombre || ' ' || s.apellidos as nombre_socio
            FROM devoluciones d
            JOIN prestamos p ON d.prestamo_id = p.id
            JOIN libros l ON p.libro_id = l.id
            JOIN socios s ON p.socio_id = s.id
            ORDER BY d.fecha_devolucion DESC
        `).all();
    }
}
