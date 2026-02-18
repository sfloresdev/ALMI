import type { Prestamo, Devolucion } from "../../shared/types";

export class PrestamoService {

	async getPrestamosActivos(): Promise<Prestamo[]> {
		try {
			const response = await fetch("/api/prestamos");

			if (!response.ok) return [];

			const data = await response.json();
			if (!Array.isArray(data)) {
				console.error("El backend no devolvio una lista")
				return [];
			}
			return data as Prestamo[];
		} catch (error) {
			console.error("Error obteniendo los prestamos activos", error)
			return [];
		}
	}

	async getHistorialDevoluciones(): Promise<Prestamo[]> {
		try {
			const respone = await fetch('/api/prestamos/devoluciones')
			if (!respone.ok) return [];
			const data = await respone.json()
			return data as Prestamo[];
		} catch (error) {
			console.error("Error obteniendo los devoluciones ", error);
			return [];
		}
	}

	async getPrestamosBySocio(socioId: number): Promise<any[]> {
		try {
			// Coincide con tu backend: GET /api/prestamos/socio/:id
			const response = await fetch(`/api/prestamos/socio/${socioId}`);

			if (!response.ok) return [];

			const data = await response.json();
			return Array.isArray(data) ? data : [];
		} catch (error) {
			console.error("Error obteniendo préstamos del socio:", error);
			return [];
		}
	}

	async createPrestamo(prestamo: Omit<Prestamo, 'id'>) {
		try {
			const response = await fetch('/api/prestamos', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(prestamo)
			});
			return await response.json();
		} catch (error) {
			console.error("Error creando prestamo: ", error)
			return false;
		}
	}

	async createDevolucion(prestamoId: number, comentarios: string) {
		try {
			const response = await fetch('/api/prestamos/devoluciones', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prestamoId: prestamoId,
					comentarios: comentarios
				})
			});
			return await response.json();
		} catch (error) {
			console.error("Error creando prestamos: ", error);
			return { success: false, message: "Error de conexión" };
		}
	}
}