export const SociosView = async () => {
  const res = await fetch("/api/socios");
  const socios = await res.json();

  return `
    <h2>Socios</h2>
    <ul>
      ${socios.map((s: any) => `<li>${s.nombre}</li>`).join("")}
    </ul>
  `;
};