"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Clock, X } from "lucide-react"
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Service {
  id: string
  name: string
  preco_promocional: number
}

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

export default function AgendamentoPage() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingServices, setLoadingServices] = useState(true)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())
  const [slotCounts, setSlotCounts] = useState<Map<string, number>>(new Map())
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      if (user) {
        // Preencher dados do cliente se estiver logado
        setClientEmail(user.email || "")
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const loadServices = async () => {
      try {
        const servicesSnapshot = await getDocs(collection(db, "servicos"))
        const servicesData: Service[] = []
        servicesSnapshot.forEach((doc) => {
          const data = doc.data()
          servicesData.push({
            id: doc.id,
            name: data.name || "",
            preco_promocional: data.preco_promocional || 0,
          })
        })
        setServices(servicesData)
      } catch (error) {
        console.error("Error loading services:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os serviços",
          variant: "destructive",
        })
      } finally {
        setLoadingServices(false)
      }
    }

    loadServices()
  }, [toast])

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedDate) {
        setBookedSlots(new Set())
        return
      }

      setLoadingAvailability(true)
      try {
        const formattedDate = selectedDate.toLocaleDateString("pt-BR")
        const appointmentsQuery = query(
          collection(db, "agendamentos"),
          where("data", "==", formattedDate),
          where("status", "in", ["pendente", "confirmado"])
        )
        const appointmentsSnapshot = await getDocs(appointmentsQuery)
        const booked = new Set<string>()
        const counts = new Map<string, number>()
        
        appointmentsSnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.hora) {
            const currentCount = counts.get(data.hora) || 0
            counts.set(data.hora, currentCount + 1)
            
            // Se já tem 2 ou mais agendamentos, marca como indisponível
            if (currentCount + 1 >= 2) {
              booked.add(data.hora)
            }
          }
        })
        
        setSlotCounts(counts)
        setBookedSlots(booked)
      } catch (error) {
        console.error("Error loading availability:", error)
      } finally {
        setLoadingAvailability(false)
      }
    }

    loadAvailability()
  }, [selectedDate])

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail || !clientPhone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      })
      return
    }

    // Verificar se o horário ainda está disponível (máximo 2 pessoas por horário)
    const currentCount = slotCounts.get(selectedTime) || 0
    if (currentCount >= 2) {
      toast({
        title: "Horário indisponível",
        description: "Este horário já está completo (máximo 2 pessoas por horário). Por favor, escolha outro.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const service = services.find((s) => s.id === selectedService)
      const formattedDate = selectedDate.toLocaleDateString("pt-BR")

      // Save to Firestore
      const appointmentData: any = {
        clienteNome: clientName,
        clienteEmail: clientEmail,
        clientePhone: clientPhone,
        servicoId: selectedService,
        servicoNome: service?.name,
        servicoPreco: service?.preco_promocional,
        data: formattedDate,
        hora: selectedTime,
        status: "pendente",
        createdAt: Timestamp.now(),
      }

      // Adicionar clienteId se o usuário estiver logado
      if (currentUser) {
        appointmentData.clienteId = currentUser.uid
      }

      await addDoc(collection(db, "agendamentos"), appointmentData)

      // Open WhatsApp
      const message = `Novo agendamento:\n\nNome: ${clientName}\nServiço: ${service?.name}\nData: ${formattedDate}\nHorário: ${selectedTime}\nTelefone: ${clientPhone}\nE-mail: ${clientEmail}`
      const whatsappUrl = `https://wa.me/5561986543099?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")

      toast({
        title: "Agendamento realizado!",
        description: "Em breve entraremos em contato para confirmar.",
      })

      // Reset form
      setStep(1)
      setSelectedService("")
      setSelectedDate(undefined)
      setSelectedTime("")
      setClientName("")
      setClientEmail("")
      setClientPhone("")
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Erro ao agendar",
        description: "Ocorreu um erro. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getAvailableDates = () => {
    const today = new Date()
    const maxDate = new Date()
    maxDate.setDate(today.getDate() + 60) // 60 dias à frente
    return { min: today, max: maxDate }
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate < today || date.getDay() === 0 // Desabilita domingos
  }

  if (loadingServices) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando serviços...</p>
      </div>
    )
  }

  return (
    <div className="py-12 md:py-16">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-bold tracking-tight mb-4">Agende seu Horário</h1>
            <p className="text-muted-foreground">
              Preencha as informações abaixo para realizar seu agendamento. Entraremos em contato para confirmação.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  step >= 1 ? "bg-salmon-600 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <div className={`h-1 w-12 ${step >= 2 ? "bg-salmon-600" : "bg-muted"}`} />
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  step >= 2 ? "bg-salmon-600 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <div className={`h-1 w-12 ${step >= 3 ? "bg-salmon-600" : "bg-muted"}`} />
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  step >= 3 ? "bg-salmon-600 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "Escolha o Serviço"}
                {step === 2 && "Data e Horário"}
                {step === 3 && "Seus Dados"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Selecione o serviço que deseja agendar"}
                {step === 2 && "Escolha a melhor data e horário para você"}
                {step === 3 && "Preencha seus dados para contato"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Step 1: Service Selection */}
              {step === 1 && (
                <div className="space-y-3">
                  {services.length > 0 ? (
                    services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedService === service.id
                            ? "border-salmon-600 bg-salmon-50"
                            : "border-border hover:border-salmon-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{service.name}</p>
                            <p className="text-sm text-salmon-600 font-semibold mt-1">R$ {service.preco_promocional}</p>
                          </div>
                          {selectedService === service.id && (
                            <div className="h-6 w-6 rounded-full bg-salmon-600 text-white flex items-center justify-center">
                              ✓
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Nenhum serviço disponível no momento.</p>
                  )}

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedService}
                    className="w-full mt-6 bg-salmon-600 hover:bg-salmon-700 text-white"
                  >
                    Continuar
                  </Button>
                </div>
              )}

              {/* Step 2: Date and Time */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label className="flex items-center gap-2 mb-3">
                      <CalendarIcon className="h-4 w-4" />
                      Escolha a Data
                    </Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isDateDisabled}
                      className="rounded-md border mx-auto"
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <Label className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4" />
                        Escolha o Horário {loadingAvailability && "(Carregando...)"}
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => {
                          const isBooked = bookedSlots.has(time)
                          return (
                            <button
                              key={time}
                              onClick={() => !isBooked && setSelectedTime(time)}
                              disabled={isBooked}
                              className={`p-3 text-sm rounded-lg border-2 transition-all ${
                                isBooked
                                  ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : selectedTime === time
                                  ? "border-salmon-600 bg-salmon-50 font-semibold"
                                  : "border-border hover:border-salmon-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{time}</span>
                                {isBooked && <X className="h-4 w-4" />}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                      {bookedSlots.size > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {bookedSlots.size} horário(s) já completo(s) (máximo 2 pessoas por horário)
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <Button onClick={() => setStep(1)} variant="outline" className="w-full">
                      Voltar
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!selectedDate || !selectedTime}
                      className="w-full bg-salmon-600 hover:bg-salmon-700 text-white"
                    >
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Client Information */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                    <Input
                      id="phone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(61) 98765-4321"
                    />
                  </div>

                  {/* Summary */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm font-semibold mb-2">Resumo do Agendamento:</p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">Serviço:</span>{" "}
                          {services.find((s) => s.id === selectedService)?.name}
                        </p>
                        <p>
                          <span className="font-medium">Data:</span> {selectedDate?.toLocaleDateString("pt-BR")}
                        </p>
                        <p>
                          <span className="font-medium">Horário:</span> {selectedTime}
                        </p>
                        <p>
                          <span className="font-medium">Valor:</span> R${" "}
                          {services.find((s) => s.id === selectedService)?.preco_promocional}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-3">
                    <Button onClick={() => setStep(2)} variant="outline" className="w-full">
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full bg-salmon-600 hover:bg-salmon-700 text-white"
                    >
                      {loading ? "Agendando..." : "Confirmar Agendamento"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
