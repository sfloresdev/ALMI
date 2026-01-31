import { db } from "../../data/database";
import type { Socio as ISocio } from "../../shared/types";
import { Socio } from "../models/Socio";

export class SocioService {

    // GET all "Socios"
    public getAll(): ISocio[] {
        return db.query("SELECT * FROM socios").all() as ISocio[];
    }

    // GET "Socios" by ID
    public getById(id: number): Socio | null {
        const selectByIdQuery = db.query(`SELECT * FROM socios WHERE id = $id`);
        return selectByIdQuery.get({ $id: id }) as Socio | null;
    }

    // POST "Socios" create Socio
    public createUser(socio: Socio): number {
        const createSocioQuery = db.query(`
            INSERT INTO socios (nombre, apellidos, email, telefono)
            VALUES ($nombre, $apellidos, $email, $telefono)
        `);

        const result = createSocioQuery.run({
            $nombre: socio.nombre,
            $apellidos: socio.apellidos,
            $email: socio.email,
            $telefono: socio.telefono
        });
        return result.lastInsertRowid as number;
    }

    // PUT "Socios" update Socios
    public updateUser(id: number, socio: Socio): boolean {
        const updateByIdQuery = db.query(`
            UPDATE socios
            SET nombre = $nombre, apellidos = $apellidos, email = $email, telefono = $telefono
            WHERE id = $id`
        );

        const result = updateByIdQuery.run({
            $id: id,
            $nombre: socio.nombre,
            $apellidos: socio.apellidos,
            $email: socio.email,
            $telefono: socio.telefono
        });
        return result.changes > 0;
    }

    // DELETE "Socios" delete Socio
    public deleteUser(id: number): boolean {
        const deleteByIdQuery = db.query(`DELETE FROM socios WHERE id = $id`);
        const result = deleteByIdQuery.run({ $id: id });
        return result.changes > 0;
    }
}


