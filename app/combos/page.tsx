"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles } from "lucide-react"
import Link from "next/link"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Combo {
  id: string
  name: string
  description: string
  services: string[]
  preco_original: number
  preco_promocional: number
  economia: number
  sessions: number
}

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCombos = async () => {
      try {
        const combosSnapshot = await getDocs(collection(db, "combos"))
        const combosData: Combo[] = []
        combosSnapshot.forEach((doc) => {
          const data = doc.data()
          combosData.push({
            id: doc.id,
            name: data.name || "",
            description: data.description || "",
            services: data.services || [],
            preco_original: data.preco_original || 0,
            preco_promocional: data.preco_promocional || 0,
            economia: data.economia || 0,
            sessions: data.sessions || 1,
          })
        })
        setCombos(combosData)
      } catch (error) {
        console.error("Error loading combos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCombos()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando combos...</p>
      </div>
    )
  }

  return (
    <div className="py-12 md:py-16">
      <div className="container px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge className="mb-4 bg-salmon-600 text-white hover:bg-salmon-700">Economize até 30%</Badge>
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl text-balance mb-4">
            Combos Promocionais
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Combine serviços e aproveite descontos exclusivos. Mais tratamentos, mais economia!
          </p>
        </div>

        {/* Combos Grid */}
        {combos.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            {combos.map((combo) => (
              <Card
                key={combo.id}
                className="relative overflow-hidden transition-all hover:shadow-lg hover:border-salmon-300"
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Economize R$ {combo.economia}</Badge>
                </div>

                <CardHeader>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-salmon-100 text-salmon-600">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-1">{combo.name}</CardTitle>
                      <CardDescription>{combo.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Services Included */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold mb-3">Serviços inclusos:</p>
                    <div className="space-y-2">
                      {combo.services.map((service, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-salmon-600 shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6 p-4 rounded-lg bg-salmon-50/50 border border-salmon-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Valor separado:</span>
                      <span className="text-sm text-muted-foreground line-through">R$ {combo.preco_original}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Combo:</span>
                      <span className="text-2xl font-bold text-salmon-600">R$ {combo.preco_promocional}</span>
                    </div>
                  </div>

                  <Link href="/agendamento">
                    <Button className="w-full bg-salmon-600 hover:bg-salmon-700 text-white">Agendar Combo</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum combo disponível no momento.</p>
            <p className="text-sm text-muted-foreground">Entre em contato conosco para mais informações.</p>
          </div>
        )}

        {/* Custom Combo CTA */}
        <Card className="bg-gradient-to-br from-salmon-500 to-salmon-600 text-white border-0">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">Quer criar seu próprio combo?</h2>
            <p className="text-salmon-50 mb-6 max-w-2xl mx-auto">
              Fale com nossa equipe e monte um pacote personalizado de acordo com suas necessidades. Oferecemos
              descontos especiais para combos personalizados!
            </p>
            <a
              href="https://wa.me/5561986543099?text=Olá! Gostaria de criar um combo personalizado de serviços."
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="secondary" className="bg-white text-salmon-600 hover:bg-salmon-50">
                Falar no WhatsApp
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
