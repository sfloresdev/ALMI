export interface Socio {
    id?: number;
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
}

export interface Libro {
    id?: number;
    isbn: string;
    titulo: string;
    autor: string;
    genero: string;
    // portadaUrl?: string;
    disponible: boolean;   
}

export interface Prestamo {
    id?: number;
    socioId: number;
    libroId: number;
    fechaPrestamo: string;
    fechaLimite: string;
    fechaDevolucion?: string | null;
}

export interface Devolucion {
    id?: number;
    prestamoId: number;
    fechaDevolucion: string;
    comentarios?: string | null;
}