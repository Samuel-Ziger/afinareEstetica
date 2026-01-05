"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Award, Users, Clock, Check } from "lucide-react"
import Image from "next/image"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Course {
  id: string
  name: string
  description: string
  preco: number
  duration: string
  format: string
  certificate: string
  students: string
  benefits: string[]
  modules: { title: string; topics: string[] }[]
  targetAudience: string[]
  image?: string
}

export default function CursosPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesSnapshot = await getDocs(collection(db, "cursos"))
        const coursesData: Course[] = []
        coursesSnapshot.forEach((doc) => {
          const data = doc.data()
          coursesData.push({
            id: doc.id,
            name: data.name || "",
            description: data.description || "",
            preco: data.preco || 0,
            duration: data.duration || "",
            format: data.format || "",
            certificate: data.certificate || "",
            students: data.students || "",
            benefits: data.benefits || [],
            modules: data.modules || [],
            targetAudience: data.targetAudience || [],
            image: data.image || "",
          })
        })
        setCourses(coursesData)
      } catch (error) {
        console.error("Error loading courses:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando cursos...</p>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="py-12 md:py-16">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-muted-foreground mb-4">Nenhum curso disponível no momento.</p>
            <p className="text-sm text-muted-foreground">Entre em contato conosco para mais informações.</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar o primeiro curso (ou podemos fazer um loop para mostrar todos)
  const course = courses[0]

  return (
    <div className="py-12 md:py-16">
      <div className="container px-4">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <Badge className="mb-4 bg-salmon-600 text-white hover:bg-salmon-700">Capacitação Profissional</Badge>
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl text-balance mb-4">{course.name}</h1>
          <p className="text-lg text-muted-foreground text-pretty">{course.description}</p>
        </div>

        {/* Hero Image */}
        <div className="mx-auto max-w-4xl mb-12">
          <div className="aspect-video overflow-hidden rounded-2xl bg-muted">
            <Image
              src={course.image || "/professional-laser-training-course-with-instructor-d.jpg"}
              alt={course.name}
              width={1200}
              height={675}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          {/* Course Info Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-salmon-600" />
                <p className="text-sm font-semibold mb-1">{course.duration}</p>
                <p className="text-xs text-muted-foreground">Carga Horária</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-3 text-salmon-600" />
                <p className="text-sm font-semibold mb-1">{course.format}</p>
                <p className="text-xs text-muted-foreground">Formato</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-salmon-600" />
                <p className="text-sm font-semibold mb-1">{course.students}</p>
                <p className="text-xs text-muted-foreground">Turmas Reduzidas</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 mx-auto mb-3 text-salmon-600" />
                <p className="text-sm font-semibold mb-1">{course.certificate}</p>
                <p className="text-xs text-muted-foreground">Ao Final</p>
              </CardContent>
            </Card>
          </div>

          {/* Price Card */}
          <Card className="mb-12 border-salmon-200 bg-gradient-to-br from-white to-salmon-50/30">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Investimento</p>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-salmon-600">
                      R$ {course.preco.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Parcelamento disponível em até 12x</p>
                </div>
                <div className="flex flex-col gap-3">
                  <a
                    href={`https://wa.me/5561986543099?text=Olá! Gostaria de me inscrever no ${course.name}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto"
                  >
                    <Button size="lg" className="w-full bg-salmon-600 hover:bg-salmon-700 text-white">
                      Quero me Inscrever
                    </Button>
                  </a>
                  <a
                    href={`https://wa.me/5561986543099?text=Olá! Gostaria de mais informações sobre o ${course.name}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-salmon-600 text-salmon-600 hover:bg-salmon-50 bg-transparent"
                    >
                      Mais Informações
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          {course.benefits && course.benefits.length > 0 && (
            <section className="mb-12">
              <h2 className="font-serif text-2xl font-bold mb-6">O que você vai aprender</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {course.benefits.map((benefit, index) => (
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

          {/* Modules */}
          {course.modules && course.modules.length > 0 && (
            <section className="mb-12">
              <h2 className="font-serif text-2xl font-bold mb-6">Módulos do Curso</h2>
              <div className="space-y-4">
                {course.modules.map((module, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {module.topics.map((topic, topicIndex) => (
                          <li key={topicIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-salmon-600">•</span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Target Audience */}
          {course.targetAudience && course.targetAudience.length > 0 && (
            <section className="mb-12">
              <h2 className="font-serif text-2xl font-bold mb-6">Para quem é este curso</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {course.targetAudience.map((audience, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-salmon-600" />
                        <span className="text-sm">{audience}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* CTA */}
          <Card className="bg-gradient-to-br from-salmon-500 to-salmon-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-salmon-100" />
              <h3 className="font-serif text-2xl font-bold mb-3">Invista em sua carreira</h3>
              <p className="text-salmon-50 mb-6 max-w-md mx-auto">
                Torne-se um profissional qualificado em remoção de tatuagem a laser e expanda suas oportunidades no
                mercado de estética.
              </p>
              <a
                href={`https://wa.me/5561986543099?text=Olá! Gostaria de me inscrever no curso.`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="secondary" className="bg-white text-salmon-600 hover:bg-salmon-50">
                  Quero me Inscrever
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
