import Link from "next/link";

const establiments = [
  { nom: "Els Esclopets", href: "/esclopets", descripcio: "Casa rural · Alt Penedès" },
];

export default function Home() {
  return (
    <main style={{
      fontFamily: "var(--font-body, DM Sans, sans-serif)",
      backgroundColor: "#0f0f0f",
      color: "#f0f0f0",
      minHeight: "100vh",
      width: "100%",
      padding: "20px",
      maxWidth: "480px",
      margin: "0 auto",
      boxSizing: "border-box",
    }}>
      <div style={{ marginBottom: "36px", paddingTop: "8px" }}>
        <h1 style={{
          fontFamily: "var(--font-display, Syne, sans-serif)",
          fontWeight: 800,
          fontSize: "22px",
          letterSpacing: "-0.03em",
          marginBottom: "8px",
        }}>
          Check-in online
        </h1>
        <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6 }}>
          Benvingut al sistema de check-in online.<br />
          Selecciona el teu establiment per continuar.
        </p>
      </div>

      <p style={{ color: "#888", fontSize: "13px", fontWeight: 500, marginBottom: "12px" }}>
        Establiments disponibles
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {establiments.map(e => (
          <li key={e.href}>
            <Link
              href={e.href}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#171717",
                border: "1px solid #2a2a2a",
                borderRadius: "12px",
                padding: "16px",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.2s",
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: "15px", marginBottom: "3px" }}>{e.nom}</p>
                <p style={{ color: "#888", fontSize: "13px" }}>{e.descripcio}</p>
              </div>
              <span style={{ color: "#1D9E75", fontSize: "20px", marginLeft: "12px" }}>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
