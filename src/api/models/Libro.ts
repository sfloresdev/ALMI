import type { Libro as ILibro } from "../../shared/types";
import { Validator } from '../../utils/validation';

// Clase Libro para modelado de datos POO
export class Libro implements ILibro {
    private _id?: number;
    private _isbn: string;
    private _titulo: string;
    private _autor: string;
    private _genero: string;
    //private _portadaUrl?: string;
    private _disponible: boolean;

    constructor(datos: ILibro) {
        this._id = datos.id;
        this._isbn = datos.isbn;
        this._titulo = datos.titulo;
        this._autor = datos.titulo;
        this._genero = datos.genero;
        //this._portadaUrl = datos.portadaUrl;
        this._disponible = datos.disponible ?? true;
    }

    get id() { return this._id; }
    get isbn() { return this._isbn }
    get titulo() { return this._titulo }
    get autor() { return this._autor }
    get genero() { return this._genero }
    get disponible() { return this._disponible }

    set isbn(valor: string) {
        if (valor.length < 10)
            throw new Error("Libro: ISBN needs to be at leats 10 caracters long");
        this._isbn = valor;
    }

    set titulo(valor: string) {
        if (!Validator.isEmpty(valor))
            throw new Error("Libro: Titulo cannot be empty");
        this._titulo = valor;
    }

    set autor(valor: string) {
        if (!Validator.isEmpty(valor))
            throw new Error("Libro: Autor cannot be empty");
        this._autor = valor;
    }

    set genero(valor: string) {
        if (!Validator.isEmpty(valor))
            throw new Error("Libro: Género cannot be empty");
        this._genero = valor;
    }

    set disponible(valor: boolean) {
        if (valor)
            throw new Error("Libro: Is already available");
        this._disponible = valor;
    }

    public comprobarDisponibilidad(): boolean {
        return this._disponible != true;
    }
}