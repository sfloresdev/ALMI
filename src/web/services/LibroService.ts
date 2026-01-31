import type { Libro } from "../../shared/types";

export class LibrosService {

    private coverBaseUrl = "https://covers.openlibrary.org/b/isbn/";

    async getAllBooks(): Promise<Libro[]> {
        try {
            const response = await fetch("/api/libros");

            if (!response.ok) return [];

            const data = await response.json();
            if (!Array.isArray(data)) {
                console.error("El backend no devolvió una lista:", data)
                return [];
            }

            return data as Libro[];
        } catch (error) {
            console.error("Error obteniendo libros ", error);
            return [];
        }
    }

    async deleteBook(id: number): Promise<boolean> {
        try {
            const response = await fetch(`/api/libros/${id}`, { method: 'DELETE' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    getCoverUrl(isbn: string, size: 'S' | 'M' | 'L' = 'M'): string {
        if (!isbn) return "https://images.placeholders.dev/?width=180&height=280&text=Sin%20Portada&backgroundColor=%23f1f5f9&textColor=%23475569";
        return `${this.coverBaseUrl}${isbn}-${size}.jpg`;
    }

}