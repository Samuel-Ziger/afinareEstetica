"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha e-mail e senha",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "Login realizado!",
        description: "Redirecionando...",
      })
      router.push("/admin")
    } catch (error: any) {
      console.error("[v0] Login error:", error)

      let errorMessage = "Erro ao fazer login. Verifique suas credenciais."

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "E-mail ou senha incorretos."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "E-mail inválido."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde."
      }

      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-salmon-50 via-white to-salmon-100/30 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-salmon-600 mb-2">Afinare Estética</h1>
          <p className="text-muted-foreground">Painel de Acesso</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Acesse o painel administrativo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-salmon-600 hover:bg-salmon-700 text-white">
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Esqueceu sua senha?</p>
              <a
                href="https://wa.me/5561986543099?text=Esqueci minha senha do painel administrativo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-salmon-600 hover:underline"
              >
                Entre em contato
              </a>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">@afinare.estetica</p>
      </div>
      <Toaster />
    </div>
  )
}
