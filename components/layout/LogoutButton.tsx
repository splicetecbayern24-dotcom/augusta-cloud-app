"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} style={styles.button}>
      Logout
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    width: "100%",
    marginTop: 18,
    height: 46,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.06)",
    background: "rgba(255,255,255,.04)",
    color: "#eef5ff",
    cursor: "pointer",
    fontWeight: 700,
  },
};
