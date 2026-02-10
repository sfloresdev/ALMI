import type { Prestamo, Devolucion } from "../../shared/types";

export class PrestamoService {

	async getPrestamosActivos(): Promise<Prestamo[]> {
		try {
			const response = await fetch("/api/prestamos/activos");

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

	async createPrestamo(prestamo: Omit<Prestamo, 'id'>) {
		try {
			const response = await fetch('/api/prestamos', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(prestamo)
			});
			return response.ok;
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
					prestamo_id: prestamoId,
					fecha_fin: new Date().toISOString().split('T')[0],
					comentarios: comentarios
				})
			});
			return response.ok;
		} catch (error) {
			console.error("Error creando prestamos: ", error);
			return false;
		}
	}
}