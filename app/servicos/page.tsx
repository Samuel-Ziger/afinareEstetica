import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Droplet, Heart, Zap, Wind } from "lucide-react"
import Link from "next/link"

const services = [
  {
    id: "remocao-tatuagem",
    name: "Remoção de Tatuagem a Laser",
    description: "Tecnologia Q-Switched para remoção segura e eficaz de tatuagens de todas as cores",
    icon: Zap,
    preco_original: 350,
    preco_promocional: 250,
    category: "laser",
  },
  {
    id: "acupuntura-massagem",
    name: "Acupuntura + Massagem",
    description: "Combinação perfeita de técnicas orientais para equilíbrio físico e mental",
    icon: Heart,
    preco_original: 200,
    preco_promocional: 150,
    category: "wellness",
  },
  {
    id: "limpeza-facial",
    name: "Limpeza Facial Profunda",
    description: "Tratamento completo que remove impurezas, cravos e revitaliza a pele",
    icon: Sparkles,
    preco_original: 160,
    preco_promocional: 120,
    category: "facial",
  },
  {
    id: "botox",
    name: "Botox",
    description: "Aplicação de toxina botulínica para suavizar linhas de expressão",
    icon: Droplet,
    preco_original: 500,
    preco_promocional: 400,
    category: "injectable",
  },
  {
    id: "drenagem-linfatica",
    name: "Drenagem Linfática",
    description: "Técnica manual para redução de inchaço e melhora da circulação",
    icon: Wind,
    preco_original: 170,
    preco_promocional: 130,
    category: "body",
  },
]

export default function ServicosPage() {
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <Link key={service.id} href={`/servicos/${service.id}`}>
                <Card className="group h-full transition-all hover:shadow-lg hover:border-salmon-300">
                  <CardHeader>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-salmon-100 text-salmon-600 transition-all group-hover:bg-salmon-600 group-hover:text-white group-hover:scale-110">
                      <Icon className="h-7 w-7" />
                    </div>
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
