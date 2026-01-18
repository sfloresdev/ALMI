import { Database } from "bun:sqlite";
import { join } from "path";

const dbPath = join(import.meta.dir, "biblioteca.db");

console.log(`Database create in path ${dbPath}`);

export const db = new Database(dbPath);

export const initDb = () => {

        // 1. Activar Foreign Keys para que funcionen los ON DELETE CASCADE
        db.run("PRAGMA foreign_keys = ON;");

        // 2. Modo WAL para mejor rendimiento en servidor web
        db.run("PRAGMA journal_mode = WAL;");

        // 3. Creación de tablas
        db.run(`CREATE TABLE IF NOT EXISTS socios(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellidos TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            telefono TEXT NOT NULL);`);

        db.run(`CREATE TABLE IF NOT EXISTS libros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            isbn TEXT NOT NULL,
            titulo TEXT NOT NULL,
            autor TEXT NOT NULL,
            genero TEXT NOT NULL,
            disponible INTEGER DEFAULT 1);`);

        db.run(`CREATE TABLE IF NOT EXISTS prestamos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            socio_id INTEGER NOT NULL,
            libro_id INTEGER NOT NULL,
            fecha_prestamo TEXT NOT NULL,
            fecha_limite TEXT NOT NULL,
            fecha_devolucion TEXT,
            FOREIGN KEY (socio_id) REFERENCES socios(id) ON DELETE CASCADE,
            FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE);`);

        db.run(`CREATE TABLE IF NOT EXISTS devoluciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prestamo_id INTEGER UNIQUE NOT NULL,
            fecha_devolucion TEXT NOT NULL,
            comentarios TEXT,
            FOREIGN KEY (prestamo_id) REFERENCES prestamos(id));`)

        console.log("Tables succesfully created!")
}