import type { Socio } from "../../shared/types";

export class SociosService {

    async getAllSocios(): Promise<Socio[]> {
        try {
            const response = await fetch("/api/socios");

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();
            return data as Socio[];
        } catch (error) {
            console.error("Error obteniendo socios: ", error);
            return [];
        }
    }

    async createSocio(socio: Omit<Socio, 'id'>): Promise<boolean> {
        try {
            const response = await fetch("/api/socios", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(socio)
            });
            return response.ok;
        } catch (error) {
            console.error("Error creando socio: ", error);
            return false;
        }
    }

    async updateSocio(id: number, socio: Partial<Socio>): Promise<boolean> {
        try {
            const respone = await fetch(`/api/socios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(socio)
            });
            return respone.ok;
        } catch (error) {
            console.error("Error actualizando socio: ", error);
            return false;
        }
    }

    async deleteSocio(id: number): Promise<boolean> {
        try {
            const response = await fetch(`/api/socios/${id}`, { method: "DELETE" });
            return response.ok;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
