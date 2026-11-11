import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";

export const metadata: Metadata = { title: "Ingresar · Vocabulanding" };

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
