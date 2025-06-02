// src/app/pages/logout/page.tsx
"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      await signOut({ redirect: false });
      router.push("/pages/login");
    }
    logout();
  }, [router]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Saindo...</h1>
      <p>Aguarde enquanto encerramos sua sessão.</p>
    </div>
  );
}
