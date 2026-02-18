// src/data/seedData.ts
import { Socio, Libro, Prestamo, Devolucion } from "../shared/types";

// 1. SOCIOS 7 socios
export const sociosData: Omit<Socio, 'id'>[] = [
    { nombre: "Juan", apellidos: "Nadie", email: "juan@test.com", telefono: "600111222" },
    { nombre: "Ana", apellidos: "Lectora", email: "ana@test.com", telefono: "600333444" },
    { nombre: "Pedro", apellidos: "Moroso", email: "pedro@tarde.com", telefono: "600555666" },
    // Nuevos usuarios
    { nombre: "Carmen", apellidos: "García", email: "carmen@biblioteca.es", telefono: "611222333" },
    { nombre: "Roberto", apellidos: "Sánchez", email: "roberto.san@mail.com", telefono: "644555666" },
    { nombre: "Elena", apellidos: "Martínez", email: "elena.mtz@test.es", telefono: "677888999" },
    { nombre: "Miguel", apellidos: "Ruiz", email: "migue_ruiz@correo.com", telefono: "699000111" }
];

// 2. LIBROS 10 libros
export const librosData: Omit<Libro, 'id'>[] = [
    { isbn: "9780544003415", titulo: "El Señor de los Anillos", autor: "J.R.R. Tolkien", genero: "Fantasía", disponible: false },
    { isbn: "9780451524935", titulo: "1984", autor: "George Orwell", genero: "Ciencia Ficción", disponible: false },
    { isbn: "9780307474728", titulo: "Cien años de soledad", autor: "Gabriel García Márquez", genero: "Realismo Mágico", disponible: true },
    { isbn: "9788478884452", titulo: "Harry Potter y la piedra filosofal", autor: "J.K. Rowling", genero: "Fantasía", disponible: true },
    { isbn: "9780441172719", titulo: "Dune", autor: "Frank Herbert", genero: "Ciencia Ficción", disponible: false },
    { isbn: "9780140449136", titulo: "La Odisea", autor: "Homero", genero: "Clásico", disponible: true },
    { isbn: "9788424922412", titulo: "Don Quijote de la Mancha", autor: "Miguel de Cervantes", genero: "Novela", disponible: true },
    { isbn: "9780802135582", titulo: "Notas de viaje (Diarios de Motocicleta)", autor: "Ernesto 'Che' Guevara", genero: "Biografía", disponible: false },
    { isbn: "9780766128682", titulo: "Shakespeare y la Biblia", autor: "Steven Marx", genero: "Ensayo", disponible: false },
    { isbn: "9788411124621", titulo: "Star Wars: Heredero del Imperio", autor: "Timothy Zahn", genero: "Ciencia Ficción", disponible: true }
];

// 3. PRÉSTAMOS
export const prestamosData: Omit<Prestamo, 'id'>[] = [
    {
        // Juan tiene "El Señor de los Anillos"
        socioId: 1, libroId: 1,
        fechaPrestamo: new Date().toISOString(),
        fechaLimite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        fechaDevolucion: null 
    },
    {
        // Ana tiene "1984"
        socioId: 2, libroId: 2,
        fechaPrestamo: new Date().toISOString(),
        fechaLimite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        fechaDevolucion: null
    },
    {
        // Pedro tiene "Dune" (VENCIDO)
        socioId: 3, libroId: 5,
        fechaPrestamo: "2023-01-01T10:00:00.000Z",
        fechaLimite: "2023-01-15T10:00:00.000Z",
        fechaDevolucion: null
    },
    {
        // Carmen (Socio 4) tiene "Notas de viaje" (Libro 8)
        socioId: 4, libroId: 8,
        fechaPrestamo: new Date().toISOString(),
        fechaLimite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        fechaDevolucion: null
    },
    {
        // Roberto (Socio 5) tiene "Shakespeare y la Biblia" (Libro 9)
        socioId: 5, libroId: 9,
        fechaPrestamo: new Date().toISOString(),
        fechaLimite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        fechaDevolucion: null
    },
    {
        // Historial: Juan devolvió Harry Potter
        socioId: 1, libroId: 4,
        fechaPrestamo: "2023-02-01T10:00:00.000Z",
        fechaLimite: "2023-02-15T10:00:00.000Z",
        fechaDevolucion: "2023-02-10T10:00:00.000Z"
    }
];

export const devolucionesData: Omit<Devolucion, 'id'>[] = [
    {
        prestamoId: 6, // Corresponde al último préstamo de Juan (Harry Potter)
        fechaDevolucion: "2023-02-10T10:00:00.000Z",
        comentarios: "Entregado en perfectas condiciones."
    }
];