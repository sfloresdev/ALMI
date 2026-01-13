export const HomeView = async () => {
  const res = await fetch("/api/home");
  const home = await res.json();

  return `
    <h2>Home</h2>
    <ul>
      ${home.map((h: any) => `<li>${h.nombre}</li>`).join("")}
    </ul>
  `;
};