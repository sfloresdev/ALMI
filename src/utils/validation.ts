export class Validator {
    // Valida cadena vacia
    public static isEmpty(value: string): boolean {
        return value != null && value != undefined && value.trim().length > 0;
    }

    // Valida campo numerico vacio
    public static numberEmpty(value: number): boolean {
        return value != null && value != undefined;
    }

    // Valida formato de email
    public static isValidEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Valida fecha (ISO 8601 : YYYY-MM-DD)
    public static isValidDate(date: string): boolean {
        const isoRegexDate = /^\d{4}-\d{2}-\d{2}$/;
        return isoRegexDate.test(date);
    }
}
