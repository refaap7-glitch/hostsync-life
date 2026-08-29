"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === "true";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@hostsync.app");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      toast.error("Email o contrasena incorrectos");
      return;
    }
    await getSession();
    router.push("/");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar sesion</CardTitle>
        <CardDescription>Gestiona tus propiedades desde un solo lugar.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Contrasena</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        {GOOGLE_ENABLED && (
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Continuar con Google
          </Button>
        )}

        <p className="mt-4 text-center text-sm text-gray-500">
          No tenes cuenta?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Registrate
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">Demo: demo@hostsync.app / demo1234</p>
      </CardContent>
    </Card>
  );
}
