import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={styles.page}>
      <div style={styles.glowA} />
      <div style={styles.glowB} />
      <Sidebar />
      <main style={styles.content}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#050b14,#081222 45%,#0a1527)",
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    position: "relative",
    overflow: "hidden",
  },
  glowA: {
    position: "absolute",
    width: 420,
    height: 420,
    right: -120,
    top: -120,
    background: "radial-gradient(circle, rgba(255,191,0,.14), transparent 60%)",
    pointerEvents: "none",
  },
  glowB: {
    position: "absolute",
    width: 600,
    height: 500,
    left: 260,
    bottom: -160,
    background: "radial-gradient(circle, rgba(19,73,170,.2), transparent 65%)",
    pointerEvents: "none",
  },
  content: {
    padding: 16,
    position: "relative",
    zIndex: 2,
  },
};
