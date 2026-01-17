import type { Libro } from "../../shared/types";

export class LibroService {

    private coverBaseUrl = "https://covers.openlibrary.org/b/isbn/";

    private mockBooks: Libro[] = [
        { id: 1, isbn: "9780544003415", titulo: "El Señor de los Anillos", autor: "J.R.R. Tolkien", genero: "Fantasía", disponible: true },
        { id: 2, isbn: "9780451524935", titulo: "1984", autor: "George Orwell", genero: "Ciencia Ficción", disponible: false },
        { id: 3, isbn: "9780307474728", titulo: "Cien años de soledad", autor: "Gabriel García Márquez", genero: "Realismo Mágico", disponible: true },
        { id: 4, isbn: "9788478884452", titulo: "Harry Potter", autor: "J.K. Rowling", genero: "Fantasía", disponible: true },
        { id: 5, isbn: "9780441172719", titulo: "Dune", autor: "Frank Herbert", genero: "Ciencia Ficción", disponible: false },
        { id: 6, isbn: "9780140449136", titulo: "La Odisea", autor: "Homero", genero: "Clásico", disponible: true }
    ]

    async getAllBooks(): Promise<Libro[]> {
        return new Promise((resolve) =>{
            setTimeout(()=>{
                resolve(this.mockBooks)
            }, 300);
        });
    }

    getCoverUrl(isbn: string, size: 'S' | 'M' | 'L'): string{
        return `${this.coverBaseUrl}${isbn}-${size}.jpg`;
    }
}