"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Check, Clock, Star, X } from "lucide-react"
import Image from "next/image"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Service {
  id: string
  name: string
  description: string
  preco_original: number
  preco_promocional: number
  category: string
  longDescription?: string
  duration?: string
  benefits?: string[]
  faqs?: { question: string; answer: string }[]
  fotos?: string[]
}

function ServicosContent() {
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

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
            description: data.description || "",
            preco_original: data.preco_original || 0,
            preco_promocional: data.preco_promocional || 0,
            category: data.category || "wellness",
            longDescription: data.longDescription,
            duration: data.duration,
            benefits: data.benefits,
            faqs: data.faqs,
            fotos: data.fotos,
          })
        })
        setServices(servicesData)
      } catch (error) {
        console.error("Error loading services:", error)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  useEffect(() => {
    const serviceId = searchParams.get("id")
    if (serviceId && services.length > 0) {
      const service = services.find((s) => s.id === serviceId)
      if (service) {
        // Carregar dados completos do serviço
        const loadServiceDetails = async () => {
          try {
            const serviceDoc = await getDoc(doc(db, "servicos", serviceId))
            if (serviceDoc.exists()) {
              setSelectedService({ id: serviceDoc.id, ...serviceDoc.data() } as Service)
            }
          } catch (error) {
            console.error("Error loading service details:", error)
          }
        }
        loadServiceDetails()
      }
    } else {
      setSelectedService(null)
    }
  }, [searchParams, services])

  const closeDetails = () => {
    router.push("/servicos")
    setSelectedService(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando serviços...</p>
      </div>
    )
  }

  // Se houver um serviço selecionado, mostrar página de detalhes
  if (selectedService) {
    return (
      <div className="py-12 md:py-16">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <Button
              variant="ghost"
              onClick={closeDetails}
              className="mb-6"
            >
              ← Voltar para Serviços
            </Button>

            <div className="mb-8">
              <Badge className="mb-4 bg-salmon-100 text-salmon-700 hover:bg-salmon-200">Promoção Especial</Badge>
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl text-balance mb-4">
                {selectedService.name}
              </h1>
              <p className="text-xl text-muted-foreground text-pretty">{selectedService.description}</p>
            </div>

            {/* Price Card */}
            <Card className="mb-12 border-salmon-200 bg-gradient-to-br from-white to-salmon-50/30">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Valor promocional</p>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-sm text-muted-foreground line-through">De R$ {selectedService.preco_original}</span>
                      <span className="text-4xl font-bold text-salmon-600">R$ {selectedService.preco_promocional}</span>
                    </div>
                    {selectedService.duration && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Duração: {selectedService.duration}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link href="/agendamento" className="w-full md:w-auto">
                      <Button size="lg" className="w-full bg-salmon-600 hover:bg-salmon-700 text-white">
                        Agendar Agora
                      </Button>
                    </Link>
                    <a
                      href={`https://wa.me/5561986543099?text=Olá! Gostaria de informações sobre ${selectedService.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full md:w-auto"
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-salmon-600 text-salmon-600 hover:bg-salmon-50 bg-transparent"
                      >
                        Tirar Dúvidas
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Service */}
            {selectedService.longDescription && (
              <section className="mb-12">
                <h2 className="font-serif text-2xl font-bold mb-4">Sobre o Tratamento</h2>
                <p className="text-muted-foreground leading-relaxed">{selectedService.longDescription}</p>
              </section>
            )}

            {/* Benefits */}
            {selectedService.benefits && selectedService.benefits.length > 0 && (
              <section className="mb-12">
                <h2 className="font-serif text-2xl font-bold mb-6">Benefícios</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedService.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-salmon-100 text-salmon-600 mt-0.5">
                        <Check className="h-4 w-4" />
                      </div>
                      <p className="text-sm">{benefit}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            <section className="mb-12">
              <h2 className="font-serif text-2xl font-bold mb-6">Galeria</h2>
              {selectedService.fotos && selectedService.fotos.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {selectedService.fotos.map((foto, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg bg-muted relative">
                      <Image
                        src={foto}
                        alt={`${selectedService.name} - Imagem ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-lg bg-muted">
                      <Image
                        src="/aesthetic-treatment-.jpg"
                        alt={`${selectedService.name} - Imagem ${i}`}
                        width={400}
                        height={400}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* FAQs */}
            {selectedService.faqs && selectedService.faqs.length > 0 && (
              <section className="mb-12">
                <h2 className="font-serif text-2xl font-bold mb-6">Perguntas Frequentes</h2>
                <div className="space-y-4">
                  {selectedService.faqs.map((faq, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <Card className="bg-gradient-to-br from-salmon-500 to-salmon-600 text-white border-0">
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-salmon-100" />
                <h3 className="font-serif text-2xl font-bold mb-3">Pronta para começar?</h3>
                <p className="text-salmon-50 mb-6 max-w-md mx-auto">
                  Agende sua sessão agora e aproveite nossos preços promocionais.
                </p>
                <Link href="/agendamento">
                  <Button size="lg" variant="secondary" className="bg-white text-salmon-600 hover:bg-salmon-50">
                    Agendar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Página de listagem de serviços
  return (
    <div className="py-12 md:py-16">
      <div className="container px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl text-balance mb-4">
            Nossos Serviços
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Tratamentos estéticos personalizados com tecnologia de ponta e profissionais especializados
          </p>
        </div>

        {/* Services Grid */}
        {services.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {services.map((service) => {
              return (
                <Link key={service.id} href={`/servicos?id=${service.id}`}>
                  <Card className="group h-full transition-all hover:shadow-lg hover:border-salmon-300">
                    <CardHeader>
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-sm text-muted-foreground line-through">R$ {service.preco_original}</span>
                        <span className="text-2xl font-bold text-salmon-600">R$ {service.preco_promocional}</span>
                      </div>
                      <Button className="w-full bg-salmon-600 hover:bg-salmon-700 text-white">Ver Detalhes</Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum serviço disponível no momento.</p>
            <p className="text-sm text-muted-foreground">Entre em contato conosco para mais informações.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mx-auto max-w-3xl text-center bg-gradient-to-br from-salmon-500 to-salmon-600 text-white rounded-2xl p-8 md:p-12">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">Não encontrou o que procura?</h2>
          <p className="text-salmon-50 mb-6">
            Entre em contato conosco e descubra outros tratamentos disponíveis ou tire suas dúvidas com nossa equipe.
          </p>
          <a
            href="https://wa.me/5561986543099?text=Olá! Gostaria de informações sobre os serviços."
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="secondary" className="bg-white text-salmon-600 hover:bg-salmon-50">
              Falar no WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ServicosPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    }>
      <ServicosContent />
    </Suspense>
  )
}
