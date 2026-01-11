import { Socio as ISocio } from '../../shared/types';
import { Validator } from "../../utils/validation";

export class Socio implements ISocio {
    private _id?: number;
    private _nombre: string;
    private _apellidos: string;
    private _email: string;
    private _telefono: string;

    constructor(datos: ISocio) {
        this._id = datos.id;
        this._nombre = datos.nombre;
        this._apellidos = datos.apellidos;
        this._email = datos.email;
        this._telefono = datos.telefono;
    }

    get id() { return this._id; }
    get nombre() { return this._nombre }
    get apellidos() { return this._apellidos }
    get email() { return this._email }
    get telefono() { return this._telefono }

    set nombre(valor: string) {
        if (!Validator.isEmpty(valor))
            throw new Error("Socio: Nombre cannot be empty");
        this._nombre = valor;
    }

    set apellidos(valor: string) {
        if (!Validator.isEmpty(valor))
            throw new Error("Socio: Nombre cannot be empty");
        this._apellidos = valor;
    }

    set email(valor: string) {
        if (!Validator.isEmpty(valor))
            throw new Error("Socio: Email cannot be empty");
        if (!Validator.isValidEmail(valor))
            throw new Error("Socio: Email invalid format");
        this._email = valor;
    }

    set telefono(valor: string) {
        if (!Validator.isEmpty(valor))
            throw new Error("Socio: Telefono cannot be empty");
        this._telefono = valor;
    }
}