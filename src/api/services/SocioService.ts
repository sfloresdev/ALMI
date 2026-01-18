import { db } from "../../data/database";
import type { Socio } from "../../shared/types";

export class SocioService {

    private selectAllQuery = db.query("SELECT * FROM socios");
    private selectByIdQuery = db.query("SELECT * FROM socios WHERE id = $id");
    private createSocioQuery = db.query("INSERT INTO socios (nombre, apellidos, email, telefono) VALUES ($nombre, $apellidos, $email, $telefono)");
    private updateByIdQuery = db.query("UPDATE socios SET nombre = $nombre, apellidos = $apellidos, email = $email, telefono = $telefono WHERE id = $id");
    private deleteByIdQuery = db.query("DELETE FROM socios WHERE id = $id");

    // GET all "Socios"
    public getAll(): Socio[] {
        return this.selectAllQuery.all() as Socio[];
    }

    // GET "Socios" by ID
    public getById(id: number): Socio | null {
        return this.selectByIdQuery.get({ $id: id }) as Socio | null;
    }

    // POST "Socios"
    public createUser(socio: Socio): number {
        const result = this.createSocioQuery.run({
            $nombre: socio.nombre,
            $apellidos: socio.apellidos,
            $email: socio.email,
            $telefono: socio.telefono
        });
        return result.lastInsertRowid as number;
    }

    // PUT "Socios"
    public updateUser(id: number, socio: Socio): boolean {
        const result = this.updateByIdQuery.run({
            $id: id,
            $nombre: socio.nombre,
            $apellidos: socio.apellidos,
            $email: socio.email,
            $telefono: socio.telefono
        });
        return result.changes > 0;
    }

    // DELETE "Socios"
    public deleteUser(id: number): boolean {
        const result = this.deleteByIdQuery.run({
            $id: id
        });
        return result.changes > 0;
    }
}


