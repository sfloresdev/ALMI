import { Database } from "bun:sqlite";

const db = new Database("biblioteca.db")

export const initDb = () => {
    db.run(`CREATE TABLE IF NOT EXISTS socios(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellidos TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            telefono TEXT NOT NULL,
            fechaAlta TEXT NOT NULL);`);

    db.run(`CREATE TABLE IF NOT EXISTS libros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            autor TEXT NOT NULL,
            genero TEXT NOT NULL,
            isbn TEXT UNIQUE NOT NULL,
            portadaUrl TEXT,
            disponible INTEGER DEFAULT 1);`)

    
}