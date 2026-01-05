import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Check, Clock, Star } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"

const servicesData: Record<
  string,
  {
    name: string
    description: string
    longDescription: string
    preco_original: number
    preco_promocional: number
    duration: string
    benefits: string[]
    beforeAfter: { before: string; after: string }[]
    faqs: { question: string; answer: string }[]
  }
> = {
  "remocao-tatuagem": {
    name: "Remoção de Tatuagem a Laser",
    description: "Tecnologia Q-Switched para remoção segura e eficaz",
    longDescription:
      "Utilizamos a mais moderna tecnologia de laser Q-Switched para remoção de tatuagens. O tratamento é seguro, eficaz e atua em tatuagens de todas as cores e tamanhos. O laser fragmenta as partículas de tinta, que são naturalmente eliminadas pelo organismo.",
    preco_original: 350,
    preco_promocional: 250,
    duration: "30-60 min",
    benefits: [
      "Remove tatuagens de todas as cores",
      "Procedimento seguro e aprovado",
      "Mínimo desconforto durante o tratamento",
      "Resultados progressivos e naturais",
      "Poucas sessões necessárias",
      "Sem cicatrizes quando feito corretamente",
    ],
    beforeAfter: [],
    faqs: [
      {
        question: "Quantas sessões são necessárias?",
        answer:
          "O número varia de acordo com o tamanho, cores e profundidade da tatuagem. Geralmente entre 5 a 12 sessões.",
      },
      {
        question: "O procedimento dói?",
        answer:
          "O desconforto é tolerável e comparável à sensação de um elástico estralando na pele. Oferecemos anestésico tópico se necessário.",
      },
      {
        question: "Quanto tempo entre as sessões?",
        answer: "Recomendamos um intervalo de 6 a 8 semanas entre cada sessão para melhores resultados.",
      },
    ],
  },
  "acupuntura-massagem": {
    name: "Acupuntura + Massagem",
    description: "Bem-estar e relaxamento profundo",
    longDescription:
      "Tratamento exclusivo que combina os benefícios da acupuntura tradicional chinesa com técnicas de massagem terapêutica. Promove equilíbrio energético, alívio de dores, redução de estresse e relaxamento profundo.",
    preco_original: 200,
    preco_promocional: 150,
    duration: "60 min",
    benefits: [
      "Alívio de dores musculares e articulares",
      "Redução de estresse e ansiedade",
      "Melhora da circulação sanguínea",
      "Equilíbrio energético do corpo",
      "Relaxamento profundo",
      "Fortalecimento do sistema imunológico",
    ],
    beforeAfter: [],
    faqs: [
      {
        question: "A acupuntura dói?",
        answer:
          "As agulhas são extremamente finas e a maioria das pessoas sente apenas uma leve sensação de formigamento ou pressão.",
      },
      {
        question: "Quantas sessões preciso fazer?",
        answer: "Recomendamos um pacote inicial de 4 a 6 sessões para resultados mais efetivos.",
      },
      {
        question: "Quais condições podem ser tratadas?",
        answer:
          "Dores crônicas, estresse, ansiedade, insônia, dores de cabeça, problemas digestivos e muitas outras condições.",
      },
    ],
  },
  "limpeza-facial": {
    name: "Limpeza Facial Profunda",
    description: "Pele limpa, saudável e radiante",
    longDescription:
      "Tratamento facial completo que inclui higienização profunda, esfoliação, extração de cravos, tonificação, máscara facial e hidratação. Remove impurezas, controla oleosidade e deixa a pele renovada e luminosa.",
    preco_original: 160,
    preco_promocional: 120,
    duration: "60 min",
    benefits: [
      "Remove cravos e impurezas profundas",
      "Controla oleosidade",
      "Reduz poros dilatados",
      "Uniformiza o tom da pele",
      "Promove renovação celular",
      "Deixa a pele mais luminosa",
    ],
    beforeAfter: [],
    faqs: [
      {
        question: "Com que frequência devo fazer?",
        answer: "Recomendamos a cada 21 a 30 dias, seguindo o ciclo de renovação celular da pele.",
      },
      {
        question: "Posso usar maquiagem depois?",
        answer: "Recomendamos aguardar 24 horas para permitir que a pele respire e se recupere completamente.",
      },
      {
        question: "É indicado para que tipo de pele?",
        answer: "Para todos os tipos de pele. Personalizamos o tratamento de acordo com suas necessidades.",
      },
    ],
  },
  botox: {
    name: "Botox",
    description: "Rejuvenescimento facial natural",
    longDescription:
      "Aplicação de toxina botulínica de alta qualidade para suavizar linhas de expressão e prevenir o envelhecimento precoce. Procedimento rápido e seguro que proporciona resultados naturais e duradouros.",
    preco_original: 500,
    preco_promocional: 400,
    duration: "20-30 min",
    benefits: [
      "Suaviza linhas de expressão",
      "Previne rugas futuras",
      "Resultados naturais",
      "Procedimento rápido",
      "Efeito duradouro (4-6 meses)",
      "Sem tempo de recuperação",
    ],
    beforeAfter: [],
    faqs: [
      {
        question: "Quanto tempo dura o efeito?",
        answer: "Os resultados duram em média de 4 a 6 meses, variando de acordo com cada pessoa.",
      },
      {
        question: "O resultado fica artificial?",
        answer:
          "Não! Trabalhamos com doses personalizadas para garantir um resultado natural e harmonioso ao seu rosto.",
      },
      {
        question: "Quando vejo os resultados?",
        answer: "Os primeiros resultados aparecem em 3 a 5 dias, com efeito máximo em 15 dias.",
      },
    ],
  },
  "drenagem-linfatica": {
    name: "Drenagem Linfática",
    description: "Reduza inchaço e melhore circulação",
    longDescription:
      "Técnica de massagem especializada que estimula o sistema linfático, promovendo a eliminação de toxinas, redução de inchaço e retenção de líquidos. Melhora a circulação e proporciona sensação de bem-estar.",
    preco_original: 170,
    preco_promocional: 130,
    duration: "60 min",
    benefits: [
      "Reduz inchaço e retenção de líquidos",
      "Elimina toxinas do organismo",
      "Melhora a circulação",
      "Reduz celulite",
      "Alivia pernas cansadas",
      "Fortalece o sistema imunológico",
    ],
    beforeAfter: [],
    faqs: [
      {
        question: "Quantas sessões são recomendadas?",
        answer: "Para melhores resultados, recomendamos um pacote de 10 sessões, 2 a 3 vezes por semana.",
      },
      {
        question: "Ajuda a emagrecer?",
        answer:
          "A drenagem ajuda a reduzir medidas através da eliminação de líquidos retidos, mas não substitui dieta e exercícios.",
      },
      {
        question: "Pode ser feita pós-operatório?",
        answer: "Sim! É especialmente indicada para recuperação pós-cirúrgica, sempre com liberação médica.",
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(servicesData).map((id) => ({ id }))
}

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const service = servicesData[params.id]

  if (!service) {
    notFound()
  }

  return (
    <div className="py-12 md:py-16">
      <div className="container px-4">
        {/* Header */}
        <div className="mx-auto max-w-4xl">
          <Link
            href="/servicos"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-salmon-600 mb-6"
          >
            ← Voltar para Serviços
          </Link>

          <div className="mb-8">
            <Badge className="mb-4 bg-salmon-100 text-salmon-700 hover:bg-salmon-200">Promoção Especial</Badge>
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl text-balance mb-4">
              {service.name}
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">{service.description}</p>
          </div>

          {/* Price Card */}
          <Card className="mb-12 border-salmon-200 bg-gradient-to-br from-white to-salmon-50/30">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Valor promocional</p>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-sm text-muted-foreground line-through">De R$ {service.preco_original}</span>
                    <span className="text-4xl font-bold text-salmon-600">R$ {service.preco_promocional}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Duração: {service.duration}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Link href="/agendamento" className="w-full md:w-auto">
                    <Button size="lg" className="w-full bg-salmon-600 hover:bg-salmon-700 text-white">
                      Agendar Agora
                    </Button>
                  </Link>
                  <a
                    href={`https://wa.me/5561986543099?text=Olá! Gostaria de informações sobre ${service.name}`}
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
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-4">Sobre o Tratamento</h2>
            <p className="text-muted-foreground leading-relaxed">{service.longDescription}</p>
          </section>

          {/* Benefits */}
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-6">Benefícios</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {service.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-salmon-100 text-salmon-600 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-sm">{benefit}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Gallery Placeholder */}
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-6">Galeria</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={`/aesthetic-treatment-.jpg?height=400&width=400&query=aesthetic treatment ${params.id} ${i}`}
                    alt={`${service.name} - Imagem ${i}`}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-6">Perguntas Frequentes</h2>
            <div className="space-y-4">
              {service.faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

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
