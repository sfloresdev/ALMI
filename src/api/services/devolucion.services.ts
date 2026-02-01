/* import { db } from "../../data/database";
import type { Devolucion } from "../../shared/types";

export class DevolucionService {

    private selectAllQuery = db.query("SELECT * FROM devoluciones");

    // GET all "Devoluciones"
    public getAll(): Devolucion[] {
        return this.selectAllQuery.all() as Devolucion[];
    }
} */