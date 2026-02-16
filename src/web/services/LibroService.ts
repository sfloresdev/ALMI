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

    async createBook(libro: Omit<Libro, 'id' | 'disponible'>): Promise<boolean> {
        try {
            const response = await fetch('/api/libros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...libro,
                    disponible: true
                })
            });
            return response.ok;
        } catch (error) {
            console.error("Error creando libro: ", error)
            return false;
        }
    }

    async updateBook(id: number, libro: Partial<Libro>): Promise<boolean> {
        try {
            const response = await fetch(`api/libros/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(libro)
            });
            return response.ok;
        } catch (error) {
            console.error("Error actualizando libro: ", error);
            return false;
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

    public getPlaceHolderImage(): string {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="180" height="280" viewBox="0 0 180 280">
                <rect width="100%" height="100%" fill="#374151"/>
                <text x="50%" y="45%" font-size="60" text-anchor="middle" dominant-baseline="middle">📚</text>
                <text x="50%" y="65%" font-family="sans-serif" font-weight="bold" font-size="16" fill="#e4e9e9" text-anchor="middle">Sin Portada</text>
            </svg>`.trim();
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    getCoverUrl(isbn: string, size: 'S' | 'M' | 'L' = 'M'): string {
        if (!isbn) {
            return this.getPlaceHolderImage();
        }
        return `${this.coverBaseUrl}${isbn}-${size}.jpg?default=false`;
    }
}