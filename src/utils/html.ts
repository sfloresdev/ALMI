// Esta función no hace NADA, solo devuelve el texto.
// Pero sirve para "marcar" el string para el editor.
const html = (strings: TemplateStringsArray, ...values: any[]) => String.raw({ raw: strings }, ...values);