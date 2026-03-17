"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/rechnungen", label: "Rechnungen" },
  { href: "/kunden", label: "Kunden" },
  { href: "/projekte", label: "Projekte" },
  { href: "/mitarbeiter", label: "Mitarbeiter" },
  { href: "/einstellungen", label: "Einstellungen" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoWrap}>
        <div style={styles.logoMark}>A</div>
        <div>
          <div style={styles.logoTop}>AUGUSTA</div>
          <div style={styles.logoBottom}>GERÜSTBAU UG</div>
        </div>
      </div>

      <div style={styles.profileCard}>
        <div style={styles.profileSmall}>Eingeloggt als</div>
        <div style={styles.profileName}>Kürşat Turaner</div>
        <div style={styles.profileRole}>Geschäftsführung</div>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...styles.navItem,
                ...(active ? styles.navItemActive : {}),
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 280,
    minHeight: "100vh",
    position: "sticky",
    top: 0,
    padding: 16,
    borderRight: "1px solid rgba(255,255,255,.08)",
    background: "linear-gradient(180deg, rgba(8,17,34,.98), rgba(6,12,24,1))",
    boxSizing: "border-box",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    background: "linear-gradient(135deg,#ffcf3c,#f3b300)",
    color: "#111",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 28,
  },
  logoTop: {
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: ".18em",
    color: "#fff",
  },
  logoBottom: {
    color: "#94a8c9",
    letterSpacing: ".22em",
    fontSize: 14,
  },
  profileCard: {
    borderRadius: 22,
    padding: 16,
    background: "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02))",
    border: "1px solid rgba(255,255,255,.07)",
    marginBottom: 18,
    color: "#fff",
  },
  profileSmall: {
    color: "#94a8c9",
    fontSize: 13,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 30,
    fontWeight: 900,
    lineHeight: 1.05,
  },
  profileRole: {
    color: "#9db0cf",
    marginTop: 6,
    fontSize: 15,
  },
  nav: {
    display: "grid",
    gap: 10,
  },
  navItem: {
    display: "block",
    padding: "14px 16px",
    borderRadius: 16,
    textDecoration: "none",
    color: "#dbe7ff",
    background: "rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,.05)",
    fontWeight: 700,
  },
  navItemActive: {
    background: "linear-gradient(135deg,#ffcf3c,#f3b300)",
    color: "#111",
  },
};
