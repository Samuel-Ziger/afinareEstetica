"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Settings, CalendarIcon, Users, Package, GraduationCap, Home, LogOut } from "lucide-react"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"

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

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("agendamentos")
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

    const q = query(collection(db, "agendamentos"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData: Appointment[] = []
      snapshot.forEach((doc) => {
        appointmentsData.push({ id: doc.id, ...doc.data() } as Appointment)
      })
      setAppointments(appointmentsData)
    })

    return () => unsubscribe()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  const stats = {
    agendamentos: appointments.length,
    receitaEstimada: appointments
      .filter((a) => a.status === "confirmado" || a.status === "concluido")
      .reduce((sum, a) => sum + (a.servicoPreco || 0), 0),
    novosClientes: appointments.filter((a) => {
      const createdDate = a.createdAt?.toDate?.()
      if (!createdDate) return false
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return createdDate >= weekAgo
    }).length,
  }

  const proximosAgendamentos = appointments.filter((a) => a.status === "confirmado").slice(0, 2)

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Adminstrativo</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setActiveTab("inicio")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "inicio" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Início</span>
          </button>

          <button
            onClick={() => setActiveTab("agendamentos-list")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "agendamentos-list" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CalendarIcon className="h-5 w-5" />
            <span>Agendamentos</span>
          </button>

          <button
            onClick={() => setActiveTab("agendamentos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "agendamentos" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CalendarIcon className="h-5 w-5" />
            <span>Agendamentos</span>
          </button>

          <button
            onClick={() => setActiveTab("servicos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "servicos" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Serviços</span>
          </button>

          <button
            onClick={() => setActiveTab("combos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "combos" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Combos</span>
          </button>

          <button
            onClick={() => setActiveTab("cursos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "cursos" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <GraduationCap className="h-5 w-5" />
            <span>Cursos</span>
          </button>

          <button
            onClick={() => setActiveTab("clientes")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "clientes" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Clientes</span>
          </button>

          <button
            onClick={() => setActiveTab("configuracoes")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "configuracoes" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Configurações</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Adminstrativo</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Afinare Estética</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {/* Resumo Semanal */}
          <Card className="bg-white p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Semanal</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Agendamentos</div>
                <div className="text-4xl font-bold text-salmon-500">{stats.agendamentos}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Receita Estimada</div>
                <div className="text-4xl font-bold text-salmon-500">R$ {stats.receitaEstimada.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Novos Clientes</div>
                <div className="text-4xl font-bold text-salmon-500">R$ {stats.novosClientes}</div>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Calendar Widget */}
            <Card className="bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>Sumo</span>
                  <span>Meng</span>
                  <span>Tegg</span>
                  <span>Dago</span>
                  <span>Tite</span>
                  <span>Thal</span>
                  <span>Fasb</span>
                  <span>Ações</span>
                </div>
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
                classNames={{
                  months: "flex flex-col",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex",
                  head_cell: "text-gray-400 rounded-md w-full font-normal text-xs",
                  row: "flex w-full mt-1",
                  cell: "text-center text-sm p-0 relative flex-1",
                  day: "h-10 w-full p-0 font-normal hover:bg-gray-100 rounded-md",
                  day_selected: "bg-salmon-500 text-white hover:bg-salmon-600",
                  day_today: "bg-salmon-100 text-salmon-600",
                  day_outside: "text-gray-300 opacity-50",
                }}
              />
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  className="text-salmon-500 border-salmon-500 hover:bg-salmon-50 bg-transparent"
                >
                  Editar
                </Button>
              </div>
            </Card>

            {/* Próximos Agendamentos */}
            <Card className="bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Agendamentos</h3>
              <div className="space-y-4">
                {proximosAgendamentos.map((app, idx) => (
                  <div key={app.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      <Image
                        src={`https://i.pravatar.cc/150?img=${idx + 1}`}
                        alt={app.clienteNome}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {app.data.includes("14:00") ? "Hoje, 14:00" : "Amanhã 09:30"} - {app.servicoNome}
                      </div>
                      <div className="text-sm text-gray-500">({app.clienteNome})</div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Confirmado</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Gestão de Conteúdo */}
            <Card className="bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestão de Conteúdo</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm pb-2 border-b text-gray-600 font-medium">
                  <span>Serviço</span>
                  <span>Preço Original</span>
                  <span>Preço Promocional</span>
                  <span>Ações</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-900">Serviços & Laser</span>
                  <span className="text-sm text-gray-900">R$ 300</span>
                  <span className="text-sm text-gray-900">-</span>
                  <Button variant="outline" size="sm" className="text-salmon-500 border-salmon-500 bg-transparent">
                    Editar
                  </Button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-900">Remove dor</span>
                  <span className="text-sm text-gray-900">R$ 250</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Confirmado</span>
                  <Button variant="outline" size="sm" className="text-salmon-500 border-salmon-500 bg-transparent">
                    Editar
                  </Button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-900">Maloal ro</span>
                  <span className="text-sm text-gray-900">R$ 250</span>
                  <span className="text-sm text-gray-900">-</span>
                  <Button variant="outline" size="sm" className="text-red-500 border-red-500 bg-transparent">
                    Excluir
                  </Button>
                </div>

                <Button className="w-full mt-4 bg-salmon-500 hover:bg-salmon-600 text-white">
                  + Adicionar Nova Foto
                </Button>
              </div>
            </Card>

            {/* Galeria de Fotos */}
            <Card className="bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Galeria de Fotos</h3>
                <Button
                  variant="outline"
                  className="text-salmon-500 border-salmon-500 hover:bg-salmon-50 bg-transparent"
                >
                  Excitar
                </Button>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Antes e Deptos</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={`https://images.unsplash.com/photo-${1629909613654 + i * 100}-28e377c37b09?w=200&h=200&fit=crop`}
                        alt={`Foto ${i}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-1 left-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-salmon-500 text-white rounded">
                          Antes e Depres
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Configurações de Contato */}
          <Card className="bg-white p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Configurações de Contato:</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p>WhatsApp: (61, 98653099</p>
              <p>Instagram @afinare.estetica</p>
              <p>Local: CLN 103...</p>
            </div>
          </Card>
        </div>
      </main>
      <Toaster />
    </div>
  )
}
