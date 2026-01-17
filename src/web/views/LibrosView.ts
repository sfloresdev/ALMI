export const LibrosView = async () => {
  const res = await fetch("/api/libros");
  const libros = await res.json();

  return `
    <h2>Libros</h2>
    <ul>
      ${libros.map((l: any) => `<li>${l.nombre}</li>`).join("")}
    </ul>
  `;
};
