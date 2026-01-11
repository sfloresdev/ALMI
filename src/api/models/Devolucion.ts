import type { Devolucion as IDevolucion } from "../../shared/types";
import { Validator } from '../../utils/validation';

export class Devolucion implements IDevolucion {
    private _id?: number;
    private _prestamoId: number;
    private _fechaDevolucion: string;
    private _comentarios: string | null;

    constructor(datos: IDevolucion) {
        this._id = datos.id;
        this._prestamoId = datos.prestamoId;
        this._fechaDevolucion = datos.fechaDevolucion;
        this._comentarios = datos.fechaDevolucion ?? null;
    }

    get id() { return this._id }
    get prestamoId() { return this._prestamoId }
    get fechaDevolucion() { return this._fechaDevolucion; }
    get comentarios(): string | null { return this._comentarios }

    set prestamoId(valor: number) {
        if (!Validator.numberEmpty(valor))
            throw new Error("Devolucion: Loan_id cannot be empty");
        this._prestamoId = valor;
    }

    set fechaDevolucion(valor: string) {
        if (!Validator.isEmpty(valor))
            throw new Error("Devolucion: Return date cannot empty");
        if (!Validator.isValidDate(valor))
            throw new Error("Devolucion: Invalid format -> (YYYY-MM-DD)");
        this._fechaDevolucion = valor;
    }

    set comentarios(valor: string) {
        // Al instanciar el objeto este es nulo
        if (valor == null) {
            this._comentarios = null;
            return;
        }
        if (valor.length > 300)
            throw new Error("Devolucion: Comments can't have more than 300 characters");
        this._comentarios = valor;
    }
}