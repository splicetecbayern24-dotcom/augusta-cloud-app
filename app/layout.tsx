export const metadata = {
  title: "AUGUSTA Gerüstbau UG – Cloud App V4",
  description: "Dashboard, PDF, Mail, Supabase",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#08101d", color: "#fff" }}>
        {children}
      </body>
    </html>
  );
}
