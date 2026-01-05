"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Clock } from "lucide-react"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

const services = [
  { id: "remocao-tatuagem", name: "Remoção de Tatuagem a Laser", price: 250 },
  { id: "acupuntura-massagem", name: "Acupuntura + Massagem", price: 150 },
  { id: "limpeza-facial", name: "Limpeza Facial Profunda", price: 120 },
  { id: "botox", name: "Botox", price: 400 },
  { id: "drenagem-linfatica", name: "Drenagem Linfática", price: 130 },
]

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

export default function AgendamentoPage() {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail || !clientPhone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const service = services.find((s) => s.id === selectedService)
      const formattedDate = selectedDate.toLocaleDateString("pt-BR")

      // Save to Firestore
      await addDoc(collection(db, "agendamentos"), {
        clienteNome: clientName,
        clienteEmail: clientEmail,
        clientePhone: clientPhone,
        servicoId: selectedService,
        servicoNome: service?.name,
        servicoPreco: service?.price,
        data: formattedDate,
        hora: selectedTime,
        status: "pendente",
        createdAt: Timestamp.now(),
      })

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
      console.error("[v0] Error creating appointment:", error)
      toast({
        title: "Erro ao agendar",
        description: "Ocorreu um erro. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
                  {services.map((service) => (
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
                          <p className="text-sm text-salmon-600 font-semibold mt-1">R$ {service.price}</p>
                        </div>
                        {selectedService === service.id && (
                          <div className="h-6 w-6 rounded-full bg-salmon-600 text-white flex items-center justify-center">
                            ✓
                          </div>
                        )}
                      </div>
                    </button>
                  ))}

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
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      className="rounded-md border mx-auto"
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <Label className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4" />
                        Escolha o Horário
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 text-sm rounded-lg border-2 transition-all ${
                              selectedTime === time
                                ? "border-salmon-600 bg-salmon-50 font-semibold"
                                : "border-border hover:border-salmon-300"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
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
                          {services.find((s) => s.id === selectedService)?.price}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
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
