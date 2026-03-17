export default function EinstellungenPage() {
  return (
    <section style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.title}>Einstellungen</div>
        <div style={styles.text}>
          Hier kommen später Firmendaten, Mail-Einstellungen und Systemoptionen rein.
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    color: "#fff",
  },
  card: {
    borderRadius: 24,
    padding: 24,
    border: "1px solid rgba(255,255,255,.08)",
    background: "rgba(255,255,255,.03)",
  },
  title: {
    fontSize: 32,
    fontWeight: 900,
    marginBottom: 12,
  },
  text: {
    color: "#9db0cf",
    fontSize: 16,
  },
};
