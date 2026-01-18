// src/data/seedData.ts
import { Socio, Libro, Prestamo, Devolucion } from "../shared/types";

// 1. SOCIOS (IDs: 1, 2, 3)
export const sociosData: Omit<Socio, 'id'>[] = [
    { nombre: "Juan", apellidos: "Nadie", email: "juan@test.com", telefono: "600111222" },
    { nombre: "Ana", apellidos: "Lectora", email: "ana@test.com", telefono: "600333444" },
    { nombre: "Pedro", apellidos: "Moroso", email: "pedro@tarde.com", telefono: "600555666" }
];

// 2. LIBROS (IDs: 1 al 7 según el orden del array)
export const librosData: Omit<Libro, 'id'>[] = [
    { isbn: "9780544003415", titulo: "El Señor de los Anillos", autor: "J.R.R. Tolkien", genero: "Fantasía", disponible: false },
    { isbn: "9780451524935", titulo: "1984", autor: "George Orwell", genero: "Ciencia Ficción", disponible: false },
    { isbn: "9780307474728", titulo: "Cien años de soledad", autor: "Gabriel García Márquez", genero: "Realismo Mágico", disponible: true },
    { isbn: "9788478884452", titulo: "Harry Potter", autor: "J.K. Rowling", genero: "Fantasía", disponible: true },
    { isbn: "9780441172719", titulo: "Dune", autor: "Frank Herbert", genero: "Ciencia Ficción", disponible: false },
    { isbn: "9780140449136", titulo: "La Odisea", autor: "Homero", genero: "Clásico", disponible: true },
    { isbn: "978-001", titulo: "Don Quijote", autor: "Cervantes", genero: "Novela", disponible: true },
];

// 3. PRÉSTAMOS
// Importante: Los IDs de libros y socios dependen del orden de los arrays de arriba.
export const prestamosData: Omit<Prestamo, 'id'>[] = [
    {
        // ID PRÉSTAMO: 1
        // Juan tiene "El Señor de los Anillos" (Activo)
        socioId: 1,
        libroId: 1,
        fechaPrestamo: new Date().toISOString(),
        fechaLimite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // +15 días
        fechaDevolucion: null 
    },
    {
        // ID PRÉSTAMO: 2
        // Ana tiene "1984" (Activo)
        socioId: 2,
        libroId: 2,
        fechaPrestamo: new Date().toISOString(),
        fechaLimite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        fechaDevolucion: null
    },
    {
        // ID PRÉSTAMO: 3
        // Pedro tiene "Dune" (VENCIDO hace días)
        socioId: 3,
        libroId: 5,
        fechaPrestamo: "2023-01-01T10:00:00.000Z", // Prestado hace mucho
        fechaLimite: "2023-01-15T10:00:00.000Z", // Venció hace mucho
        fechaDevolucion: null
    },
    {
        // ID PRÉSTAMO: 4
        // Juan tuvo "Harry Potter" y YA LO DEVOLVIÓ
        socioId: 1,
        libroId: 4,
        fechaPrestamo: "2023-02-01T10:00:00.000Z",
        fechaLimite: "2023-02-15T10:00:00.000Z",
        fechaDevolucion: "2023-02-10T10:00:00.000Z" // Fecha real de devolución
    }
];

export const devolucionesData: Omit<Devolucion, 'id'>[] = [
    {
        prestamoId: 4, // Corresponde al préstamo de Harry Potter de Juan
        fechaDevolucion: "2023-02-10T10:00:00.000Z", // Coincide con la fecha en prestamos
        comentarios: "Entregado en perfectas condiciones."
    }
];