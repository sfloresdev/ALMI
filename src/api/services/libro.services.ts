import type { Libro } from "../../shared/types";
import { db } from "../../data/database";
import { Libro as ILibro } from '../../shared/types';

export class LibroService {

    // GET
    public getAllBooks(): ILibro[] {
        return db.query("SELECT * FROM libros").all() as ILibro[];
    }

    // GET/genero
    public getByGenero(genero: string): ILibro[] {
        return db.query(`SELECT * FROM libros WHERE LOWER(genero) = LOWER($genero)`)
            .all({ $genero: genero }) as ILibro[];
    }

    // POST
    public createLibro(libro: Libro): number {
        const query = db.prepare(`
            INSERT INTO libros(isbn, titulo, autor, genero, disponible)
            VALUES ($isbn, $titulo, $autor, $genero, $disponible)`);

        const result = query.run({
            $isbn: libro.isbn,
            $titulo: libro.titulo,
            $autor: libro.autor,
            $genero: libro.genero,
            $disponible: libro.disponible ? 1 : 0
        })
        return result.lastInsertRowid as number;
    }

    // PUT
    public updateLibro(id: number, libro: Partial<ILibro>): boolean {
        let disponibleVal: number | null = null;
        if (libro.disponible !== undefined)
            disponibleVal = libro.disponible ? 1 : 0;

        const query = db.prepare(`
            UPDATE libros
            SET
                isbn = COALESCE($isbn, isbn),
                titulo = COALESCE($titulo, titulo),
                autor = COALESCE($autor, autor),
                genero = COALESCE($genero, genero),
                disponible = COALESCE($disponible, disponible)
            WHERE id = $id
            `)
        const result = query.run({
            $id: id,
            $isbn: libro.isbn || null,
            $titulo: libro.titulo || null,
            $autor: libro.autor || null,
            $genero: libro.genero || null,
            $disponible: disponibleVal
        });
        return result.changes > 0;
    }


    // DELETE
    public deleteLibro(id: number): boolean {
        const deleteById = db.query(`DELETE FROM libros WHERE id = $id`);
        const result = deleteById.run({ $id: id });
        return result.changes > 0;
    }
}