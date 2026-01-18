import type { Socio } from "../../shared/types";

export class SociosService {

    async getAllSocios(): Promise<Socio[]> {
        try {
            const response = await fetch("/api/socios");

            if (!response.ok){
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();
            return data as Socio[];
        } catch (error) {
            console.error("Error obteniendo socios: ", error);
            return [];
        }
    }
}