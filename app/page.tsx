"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Syringe, Flower2, Wind, Sparkles, MapPin, Phone, Calendar as CalendarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const services = [
  {
    id: "massagens",
    name: "Massagens",
    preco_original: 200,
    preco_promocional: 150,
  },
  {
    id: "limpeza-facial",
    name: "Limpeza Facial",
    preco_original: 160,
    preco_promocional: 120,
  },
  {
    id: "acupuntura",
    name: "Acupuntura",
    preco_original: 180,
    preco_promocional: 140,
  },
  {
    id: "terapias-combinadas",
    name: "Terapias Combinadas",
    preco_original: 300,
    preco_promocional: 250,
  },
  {
    id: "criolipolise",
    name: "Criolipólise",
    preco_original: 800,
    preco_promocional: 650,
  },
  {
    id: "depilacao-cera",
    name: "Depilação à Cera",
    preco_original: 100,
    preco_promocional: 80,
  },
  {
    id: "epilacao-laser",
    name: "Epilação a Laser",
    preco_original: 400,
    preco_promocional: 320,
  },
  {
    id: "botox",
    name: "Botox",
    preco_original: 500,
    preco_promocional: 400,
  },
  {
    id: "peelings",
    name: "Peelings",
    preco_original: 250,
    preco_promocional: 200,
  },
  {
    id: "remocao-tatuagens",
    name: "Remoção de Tatuagens",
    preco_original: 350,
    preco_promocional: 280,
  },
  {
    id: "despigmentacao-sobrancelhas",
    name: "Despigmentação de Sobrancelhas",
    preco_original: 300,
    preco_promocional: 240,
  },
  {
    id: "lipo-enzimatica",
    name: "Lipo Enzimática",
    preco_original: 450,
    preco_promocional: 360,
  },
  {
    id: "hidrolipoclasia",
    name: "Hidrolipoclasia",
    preco_original: 500,
    preco_promocional: 400,
  },
]

export default function HomePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedService, setSelectedService] = useState<string>("massagens")
  
  const currentService = services.find(s => s.id === selectedService) || services[0]

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Hero Section with background image and floating widgets */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=1600&h=900&fit=crop"
            alt="Tratamento facial"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container relative h-full flex items-center px-4">
          <div className="max-w-xl">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6 text-balance leading-tight">
              Transforme
              <br />
              Sua Beleza
            </h1>
            <Link href="/agendamento">
              <Button size="lg" className="bg-salmon-500 hover:bg-salmon-600 text-white px-8 rounded-full">
                Agende Sua Avaliação
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating Widgets - Top Right */}
        <div className="absolute top-6 right-24 flex gap-3">
          {/* Localização Button */}
          <Link
            href="https://www.google.com/maps/search/?api=1&query=CLN+103+bl+b+sala+16+Asa+Norte+Brasilia"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Card className="p-4 bg-salmon-500 text-white border-0 shadow-lg hover:bg-salmon-600 transition-colors">
              <div className="flex flex-col items-center gap-1 min-w-[120px]">
                <MapPin className="h-5 w-5" />
                <div className="text-xs font-medium text-center">Localização</div>
              </div>
            </Card>
          </Link>

          {/* WhatsApp Contact */}
          <Link
            href="https://wa.me/5561986543099"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Card className="p-4 bg-white border-0 shadow-lg hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center gap-1 min-w-[120px]">
                <Phone className="h-5 w-5 text-gray-700" />
                <div className="text-xs font-medium text-center text-gray-700">WhatsApp</div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Calendar Button - Fixed Position */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="fixed top-32 right-6 bg-salmon-500 hover:bg-salmon-600 text-white shadow-2xl rounded-full p-4 z-[100]"
              size="icon"
            >
              <CalendarIcon className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[400px] max-h-[90vh] overflow-y-auto">
            <Card className="bg-white shadow-2xl rounded-2xl overflow-hidden border-0">
              {/* Service Header with Images */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="w-full max-w-[280px] border-gray-300">
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Before/During/After Images */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=200&h=200&fit=crop"
                      alt="Antes"
                      width={100}
                      height={100}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=200&h=200&fit=crop"
                      alt="Durante"
                      width={100}
                      height={100}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop"
                      alt="Depois"
                      width={100}
                      height={100}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Valor Original:</div>
                    <div className="text-3xl font-bold text-salmon-500">R$ {currentService.preco_promocional}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 line-through mb-1">R$ {currentService.preco_original}</div>
                    <div className="text-sm text-gray-600">Valor Promocional:</div>
                    <div className="text-sm font-semibold text-gray-600">R$ {currentService.preco_promocional}</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-2">Valor Promocional: R$ {currentService.preco_promocional}</div>

                <Button className="w-full mt-3 bg-salmon-500 hover:bg-salmon-600 text-white rounded-lg">Agendar</Button>
              </div>

              {/* Calendar Icon Row */}
              <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">Disponível</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded bg-white border flex items-center justify-center text-xs text-gray-400"
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar component */}
              <div className="p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-salmon-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
                    day_selected:
                      "bg-salmon-500 text-white hover:bg-salmon-600 hover:text-white focus:bg-salmon-500 focus:text-white",
                    day_today: "bg-salmon-100 text-salmon-600",
                    day_outside: "text-gray-300 opacity-50",
                    day_disabled: "text-gray-300 opacity-50",
                    day_range_middle: "aria-selected:bg-salmon-100 aria-selected:text-salmon-600",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </Card>
          </DialogContent>
        </Dialog>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Serviços</h2>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {services.slice(0, 8).map((service) => (
              <div
                key={service.id}
                className="px-6 py-3 rounded-full border-2 border-salmon-500 bg-white text-salmon-500 hover:bg-salmon-500 hover:text-white transition-colors cursor-pointer text-center text-sm font-medium"
              >
                {service.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Combos Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Combos</h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Combo 1 - Featured Course */}
            <Card className="bg-gradient-to-br from-salmon-400 to-salmon-500 text-white border-0 p-8 relative overflow-hidden">
              {/* Decorative flowers */}
              <div className="absolute right-4 bottom-4 opacity-30">
                <div className="relative">
                  <Flower2 className="h-32 w-32" />
                  <Flower2 className="h-20 w-20 absolute -right-8 top-8" />
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 text-balance leading-tight">
                  CURSO DE
                  <br />
                  REMOÇÃO A LASER
                </h3>
                <p className="text-sm text-white/90 mb-6 leading-relaxed">
                  Domine sua carreira como desejado! Seja nossa aluna Afinare e torne-se uma profissional completa.
                  Aprenda as melhores técnicas e conquiste seus clientes.
                </p>
                <p className="text-xs text-white/80 mb-6">#AreaDoAlunos</p>
                <Button variant="secondary" className="bg-white text-salmon-500 hover:bg-salmon-50 rounded-full">
                  Inscreva-se
                </Button>
              </div>
            </Card>

            {/* Combo 2 */}
            <Card className="border-2 border-gray-200 p-8 hover:border-salmon-300 transition-colors bg-white">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl border-2 border-salmon-200 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-salmon-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2 text-gray-900">Combo Facial</h3>
              <p className="text-center text-sm text-gray-500 mb-4">Botox + Limpeza</p>
              <div className="text-center">
                <div className="text-3xl font-bold text-salmon-500">R$ 3.350</div>
                <p className="text-xs text-gray-400 mt-1">Economize 20%</p>
              </div>
              <Button className="w-full mt-6 bg-salmon-500 hover:bg-salmon-600 text-white">Escolher</Button>
            </Card>

            {/* Combo 3 */}
            <Card className="border-2 border-gray-200 p-8 hover:border-salmon-300 transition-colors bg-white">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl border-2 border-salmon-200 flex items-center justify-center">
                  <div className="flex gap-1">
                    <Sparkles className="h-6 w-6 text-salmon-400" />
                    <Syringe className="h-6 w-6 text-salmon-400" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2 text-gray-900">Limpeza + Botox</h3>
              <p className="text-center text-sm text-gray-500 mb-4">Botox Luxo</p>
              <div className="text-center">
                <div className="text-3xl font-bold text-salmon-500">R$ 4.250</div>
                <p className="text-xs text-gray-400 mt-1">Economize 25%</p>
              </div>
              <Button className="w-full mt-6 bg-salmon-500 hover:bg-salmon-600 text-white">Escolher</Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
