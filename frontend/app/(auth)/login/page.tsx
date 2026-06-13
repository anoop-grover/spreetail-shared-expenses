"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await api<{ access: string; refresh: string }>("/auth/login/", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("accessToken", result.access);
      localStorage.setItem("refreshToken", result.refresh);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-semibold">Sign in</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" required />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" required />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full">Sign in</Button>
            <Button type="button" variant="outline" className="w-full">Continue with Google</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
