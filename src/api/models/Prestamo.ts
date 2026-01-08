import type { Prestamo as IPrestamo } from "../../shared/types";
import { Validator } from '../../utils/validation';

export class Prestamo implements IPrestamo {
    private _id?: number;
    private _socioId: number;
    private _libroId: number;
    private _fechaPrestamo: string;
    private _fechaLimite: string;
    private _fechaDevolucion: string | null;

    constructor(datos: IPrestamo) {
        this._id = datos.id;
        this._socioId = datos.socioId;
        this._libroId = datos.libroId;
        this._fechaPrestamo = datos.fechaPrestamo;
        this._fechaLimite = datos.fechaLimite;
        this._fechaDevolucion = datos.fechaDevolucion ?? null;
    }

    get id() { return this._id }
    get socioId() { return this._socioId }
    get libroId() { return this._libroId }
    get fechaPrestamo() { return this._fechaPrestamo }
    get fechaLimite() { return this._fechaLimite }
    get fechaDevolucion(): string | null { return this._fechaDevolucion; }

    set fechaPrestamo(valor: string) {
        if (!Validator.isNotEmpty(valor))
            throw new Error("Prestamo: Loan date cannot empty");
        if (!Validator.isValidDate(valor))
            throw new Error("Prestamo: Invalid format -> (YYYY-MM-DD)");
        this._fechaPrestamo = valor;
    }

    set fechaLimite(valor: string) {
        if (!Validator.isNotEmpty(valor))
            throw new Error("Prestamo: Return date cannot empty");
        if (!Validator.isValidDate(valor))
            throw new Error("Prestamo: Invalid format -> (YYYY-MM-DD)");
        this._fechaLimite = valor;
    }

    set fechaDevolucion(valor: string) {
        // Al instanciar el objeto este es nulo
        if (valor == null) {
            this._fechaDevolucion = null;
            return;
        }
        // Si se introducen datos, se validan
        if (!Validator.isNotEmpty(valor))
            throw new Error("Prestamo: Users return date cannot empty");
        if (!Validator.isValidDate(valor))
            throw new Error("Prestamo: Invalid format -> (YYYY-MM-DD)");
        this._fechaDevolucion = valor;
    }

    public registrarDevolucion(fecha: string): void {
        const fechaFinal = fecha ?? new Date().toISOString().split('T')[0];
        this._fechaDevolucion = fechaFinal;
    }

    public estaDevuelto(): boolean {
        return this._fechaDevolucion != null;
    }
}