"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Zap, Syringe, Flower2, Wind, Sparkles, MapPin, Phone, Clock, LayoutDashboard } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function HomePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50">
      {isAdmin && (
        <div className="fixed top-20 right-6 z-50">
          <Link href="/admin">
            <Button className="bg-salmon-600 hover:bg-salmon-700 text-white shadow-lg">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard Admin
            </Button>
          </Link>
        </div>
      )}

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
            <Button size="lg" className="bg-salmon-500 hover:bg-salmon-600 text-white px-8 rounded-full">
              Agende Sua Avaliação
            </Button>
          </div>
        </div>

        {/* Floating Widgets - Top Right */}
        <div className="absolute top-6 right-6 flex gap-3">
          {/* Localização Button */}
          <Card className="p-4 bg-salmon-500 text-white border-0 shadow-lg">
            <div className="flex flex-col items-center gap-1 min-w-[120px]">
              <MapPin className="h-5 w-5" />
              <div className="text-xs font-medium text-center">Localização</div>
            </div>
          </Card>

          {/* WhatsApp Contact */}
          <Card className="p-4 bg-white border-0 shadow-lg">
            <div className="flex flex-col items-center gap-1 min-w-[120px]">
              <Phone className="h-5 w-5 text-gray-700" />
              <div className="text-xs font-medium text-gray-700">Contato</div>
              <div className="text-xs text-gray-500">WhatsApp:</div>
              <div className="text-xs text-gray-700">(61) 98654-3099</div>
            </div>
          </Card>

          {/* Horários */}
          <Card className="p-4 bg-white border-0 shadow-lg">
            <div className="flex flex-col items-center gap-1 min-w-[120px]">
              <Clock className="h-5 w-5 text-gray-700" />
              <div className="text-xs font-medium text-gray-700 text-center">Horários</div>
              <div className="text-xs text-gray-500 text-center">Retornas</div>
            </div>
          </Card>
        </div>

        {/* Floating Booking Card - Right Side */}
        <Card className="absolute top-32 right-6 w-[340px] bg-white shadow-2xl rounded-2xl overflow-hidden z-50">
          {/* Service Header with Images */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Remoção a Laser</h3>
              <button className="text-gray-400 hover:text-gray-600">⋯</button>
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
                <div className="text-3xl font-bold text-salmon-500">R$ 250</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 line-through mb-1">R$ 3.300</div>
                <div className="text-sm text-gray-600">Valor Promocional:</div>
                <div className="text-sm font-semibold text-gray-600">R$ 250</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-2">Valor Promocional: R$ 250</div>

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

          {/* Booking Form */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-xs font-semibold text-gray-700 mb-3">AGATHAIAG:</div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Nome:</label>
                <input type="text" className="w-full px-3 py-1.5 text-xs border rounded-md" placeholder="Seu nome" />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Sobrenome:</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 text-xs border rounded-md"
                  placeholder="Seu sobrenome"
                />
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-6 h-6 rounded border flex items-center justify-center text-xs">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500">Desconhecer</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Vertical Side Menu */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-salmon-500 rounded-r-lg p-2 shadow-lg">
          <div className="flex flex-col gap-2">
            <div className="w-1 h-1 rounded-full bg-white"></div>
            <div className="w-1 h-1 rounded-full bg-white"></div>
            <div className="w-1 h-1 rounded-full bg-white"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Serviços</h2>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {/* Service 1 */}
            <div className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-20 h-20 rounded-2xl border-2 border-gray-200 flex items-center justify-center group-hover:border-salmon-500 transition-colors">
                <Zap className="h-8 w-8 text-salmon-400 stroke-[1.5]" />
              </div>
              <div className="text-center text-sm text-gray-700">
                Remoção a<br />
                Laser
              </div>
            </div>

            {/* Service 2 */}
            <div className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-20 h-20 rounded-2xl border-2 border-gray-200 flex items-center justify-center group-hover:border-salmon-500 transition-colors">
                <div className="relative">
                  <div className="absolute -left-2 top-0 text-salmon-400 text-2xl">×</div>
                  <div className="absolute -right-2 top-0 text-salmon-400 text-2xl">×</div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-700">
                Acupuntura
                <br />+ Massagem
              </div>
            </div>

            {/* Service 3 */}
            <div className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-20 h-20 rounded-2xl border-2 border-gray-200 flex items-center justify-center group-hover:border-salmon-500 transition-colors">
                <Syringe className="h-8 w-8 text-salmon-400 stroke-[1.5]" />
              </div>
              <div className="text-center text-sm text-gray-700">
                Limpeza
                <br />
                Facial
              </div>
            </div>

            {/* Service 4 */}
            <div className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-20 h-20 rounded-2xl border-2 border-gray-200 flex items-center justify-center group-hover:border-salmon-500 transition-colors">
                <Flower2 className="h-8 w-8 text-salmon-400 stroke-[1.5]" />
              </div>
              <div className="text-center text-sm text-gray-700">Botox</div>
            </div>

            {/* Service 5 */}
            <div className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-20 h-20 rounded-2xl border-2 border-gray-200 flex items-center justify-center group-hover:border-salmon-500 transition-colors">
                <Wind className="h-8 w-8 text-salmon-400 stroke-[1.5]" />
              </div>
              <div className="text-center text-sm text-gray-700">
                Drenagem
                <br />
                Botox
              </div>
            </div>

            {/* Service 6 */}
            <div className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-20 h-20 rounded-2xl border-2 border-gray-200 flex items-center justify-center group-hover:border-salmon-500 transition-colors">
                <Sparkles className="h-8 w-8 text-salmon-400 stroke-[1.5]" />
              </div>
              <div className="text-center text-sm text-gray-700">Outros</div>
            </div>
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
