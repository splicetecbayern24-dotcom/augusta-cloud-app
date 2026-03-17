import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "AUGUSTA Gerüstbau UG",
  description: "AUGUSTA Rechnungssoftware",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
