export abstract class Component {
    // Devuelve HTML plano del componente en formato string
    abstract render(): string

    // Si es necesario, añade eventos (click, submits, etc...)
    afterRender?(): void {
    }
}
