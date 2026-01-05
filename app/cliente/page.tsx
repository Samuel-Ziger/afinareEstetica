"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, User, Phone, Mail, LogOut, Home } from "lucide-react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"

interface Appointment {
  id: string
  clienteNome: string
  clienteEmail: string
  clientePhone: string
  servicoNome: string
  servicoPreco: number
  data: string
  hora: string
  status: "pendente" | "confirmado" | "concluido" | "cancelado"
  createdAt: any
}

const statusLabels = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
}

const statusColors = {
  pendente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-green-100 text-green-800",
  concluido: "bg-blue-100 text-blue-800",
  cancelado: "bg-red-100 text-red-800",
}

export default function ClienteArea() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setLoading(false)
      } else {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (!user) return

    // Buscar agendamentos do cliente pelo email ou clienteId
    // Firestore não permite OR queries, então vamos buscar por email
    // (clienteId será usado quando disponível, mas email é mais confiável para histórico)
    const q = query(
      collection(db, "agendamentos"),
      where("clienteEmail", "==", user.email),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appointmentsData: Appointment[] = []
        snapshot.forEach((doc) => {
          appointmentsData.push({ id: doc.id, ...doc.data() } as Appointment)
        })
        setAppointments(appointmentsData)
      },
      (error) => {
        console.error("Error loading appointments:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus agendamentos",
          variant: "destructive",
        })
      }
    )

    return () => unsubscribe()
  }, [user, toast])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Erro",
        description: "Não foi possível fazer logout",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split("/")
    const date = new Date(`${year}-${month}-${day}`)
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-salmon-50 via-white to-salmon-100/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold text-salmon-600 mb-2">Área do Cliente</h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Início
              </Button>
            </Link>
            <Link href="/agendamento">
              <Button className="bg-salmon-600 hover:bg-salmon-700 text-white gap-2">
                <CalendarIcon className="h-4 w-4" />
                Novo Agendamento
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground">Total de Agendamentos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {appointments.filter((a) => a.status === "pendente").length}
              </div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {appointments.filter((a) => a.status === "confirmado").length}
              </div>
              <p className="text-xs text-muted-foreground">Confirmados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {appointments.filter((a) => a.status === "concluido").length}
              </div>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Agendamentos</CardTitle>
            <CardDescription>Histórico completo dos seus agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Você ainda não possui agendamentos</p>
                <Link href="/agendamento">
                  <Button className="bg-salmon-600 hover:bg-salmon-700 text-white">
                    Fazer Primeiro Agendamento
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="border-l-4 border-l-salmon-600">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{appointment.servicoNome}</h3>
                              <Badge className={`mt-2 ${statusColors[appointment.status]}`}>
                                {statusLabels[appointment.status]}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CalendarIcon className="h-4 w-4" />
                              <span className="font-medium">Data:</span>
                              <span>{formatDate(appointment.data)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Horário:</span>
                              <span>{appointment.hora}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-medium">Valor:</span>
                              <span className="text-salmon-600 font-semibold">
                                R$ {appointment.servicoPreco?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <User className="h-4 w-4" />
                              <span>{appointment.clienteNome}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <Mail className="h-4 w-4" />
                              <span>{appointment.clienteEmail}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{appointment.clientePhone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
