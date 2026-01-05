"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Settings, CalendarIcon, Users, Package, GraduationCap, Home, LogOut, CheckCircle2, XCircle, Edit, Trash2, Plus, Upload, Menu } from "lucide-react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc, getDocs, setDoc, Timestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { auth, db, storage } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"
import { useIsMobile } from "@/hooks/use-mobile"

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

interface Service {
  id: string
  name: string
  description: string
  longDescription?: string
  preco_original: number
  preco_promocional: number
  category: string
  fotos?: string[]
  benefits?: string[]
  faqs?: { question: string; answer: string }[]
  duration?: string
}

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

interface Config {
  whatsapp: string
  instagram: string
  endereco: string
  horarios: {
    semana: string
    sabado: string
  }
}

interface RecurringAppointment {
  id: string
  clienteNome: string
  clienteEmail: string
  clientePhone: string
  servicoId: string
  servicoNome: string
  servicoPreco: number
  hora: string
  tipo: "semanal" | "mensal"
  diaSemana?: number // 0-6 (domingo-sábado) para semanal
  diaMes?: number // 1-31 para mensal
  ativo: boolean
  createdAt: any
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [combos, setCombos] = useState<Combo[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [config, setConfig] = useState<Config>({
    whatsapp: "(61) 98654-3099",
    instagram: "@afinare.estetica",
    endereco: "CLN 103 bl b sala 16 Asa Norte",
    horarios: {
      semana: "Segunda a Sexta: 08h às 19h",
      sabado: "Sábado: 08h às 13h"
    }
  })
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("inicio")
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingRecurring, setEditingRecurring] = useState<RecurringAppointment | null>(null)
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  const [isServiceDetailsDialogOpen, setIsServiceDetailsDialogOpen] = useState(false)
  const [isComboDialogOpen, setIsComboDialogOpen] = useState(false)
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false)
  const [isCalendarViewOpen, setIsCalendarViewOpen] = useState(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date())
  const [recurringAppointments, setRecurringAppointments] = useState<RecurringAppointment[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()
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

    // Load appointments
    const q = query(collection(db, "agendamentos"), orderBy("createdAt", "desc"))
    const unsubscribeAppointments = onSnapshot(q, (snapshot) => {
      const appointmentsData: Appointment[] = []
      snapshot.forEach((doc) => {
        appointmentsData.push({ id: doc.id, ...doc.data() } as Appointment)
      })
      setAppointments(appointmentsData)
    })

    // Load recurring appointments
    const loadRecurringAppointments = async () => {
      const recurringSnapshot = await getDocs(collection(db, "agendamentos-fixos"))
      const recurringData: RecurringAppointment[] = []
      recurringSnapshot.forEach((doc) => {
        recurringData.push({ id: doc.id, ...doc.data() } as RecurringAppointment)
      })
      setRecurringAppointments(recurringData)
    }
    loadRecurringAppointments()

    const unsubscribeRecurring = onSnapshot(collection(db, "agendamentos-fixos"), (snapshot) => {
      const recurringData: RecurringAppointment[] = []
      snapshot.forEach((doc) => {
        recurringData.push({ id: doc.id, ...doc.data() } as RecurringAppointment)
      })
      setRecurringAppointments(recurringData)
    })

    // Load services
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
            fotos: data.fotos || [],
            longDescription: data.longDescription,
            benefits: data.benefits,
            faqs: data.faqs
          } as Service)
        })
        setServices(servicesData)
        console.log("Serviços carregados:", servicesData.length)
        
        // Se não houver serviços, inicializar automaticamente
        if (servicesData.length === 0) {
          console.log("Nenhum serviço encontrado. Inicializando serviços padrão...")
        const defaultServices: Service[] = [
          {
            id: "massagens",
            name: "Massagens",
            description: "Massagens relaxantes e terapêuticas para alívio do estresse, tensão muscular e promoção do bem-estar geral.",
            preco_original: 200,
            preco_promocional: 150,
            category: "wellness",
            fotos: [],
          },
          {
            id: "limpeza-facial",
            name: "Limpeza Facial",
            description: "Tratamento facial profundo para remoção de impurezas, desobstrução de poros e renovação da pele.",
            preco_original: 160,
            preco_promocional: 120,
            category: "facial",
            fotos: [],
          },
          {
            id: "acupuntura",
            name: "Acupuntura",
            description: "Terapia milenar chinesa para equilíbrio energético, alívio de dores e promoção da saúde integral.",
            preco_original: 180,
            preco_promocional: 140,
            category: "wellness",
            fotos: [],
          },
          {
            id: "terapias-combinadas",
            name: "Terapias Combinadas",
            description: "Protocolos personalizados que combinam diferentes técnicas para resultados otimizados.",
            preco_original: 300,
            preco_promocional: 250,
            category: "wellness",
            fotos: [],
          },
          {
            id: "criolipolise",
            name: "Criolipólise",
            description: "Redução de gordura localizada através do congelamento controlado das células adiposas.",
            preco_original: 800,
            preco_promocional: 650,
            category: "body",
            fotos: [],
          },
          {
            id: "depilacao-cera",
            name: "Depilação à Cera",
            description: "Depilação profissional com cera de alta qualidade para uma pele lisa e macia por mais tempo.",
            preco_original: 100,
            preco_promocional: 80,
            category: "body",
            fotos: [],
          },
          {
            id: "epilacao-laser",
            name: "Epilação a Laser",
            description: "Remoção definitiva de pelos com tecnologia laser, segura e eficaz para todos os tipos de pele.",
            preco_original: 400,
            preco_promocional: 320,
            category: "laser",
            fotos: [],
          },
          {
            id: "botox",
            name: "Botox",
            description: "Tratamento para suavizar rugas e linhas de expressão, proporcionando aspecto rejuvenescido.",
            preco_original: 500,
            preco_promocional: 400,
            category: "injectable",
            fotos: [],
          },
          {
            id: "peelings",
            name: "Peelings",
            description: "Peelings de diamante, mar morto e outros para renovação celular e tratamento de imperfeições.",
            preco_original: 250,
            preco_promocional: 200,
            category: "facial",
            fotos: [],
          },
          {
            id: "remocao-tatuagens",
            name: "Remoção de Tatuagens",
            description: "Remoção segura e eficaz de tatuagens com tecnologia laser de última geração.",
            preco_original: 350,
            preco_promocional: 280,
            category: "laser",
            fotos: [],
          },
          {
            id: "despigmentacao-sobrancelhas",
            name: "Despigmentação de Sobrancelhas",
            description: "Correção da pigmentação das sobrancelhas para um visual natural e harmonioso.",
            preco_original: 300,
            preco_promocional: 240,
            category: "laser",
            fotos: [],
          },
          {
            id: "lipo-enzimatica",
            name: "Lipo Enzimática",
            description: "Redução de medidas através da aplicação de enzimas que dissolvem a gordura localizada.",
            preco_original: 450,
            preco_promocional: 360,
            category: "body",
            fotos: [],
          },
          {
            id: "hidrolipoclasia",
            name: "Hidrolipoclasia",
            description: "Tratamento para redução de gordura localizada através da infusão de solução fisiológica.",
            preco_original: 500,
            preco_promocional: 400,
            category: "body",
            fotos: [],
          },
        ]

          try {
            for (const service of defaultServices) {
              await setDoc(doc(db, "servicos", service.id), service)
              console.log("Serviço criado:", service.name)
            }
            // Recarregar serviços após inicialização
            const newServicesSnapshot = await getDocs(collection(db, "servicos"))
            const newServicesData: Service[] = []
            newServicesSnapshot.forEach((doc) => {
              const data = doc.data()
              newServicesData.push({ 
                id: doc.id, 
                name: data.name || "",
                description: data.description || "",
                preco_original: data.preco_original || 0,
                preco_promocional: data.preco_promocional || 0,
                category: data.category || "wellness",
                fotos: data.fotos || [],
                longDescription: data.longDescription,
                benefits: data.benefits,
                faqs: data.faqs
              } as Service)
            })
            setServices(newServicesData)
            console.log("Serviços inicializados:", newServicesData.length)
          } catch (error) {
            console.error("Error auto-initializing services:", error)
          }
        }
      } catch (error) {
        console.error("Error loading services:", error)
      }
    }
    loadServices()
    
    // Subscribe to services changes
    const unsubscribeServices = onSnapshot(collection(db, "servicos"), (snapshot) => {
      const servicesData: Service[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        servicesData.push({ 
          id: doc.id, 
          name: data.name || "",
          description: data.description || "",
          preco_original: data.preco_original || 0,
          preco_promocional: data.preco_promocional || 0,
          category: data.category || "wellness",
          fotos: data.fotos || [],
          longDescription: data.longDescription,
          benefits: data.benefits,
          faqs: data.faqs
        } as Service)
      })
      setServices(servicesData)
      console.log("Serviços atualizados via snapshot:", servicesData.length)
    })

    // Load combos
    const loadCombos = async () => {
      const combosSnapshot = await getDocs(collection(db, "combos"))
      const combosData: Combo[] = []
      combosSnapshot.forEach((doc) => {
        combosData.push({ id: doc.id, ...doc.data() } as Combo)
      })
      setCombos(combosData)
    }
    loadCombos()
    
    // Subscribe to combos changes
    const unsubscribeCombos = onSnapshot(collection(db, "combos"), (snapshot) => {
      const combosData: Combo[] = []
      snapshot.forEach((doc) => {
        combosData.push({ id: doc.id, ...doc.data() } as Combo)
      })
      setCombos(combosData)
    })

    // Load courses
    const loadCourses = async () => {
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
          } as Course)
        })
        setCourses(coursesData)
    }
    loadCourses()
    
    // Subscribe to courses changes
    const unsubscribeCourses = onSnapshot(collection(db, "cursos"), (snapshot) => {
      const coursesData: Course[] = []
      snapshot.forEach((doc) => {
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
        } as Course)
      })
      setCourses(coursesData)
    })

    // Load config
    const loadConfig = async () => {
      const configDoc = await getDocs(collection(db, "config"))
      if (!configDoc.empty) {
        const configData = configDoc.docs[0].data() as Config
        setConfig(configData)
      }
    }
    loadConfig()

    return () => {
      unsubscribeAppointments()
      unsubscribeServices()
      unsubscribeCombos()
      unsubscribeCourses()
      unsubscribeRecurring()
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: "concluido" | "cancelado" | "pendente" | "confirmado") => {
    try {
      const appointmentRef = doc(db, "agendamentos", appointmentId)
      await updateDoc(appointmentRef, { status })
      toast({
        title: "Sucesso",
        description: `Agendamento ${status === "concluido" ? "marcado como concluído" : status === "cancelado" ? "desmarcado/cancelado" : status === "confirmado" ? "confirmado" : "marcado como pendente"}`,
      })
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento",
        variant: "destructive",
      })
    }
  }

  const saveService = async (service: Service) => {
    try {
      if (service.id && services.find(s => s.id === service.id)) {
        await setDoc(doc(db, "servicos", service.id), service)
      } else {
        const newId = service.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        await setDoc(doc(db, "servicos", newId), { ...service, id: newId })
      }
      toast({
        title: "Sucesso",
        description: "Serviço salvo com sucesso",
      })
      setIsServiceDialogOpen(false)
      setEditingService(null)
    } catch (error) {
      console.error("Error saving service:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o serviço",
        variant: "destructive",
      })
    }
  }

  const deleteService = async (serviceId: string) => {
    try {
      await deleteDoc(doc(db, "servicos", serviceId))
      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso",
      })
    } catch (error) {
      console.error("Error deleting service:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o serviço",
        variant: "destructive",
      })
    }
  }

  const initializeServices = async () => {
    try {
      console.log("Inicializando serviços padrão...")
      const defaultServices: Service[] = [
        {
          id: "massagens",
          name: "Massagens",
          description: "Massagens relaxantes e terapêuticas para alívio do estresse, tensão muscular e promoção do bem-estar geral.",
          preco_original: 200,
          preco_promocional: 150,
          category: "wellness",
          fotos: [],
        },
        {
          id: "limpeza-facial",
          name: "Limpeza Facial",
          description: "Tratamento facial profundo para remoção de impurezas, desobstrução de poros e renovação da pele.",
          preco_original: 160,
          preco_promocional: 120,
          category: "facial",
          fotos: [],
        },
        {
          id: "acupuntura",
          name: "Acupuntura",
          description: "Terapia milenar chinesa para equilíbrio energético, alívio de dores e promoção da saúde integral.",
          preco_original: 180,
          preco_promocional: 140,
          category: "wellness",
          fotos: [],
        },
        {
          id: "terapias-combinadas",
          name: "Terapias Combinadas",
          description: "Protocolos personalizados que combinam diferentes técnicas para resultados otimizados.",
          preco_original: 300,
          preco_promocional: 250,
          category: "wellness",
          fotos: [],
        },
        {
          id: "criolipolise",
          name: "Criolipólise",
          description: "Redução de gordura localizada através do congelamento controlado das células adiposas.",
          preco_original: 800,
          preco_promocional: 650,
          category: "body",
          fotos: [],
        },
        {
          id: "depilacao-cera",
          name: "Depilação à Cera",
          description: "Depilação profissional com cera de alta qualidade para uma pele lisa e macia por mais tempo.",
          preco_original: 100,
          preco_promocional: 80,
          category: "body",
          fotos: [],
        },
        {
          id: "epilacao-laser",
          name: "Epilação a Laser",
          description: "Remoção definitiva de pelos com tecnologia laser, segura e eficaz para todos os tipos de pele.",
          preco_original: 400,
          preco_promocional: 320,
          category: "laser",
          fotos: [],
        },
        {
          id: "botox",
          name: "Botox",
          description: "Tratamento para suavizar rugas e linhas de expressão, proporcionando aspecto rejuvenescido.",
          preco_original: 500,
          preco_promocional: 400,
          category: "injectable",
          fotos: [],
        },
        {
          id: "peelings",
          name: "Peelings",
          description: "Peelings de diamante, mar morto e outros para renovação celular e tratamento de imperfeições.",
          preco_original: 250,
          preco_promocional: 200,
          category: "facial",
          fotos: [],
        },
        {
          id: "remocao-tatuagens",
          name: "Remoção de Tatuagens",
          description: "Remoção segura e eficaz de tatuagens com tecnologia laser de última geração.",
          preco_original: 350,
          preco_promocional: 280,
          category: "laser",
          fotos: [],
        },
        {
          id: "despigmentacao-sobrancelhas",
          name: "Despigmentação de Sobrancelhas",
          description: "Correção da pigmentação das sobrancelhas para um visual natural e harmonioso.",
          preco_original: 300,
          preco_promocional: 240,
          category: "laser",
          fotos: [],
        },
        {
          id: "lipo-enzimatica",
          name: "Lipo Enzimática",
          description: "Redução de medidas através da aplicação de enzimas que dissolvem a gordura localizada.",
          preco_original: 450,
          preco_promocional: 360,
          category: "body",
          fotos: [],
        },
        {
          id: "hidrolipoclasia",
          name: "Hidrolipoclasia",
          description: "Tratamento para redução de gordura localizada através da infusão de solução fisiológica.",
          preco_original: 500,
          preco_promocional: 400,
          category: "body",
          fotos: [],
        },
      ]

      // Verificar quais serviços já existem
      const existingServices = await getDocs(collection(db, "servicos"))
      const existingIds = new Set(existingServices.docs.map(doc => doc.id))

      // Adicionar apenas os serviços que não existem
      const servicesToAdd = defaultServices.filter(service => !existingIds.has(service.id))
      
      if (servicesToAdd.length === 0) {
        toast({
          title: "Informação",
          description: "Todos os serviços já estão cadastrados",
        })
        return
      }

      // Adicionar serviços ao Firestore
      for (const service of servicesToAdd) {
        await setDoc(doc(db, "servicos", service.id), service)
        console.log("Serviço adicionado:", service.name)
      }

      // Recarregar serviços após adicionar
      const newServicesSnapshot = await getDocs(collection(db, "servicos"))
      const newServicesData: Service[] = []
      newServicesSnapshot.forEach((doc) => {
        const data = doc.data()
        newServicesData.push({ 
          id: doc.id, 
          name: data.name || "",
          description: data.description || "",
          preco_original: data.preco_original || 0,
          preco_promocional: data.preco_promocional || 0,
          category: data.category || "wellness",
          fotos: data.fotos || [],
          longDescription: data.longDescription,
          benefits: data.benefits,
          faqs: data.faqs
        } as Service)
      })
      setServices(newServicesData)

      toast({
        title: "Sucesso",
        description: `${servicesToAdd.length} serviço(s) inicializado(s) com sucesso`,
      })
    } catch (error) {
      console.error("Error initializing services:", error)
      toast({
        title: "Erro",
        description: "Não foi possível inicializar os serviços",
        variant: "destructive",
      })
    }
  }

  const saveCombo = async (combo: Combo) => {
    try {
      const comboToSave = {
        ...combo,
        economia: combo.preco_original - combo.preco_promocional
      }
      if (combo.id && combos.find(c => c.id === combo.id)) {
        await setDoc(doc(db, "combos", combo.id), comboToSave)
      } else {
        const newId = combo.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        await setDoc(doc(db, "combos", newId), { ...comboToSave, id: newId })
      }
      toast({
        title: "Sucesso",
        description: "Combo salvo com sucesso",
      })
      setIsComboDialogOpen(false)
      setEditingCombo(null)
    } catch (error) {
      console.error("Error saving combo:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o combo",
        variant: "destructive",
      })
    }
  }

  const deleteCombo = async (comboId: string) => {
    try {
      await deleteDoc(doc(db, "combos", comboId))
      toast({
        title: "Sucesso",
        description: "Combo excluído com sucesso",
      })
    } catch (error) {
      console.error("Error deleting combo:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o combo",
        variant: "destructive",
      })
    }
  }

  const initializeCombos = async () => {
    try {
      console.log("Inicializando combos padrão...")
      const defaultCombos: Combo[] = [
        {
          id: "beleza-completa",
          name: "Beleza Completa",
          description: "Limpeza Facial + Drenagem Linfática + Acupuntura",
          services: ["Limpeza Facial", "Drenagem Linfática", "Acupuntura"],
          preco_original: 450,
          preco_promocional: 350,
          economia: 100,
          sessions: 3,
        },
        {
          id: "rejuvenescimento-total",
          name: "Rejuvenescimento Total",
          description: "Botox + Limpeza Facial + Drenagem",
          services: ["Botox", "Limpeza Facial", "Drenagem Linfática"],
          preco_original: 670,
          preco_promocional: 550,
          economia: 120,
          sessions: 3,
        },
        {
          id: "relaxamento-profundo",
          name: "Relaxamento Profundo",
          description: "Acupuntura + Massagem + Drenagem",
          services: ["Acupuntura", "Massagens", "Drenagem Linfática"],
          preco_original: 450,
          preco_promocional: 320,
          economia: 130,
          sessions: 3,
        },
        {
          id: "pele-perfeita",
          name: "Pele Perfeita",
          description: "Pacote de 4 Limpezas Faciais",
          services: ["4 Sessões de Limpeza Facial"],
          preco_original: 640,
          preco_promocional: 420,
          economia: 220,
          sessions: 4,
        },
      ]

      // Verificar quais combos já existem
      const existingCombos = await getDocs(collection(db, "combos"))
      const existingIds = new Set(existingCombos.docs.map(doc => doc.id))

      // Adicionar apenas os combos que não existem
      const combosToAdd = defaultCombos.filter(combo => !existingIds.has(combo.id))
      
      if (combosToAdd.length === 0) {
        toast({
          title: "Informação",
          description: "Todos os combos já estão cadastrados",
        })
        return
      }

      // Adicionar combos ao Firestore
      for (const combo of combosToAdd) {
        const comboToSave = {
          ...combo,
          economia: combo.preco_original - combo.preco_promocional
        }
        await setDoc(doc(db, "combos", combo.id), comboToSave)
        console.log("Combo adicionado:", combo.name)
      }

      // Recarregar combos após adicionar
      const newCombosSnapshot = await getDocs(collection(db, "combos"))
      const newCombosData: Combo[] = []
      newCombosSnapshot.forEach((doc) => {
        const data = doc.data()
        newCombosData.push({ 
          id: doc.id, 
          name: data.name || "",
          description: data.description || "",
          services: data.services || [],
          preco_original: data.preco_original || 0,
          preco_promocional: data.preco_promocional || 0,
          economia: data.economia || 0,
          sessions: data.sessions || 1
        } as Combo)
      })
      setCombos(newCombosData)

      toast({
        title: "Sucesso",
        description: `${combosToAdd.length} combo(s) inicializado(s) com sucesso`,
      })
    } catch (error) {
      console.error("Error initializing combos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível inicializar os combos",
        variant: "destructive",
      })
    }
  }

  const saveCourse = async (course: Course) => {
    try {
      if (course.id && courses.find(c => c.id === course.id)) {
        await setDoc(doc(db, "cursos", course.id), course)
      } else {
        const newId = course.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        await setDoc(doc(db, "cursos", newId), { ...course, id: newId })
      }
      toast({
        title: "Sucesso",
        description: "Curso salvo com sucesso",
      })
      setIsCourseDialogOpen(false)
      setEditingCourse(null)
    } catch (error) {
      console.error("Error saving course:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o curso",
        variant: "destructive",
      })
    }
  }

  const deleteCourse = async (courseId: string) => {
    try {
      await deleteDoc(doc(db, "cursos", courseId))
      toast({
        title: "Sucesso",
        description: "Curso excluído com sucesso",
      })
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o curso",
        variant: "destructive",
      })
    }
  }

  const initializeCourses = async () => {
    try {
      console.log("Inicializando curso padrão...")
      const defaultCourse: Course = {
        id: "curso-remocao-tatuagem-laser",
        name: "Curso de Remoção de Tatuagem a Laser",
        description: "Aprenda a técnica mais moderna e segura de remoção de tatuagens com laser Q-Switched",
        preco: 3500,
        duration: "40 horas",
        format: "Presencial + Material Online",
        certificate: "Certificado de Conclusão",
        students: "Turmas de até 8 alunos",
        image: "",
        benefits: [
          "Teoria completa sobre tipos de pele e tatuagens",
          "Prática supervisionada com equipamentos profissionais",
          "Protocolos de segurança e biossegurança",
          "Gestão de clientes e precificação",
          "Material didático completo",
          "Certificado reconhecido",
          "Suporte pós-curso",
          "Networking com profissionais da área",
        ],
        modules: [
          {
            title: "Módulo 1: Fundamentos",
            topics: ["Anatomia da pele", "Tipos de tatuagens", "Tecnologia laser", "Segurança e biossegurança"],
          },
          {
            title: "Módulo 2: Prática",
            topics: [
              "Manuseio do equipamento",
              "Protocolos de tratamento",
              "Gestão de expectativas",
              "Casos práticos supervisionados",
            ],
          },
          {
            title: "Módulo 3: Gestão",
            topics: ["Precificação de serviços", "Marketing e captação", "Gestão de clientes", "Aspectos legais"],
          },
        ],
        targetAudience: [
          "Esteticistas",
          "Biomédicos",
          "Enfermeiros",
          "Profissionais da área da saúde e estética",
          "Empreendedores do setor",
        ],
        image: "",
      }

      // Verificar se o curso já existe
      const existingCourses = await getDocs(collection(db, "cursos"))
      const existingIds = new Set(existingCourses.docs.map(doc => doc.id))

      if (existingIds.has(defaultCourse.id)) {
        toast({
          title: "Informação",
          description: "O curso já está cadastrado",
        })
        return
      }

      // Adicionar curso ao Firestore
      await setDoc(doc(db, "cursos", defaultCourse.id), defaultCourse)
      console.log("Curso adicionado:", defaultCourse.name)

      // Recarregar cursos após adicionar
      const newCoursesSnapshot = await getDocs(collection(db, "cursos"))
      const newCoursesData: Course[] = []
      newCoursesSnapshot.forEach((doc) => {
        const data = doc.data()
        newCoursesData.push({
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
        } as Course)
      })
      setCourses(newCoursesData)

      toast({
        title: "Sucesso",
        description: "Curso inicializado com sucesso",
      })
    } catch (error) {
      console.error("Error initializing course:", error)
      toast({
        title: "Erro",
        description: "Não foi possível inicializar o curso",
        variant: "destructive",
      })
    }
  }

  const saveConfig = async () => {
    try {
      await setDoc(doc(db, "config", "main"), config)
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      })
      setIsConfigDialogOpen(false)
    } catch (error) {
      console.error("Error saving config:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      })
    }
  }

  const handlePhotoUpload = async (serviceId: string, files: FileList) => {
    setUploadingPhotos(true)
    try {
      const service = services.find(s => s.id === serviceId)
      if (!service) return

      const uploadPromises = Array.from(files).map(async (file) => {
        const storageRef = ref(storage, `servicos/${serviceId}/${Date.now()}_${file.name}`)
        await uploadBytes(storageRef, file)
        return await getDownloadURL(storageRef)
      })

      const urls = await Promise.all(uploadPromises)
      const updatedFotos = [...(service.fotos || []), ...urls]

      await setDoc(doc(db, "servicos", serviceId), {
        ...service,
        fotos: updatedFotos
      })

      toast({
        title: "Sucesso",
        description: "Fotos enviadas com sucesso",
      })
    } catch (error) {
      console.error("Error uploading photos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar as fotos",
        variant: "destructive",
      })
    } finally {
      setUploadingPhotos(false)
    }
  }

  const deletePhoto = async (serviceId: string, photoUrl: string) => {
    try {
      const service = services.find(s => s.id === serviceId)
      if (!service) return

      // Delete from storage
      const photoRef = ref(storage, photoUrl)
      await deleteObject(photoRef).catch(() => {}) // Ignore errors if file doesn't exist

      // Update service
      const updatedFotos = (service.fotos || []).filter(url => url !== photoUrl)
      await setDoc(doc(db, "servicos", serviceId), {
        ...service,
        fotos: updatedFotos
      })

      toast({
        title: "Sucesso",
        description: "Foto excluída com sucesso",
      })
    } catch (error) {
      console.error("Error deleting photo:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a foto",
        variant: "destructive",
      })
    }
  }

  const handleCourseImageUpload = async (courseId: string, file: File) => {
    setUploadingPhotos(true)
    try {
      const course = courses.find(c => c.id === courseId) || editingCourse
      if (!course) return

      const storageRef = ref(storage, `cursos/${courseId}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const imageUrl = await getDownloadURL(storageRef)

      // Se o curso já existe no banco, atualizar
      if (course.id && courses.find(c => c.id === course.id)) {
        await setDoc(doc(db, "cursos", courseId), {
          ...course,
          image: imageUrl
        })
      } else {
        // Se é um novo curso, apenas atualizar o estado
        setEditingCourse({ ...course, image: imageUrl })
      }

      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso",
      })
    } catch (error) {
      console.error("Error uploading course image:", error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar a imagem",
        variant: "destructive",
      })
    } finally {
      setUploadingPhotos(false)
    }
  }

  const deleteCourseImage = async (courseId: string) => {
    try {
      const course = courses.find(c => c.id === courseId)
      if (!course || !course.image) return

      // Delete from storage
      const imageRef = ref(storage, course.image)
      await deleteObject(imageRef).catch(() => {}) // Ignore errors if file doesn't exist

      // Update course
      await setDoc(doc(db, "cursos", courseId), {
        ...course,
        image: ""
      })

      toast({
        title: "Sucesso",
        description: "Imagem excluída com sucesso",
      })
    } catch (error) {
      console.error("Error deleting course image:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a imagem",
        variant: "destructive",
      })
    }
  }

  const generateAppointmentsFromRecurring = async (recurringList: RecurringAppointment[]) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const endDate = new Date()
      endDate.setDate(today.getDate() + 60) // Próximos 60 dias

      for (const recurring of recurringList) {
        if (!recurring.ativo) continue

        const dates: Date[] = []

        if (recurring.tipo === "semanal" && recurring.diaSemana !== undefined) {
          // Gerar datas semanais
          const currentDate = new Date(today)
          while (currentDate <= endDate) {
            if (currentDate.getDay() === recurring.diaSemana) {
              dates.push(new Date(currentDate))
            }
            currentDate.setDate(currentDate.getDate() + 1)
          }
        } else if (recurring.tipo === "mensal" && recurring.diaMes !== undefined) {
          // Gerar datas mensais
          const currentDate = new Date(today)
          while (currentDate <= endDate) {
            if (currentDate.getDate() === recurring.diaMes) {
              dates.push(new Date(currentDate))
            }
            currentDate.setDate(currentDate.getDate() + 1)
          }
        }

        // Verificar e criar agendamentos que não existem
        for (const date of dates) {
          const formattedDate = date.toLocaleDateString("pt-BR")
          const existingQuery = query(
            collection(db, "agendamentos"),
            where("data", "==", formattedDate),
            where("hora", "==", recurring.hora),
            where("clientePhone", "==", recurring.clientePhone)
          )
          const existingSnapshot = await getDocs(existingQuery)

          if (existingSnapshot.empty) {
            // Criar agendamento
            await addDoc(collection(db, "agendamentos"), {
              clienteNome: recurring.clienteNome,
              clienteEmail: recurring.clienteEmail,
              clientePhone: recurring.clientePhone,
              servicoId: recurring.servicoId,
              servicoNome: recurring.servicoNome,
              servicoPreco: recurring.servicoPreco,
              data: formattedDate,
              hora: recurring.hora,
              status: "confirmado",
              isRecurring: true,
              recurringId: recurring.id,
              createdAt: Timestamp.now(),
            })
          }
        }
      }
    } catch (error) {
      console.error("Error generating appointments from recurring:", error)
    }
  }

  const generateRecurringAppointments = async () => {
    await generateAppointmentsFromRecurring(recurringAppointments)
    toast({
      title: "Sucesso",
      description: "Agendamentos fixos gerados com sucesso",
    })
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

  // Função para navegar e fechar o menu mobile
  const handleNavigate = (tab: string) => {
    setActiveTab(tab)
    if (isMobile) {
      setMobileMenuOpen(false)
    }
  }

  // Componente do menu de navegação (reutilizável)
  const NavigationMenu = () => (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <button
          onClick={() => handleNavigate("inicio")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeTab === "inicio" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Início</span>
        </button>

        <button
          onClick={() => handleNavigate("agendamentos-list")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeTab === "agendamentos-list" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <CalendarIcon className="h-5 w-5" />
          <span>Agendamentos</span>
        </button>

        <button
          onClick={() => handleNavigate("calendario")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeTab === "calendario" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <CalendarIcon className="h-5 w-5" />
          <span>Calendário</span>
        </button>

        <button
          onClick={() => handleNavigate("servicos")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeTab === "servicos" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Package className="h-5 w-5" />
          <span>Serviços</span>
        </button>

        <button
          onClick={() => handleNavigate("combos")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeTab === "combos" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Package className="h-5 w-5" />
          <span>Combos</span>
        </button>

        <button
          onClick={() => handleNavigate("cursos")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeTab === "cursos" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <GraduationCap className="h-5 w-5" />
          <span>Cursos</span>
        </button>

        <button
          onClick={() => handleNavigate("configuracoes")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeTab === "configuracoes" ? "bg-salmon-500 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Configurações</span>
        </button>
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-5 w-5 mr-2" />
          Sair
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex w-64 bg-white border-r flex-col`}>
        <NavigationMenu />
      </aside>

      {/* Sidebar Mobile - Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full bg-white">
            <NavigationMenu />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Botão Menu Mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Administrativo</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-gray-600">Afinare Estética</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === "inicio" && (
            <>
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
                    <div className="text-4xl font-bold text-salmon-500">{stats.novosClientes}</div>
                  </div>
                </div>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Calendar Widget */}
                <Card className="bg-white p-6">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                  />
                </Card>

                {/* Próximos Agendamentos */}
                <Card className="bg-white p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Agendamentos</h3>
                  <div className="space-y-4">
                    {proximosAgendamentos.length > 0 ? (
                      proximosAgendamentos.map((app, idx) => (
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
                              {app.data} {app.hora} - {app.servicoNome}
                            </div>
                            <div className="text-sm text-gray-500">{app.clienteNome}</div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Confirmado</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum agendamento próximo</p>
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}

          {activeTab === "agendamentos-list" && (
            <Card className="bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Todos os Agendamentos</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Serviço</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hora</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{app.clienteNome}</div>
                            <div className="text-sm text-gray-500">{app.clienteEmail}</div>
                            <div className="text-sm text-gray-500">{app.clientePhone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{app.servicoNome}</div>
                          <div className="text-sm text-gray-500">R$ {app.servicoPreco}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{app.data}</td>
                        <td className="py-3 px-4 text-gray-900">{app.hora}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              app.status === "concluido"
                                ? "bg-green-100 text-green-700"
                                : app.status === "cancelado"
                                ? "bg-red-100 text-red-700"
                                : app.status === "confirmado"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {app.status === "concluido"
                              ? "Concluído"
                              : app.status === "cancelado"
                              ? "Cancelado"
                              : app.status === "confirmado"
                              ? "Confirmado"
                              : "Pendente"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-2">
                            {app.status !== "concluido" && app.status !== "cancelado" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => updateAppointmentStatus(app.id, "concluido")}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Concluir
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => updateAppointmentStatus(app.id, "cancelado")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Desmarcar
                                </Button>
                              </>
                            )}
                            {app.status === "cancelado" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                onClick={() => updateAppointmentStatus(app.id, "pendente")}
                              >
                                Reativar
                              </Button>
                            )}
                            {app.status === "concluido" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => updateAppointmentStatus(app.id, "cancelado")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Desmarcar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {appointments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">Nenhum agendamento encontrado</div>
                )}
              </div>
            </Card>
          )}

          {activeTab === "calendario" && (
            <div className="space-y-6">
              <Card className="bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Calendário de Agendamentos</h3>
                  <Button
                    onClick={() => {
                      setEditingRecurring({
                        id: "",
                        clienteNome: "",
                        clienteEmail: "",
                        clientePhone: "",
                        servicoId: "",
                        servicoNome: "",
                        servicoPreco: 0,
                        hora: "",
                        tipo: "semanal",
                        diaSemana: 1,
                        ativo: true,
                        createdAt: Timestamp.now(),
                      })
                      setIsRecurringDialogOpen(true)
                    }}
                    className="bg-salmon-500 hover:bg-salmon-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Agendamento Fixo
                  </Button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedCalendarDate}
                      onSelect={(date) => {
                        setSelectedCalendarDate(date)
                        setIsCalendarViewOpen(true)
                      }}
                      className="rounded-md border"
                    />
                  </div>

                  {/* Day Appointments */}
                  <div>
                    {selectedCalendarDate && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Agendamentos de {selectedCalendarDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </h4>
                        {(() => {
                          const formattedDate = selectedCalendarDate.toLocaleDateString("pt-BR")
                          const dayAppointments = appointments.filter((app) => app.data === formattedDate)
                          return (
                            <div className="space-y-3">
                              {dayAppointments.length > 0 ? (
                                dayAppointments.map((app) => (
                                  <Card key={app.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="font-semibold text-gray-900">{app.clienteNome}</div>
                                        <div className="text-sm text-gray-600 mt-1">{app.servicoNome}</div>
                                        <div className="text-sm text-gray-500 mt-1">
                                          {app.hora} - R$ {app.servicoPreco}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                          {app.clienteEmail} | {app.clientePhone}
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <span
                                          className={`text-xs px-2 py-1 rounded ${
                                            app.status === "concluido"
                                              ? "bg-green-100 text-green-700"
                                              : app.status === "cancelado"
                                              ? "bg-red-100 text-red-700"
                                              : app.status === "confirmado"
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-yellow-100 text-yellow-700"
                                          }`}
                                        >
                                          {app.status === "concluido"
                                            ? "Concluído"
                                            : app.status === "cancelado"
                                            ? "Cancelado"
                                            : app.status === "confirmado"
                                            ? "Confirmado"
                                            : "Pendente"}
                                        </span>
                                        <div className="flex flex-col gap-1">
                                          {app.status !== "concluido" && app.status !== "cancelado" && (
                                            <>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                onClick={() => updateAppointmentStatus(app.id, "concluido")}
                                              >
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Concluir
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                onClick={() => updateAppointmentStatus(app.id, "cancelado")}
                                              >
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Desmarcar
                                              </Button>
                                            </>
                                          )}
                                          {app.status === "cancelado" && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                              onClick={() => updateAppointmentStatus(app.id, "pendente")}
                                            >
                                              Reativar
                                            </Button>
                                          )}
                                          {app.status === "concluido" && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-red-600 border-red-600 hover:bg-red-50"
                                              onClick={() => updateAppointmentStatus(app.id, "cancelado")}
                                            >
                                              <XCircle className="h-3 w-3 mr-1" />
                                              Desmarcar
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500 text-center py-8">Nenhum agendamento neste dia</p>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Recurring Appointments */}
              <Card className="bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Agendamentos Fixos</h3>
                  <Button
                    onClick={generateRecurringAppointments}
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    Gerar Agendamentos
                  </Button>
                </div>
                <div className="space-y-4">
                  {recurringAppointments.length > 0 ? (
                    recurringAppointments.map((recurring) => (
                      <div key={recurring.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{recurring.clienteNome}</h4>
                            <p className="text-sm text-gray-600 mt-1">{recurring.servicoNome}</p>
                            <div className="mt-2 flex gap-4 text-sm">
                              <span className="text-gray-600">
                                {recurring.tipo === "semanal"
                                  ? `Toda ${["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][recurring.diaSemana || 0]}`
                                  : `Dia ${recurring.diaMes} de cada mês`}
                              </span>
                              <span className="text-gray-600">às {recurring.hora}</span>
                              <span className={recurring.ativo ? "text-green-600" : "text-gray-400"}>
                                {recurring.ativo ? "Ativo" : "Inativo"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {recurring.clienteEmail} | {recurring.clientePhone}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingRecurring(recurring)
                                setIsRecurringDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={async () => {
                                if (confirm("Tem certeza que deseja excluir este agendamento fixo?")) {
                                  try {
                                    await deleteDoc(doc(db, "agendamentos-fixos", recurring.id))
                                    toast({
                                      title: "Sucesso",
                                      description: "Agendamento fixo excluído",
                                    })
                                  } catch (error) {
                                    console.error("Error deleting recurring:", error)
                                    toast({
                                      title: "Erro",
                                      description: "Não foi possível excluir",
                                      variant: "destructive",
                                    })
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">Nenhum agendamento fixo cadastrado</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "servicos" && (
            <Card className="bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Gerenciar Serviços</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={initializeServices}
                    variant="outline"
                    className="border-salmon-500 text-salmon-600 hover:bg-salmon-50"
                  >
                    Inicializar Serviços Padrão
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingService({
                        id: "",
                        name: "",
                        description: "",
                        preco_original: 0,
                        preco_promocional: 0,
                        category: "laser",
                        fotos: []
                      })
                      setIsServiceDialogOpen(true)
                    }}
                    className="bg-salmon-500 hover:bg-salmon-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Serviço
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {services.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">Nenhum serviço cadastrado ainda.</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Clique em "Inicializar Serviços Padrão" para criar os serviços padrão ou adicione um novo serviço.
                    </p>
                  </div>
                ) : (
                  services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="mt-2 flex gap-4 text-sm">
                            <span className="text-gray-500">
                              Original: <span className="line-through">R$ {service.preco_original}</span>
                            </span>
                            <span className="text-salmon-600 font-semibold">
                              Promocional: R$ {service.preco_promocional}
                            </span>
                          </div>
                          {service.fotos && service.fotos.length > 0 && (
                            <div className="mt-3 flex gap-2 flex-wrap">
                              {service.fotos.map((foto, idx) => (
                                <div key={idx} className="relative w-20 h-20 rounded overflow-hidden">
                                  <Image src={foto} alt={`Foto ${idx + 1}`} fill className="object-cover" />
                                  <button
                                    onClick={() => deletePhoto(service.id, foto)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingService(service)
                              setIsServiceDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              setEditingService(service)
                              setIsServiceDetailsDialogOpen(true)
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir este serviço?")) {
                                deleteService(service.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                          <div className="relative">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                if (e.target.files) {
                                  handlePhotoUpload(service.id, e.target.files)
                                }
                              }}
                              disabled={uploadingPhotos}
                            />
                            <Button size="sm" variant="outline" disabled={uploadingPhotos}>
                              <Upload className="h-4 w-4 mr-1" />
                              {uploadingPhotos ? "Enviando..." : "Fotos"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {activeTab === "combos" && (
            <Card className="bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Gerenciar Combos</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={initializeCombos}
                    variant="outline"
                    className="border-salmon-500 text-salmon-600 hover:bg-salmon-50"
                  >
                    Inicializar Combos Padrão
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingCombo({
                        id: "",
                        name: "",
                        description: "",
                        services: [],
                        preco_original: 0,
                        preco_promocional: 0,
                        economia: 0,
                        sessions: 1
                      })
                      setIsComboDialogOpen(true)
                    }}
                    className="bg-salmon-500 hover:bg-salmon-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Combo
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {combos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">Nenhum combo cadastrado ainda.</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Clique em "Inicializar Combos Padrão" para criar os combos padrão ou adicione um novo combo.
                    </p>
                  </div>
                ) : (
                  combos.map((combo) => (
                  <div key={combo.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{combo.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{combo.description}</p>
                        <div className="mt-2 flex gap-4 text-sm">
                          <span className="text-gray-500">
                            Original: <span className="line-through">R$ {combo.preco_original}</span>
                          </span>
                          <span className="text-salmon-600 font-semibold">
                            Promocional: R$ {combo.preco_promocional}
                          </span>
                          <span className="text-green-600">Economia: R$ {combo.economia}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          Serviços: {combo.services.join(", ")}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCombo(combo)
                            setIsComboDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este combo?")) {
                              deleteCombo(combo.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {activeTab === "cursos" && (
            <Card className="bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Gerenciar Cursos</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={initializeCourses}
                    variant="outline"
                    className="border-salmon-500 text-salmon-600 hover:bg-salmon-50"
                  >
                    Inicializar Curso Padrão
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingCourse({
                        id: "",
                        name: "",
                        description: "",
                        preco: 0,
                        duration: "",
                        format: "",
                        certificate: "",
                        students: "",
                        benefits: [],
                        modules: [],
                        targetAudience: []
                      })
                      setIsCourseDialogOpen(true)
                    }}
                    className="bg-salmon-500 hover:bg-salmon-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Curso
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">Nenhum curso cadastrado ainda.</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Clique em "Inicializar Curso Padrão" para criar o curso padrão ou adicione um novo curso.
                    </p>
                  </div>
                ) : (
                  courses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{course.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        <div className="mt-2 flex gap-4 text-sm">
                          <span className="text-salmon-600 font-semibold">R$ {course.preco.toLocaleString()}</span>
                          <span className="text-gray-500">{course.duration}</span>
                        </div>
                        {course.image && (
                          <div className="mt-3 relative w-32 h-20 rounded overflow-hidden">
                            <Image src={course.image} alt={course.name} fill className="object-cover" />
                            <button
                              onClick={() => {
                                if (confirm("Tem certeza que deseja excluir esta imagem?")) {
                                  deleteCourseImage(course.id)
                                }
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCourse(course)
                            setIsCourseDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este curso?")) {
                              deleteCourse(course.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {activeTab === "configuracoes" && (
            <Card className="bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
                <Button
                  onClick={() => setIsConfigDialogOpen(true)}
                  className="bg-salmon-500 hover:bg-salmon-600 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Configurações
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informações de Contato</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>WhatsApp: {config.whatsapp}</p>
                    <p>Instagram: {config.instagram}</p>
                    <p>Endereço: {config.endereco}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Horários de Funcionamento</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>{config.horarios.semana}</p>
                    <p>{config.horarios.sabado}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService?.id ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          </DialogHeader>
          {editingService && (
            <div className="space-y-4">
              <div>
                <Label>Nome do Serviço</Label>
                <Input
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço Original</Label>
                  <Input
                    type="number"
                    value={editingService.preco_original}
                    onChange={(e) =>
                      setEditingService({ ...editingService, preco_original: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label>Preço Promocional</Label>
                  <Input
                    type="number"
                    value={editingService.preco_promocional}
                    onChange={(e) =>
                      setEditingService({ ...editingService, preco_promocional: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Categoria</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={editingService.category}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                >
                  <option value="laser">Laser</option>
                  <option value="facial">Facial</option>
                  <option value="wellness">Wellness</option>
                  <option value="injectable">Injectable</option>
                  <option value="body">Body</option>
                </select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => saveService(editingService)} className="bg-salmon-500 hover:bg-salmon-600">
                  Salvar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Service Details Dialog */}
      <Dialog open={isServiceDetailsDialogOpen} onOpenChange={setIsServiceDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Detalhes - {editingService?.name}</DialogTitle>
          </DialogHeader>
          {editingService && (
            <div className="space-y-4">
              <div>
                <Label>Descrição Longa</Label>
                <Textarea
                  value={editingService.longDescription || ""}
                  onChange={(e) => setEditingService({ ...editingService, longDescription: e.target.value })}
                  rows={5}
                  placeholder="Descrição detalhada do tratamento..."
                />
              </div>
              <div>
                <Label>Duração (ex: 60 min, 30-60 min)</Label>
                <Input
                  value={editingService.duration || ""}
                  onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })}
                  placeholder="60 min"
                />
              </div>
              <div>
                <Label>Benefícios (um por linha)</Label>
                <Textarea
                  value={(editingService.benefits || []).join("\n")}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      benefits: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                  rows={6}
                  placeholder="Benefício 1&#10;Benefício 2&#10;Benefício 3"
                />
                <p className="text-xs text-muted-foreground mt-1">Digite um benefício por linha</p>
              </div>
              <div>
                <Label>Perguntas Frequentes</Label>
                <div className="space-y-3 mt-2">
                  {(editingService.faqs || []).map((faq, index) => (
                    <div key={index} className="border rounded p-3 space-y-2">
                      <div>
                        <Label className="text-xs">Pergunta {index + 1}</Label>
                        <Input
                          value={faq.question}
                          onChange={(e) => {
                            const newFaqs = [...(editingService.faqs || [])]
                            newFaqs[index] = { ...newFaqs[index], question: e.target.value }
                            setEditingService({ ...editingService, faqs: newFaqs })
                          }}
                          placeholder="Pergunta..."
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Resposta {index + 1}</Label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => {
                            const newFaqs = [...(editingService.faqs || [])]
                            newFaqs[index] = { ...newFaqs[index], answer: e.target.value }
                            setEditingService({ ...editingService, faqs: newFaqs })
                          }}
                          rows={2}
                          placeholder="Resposta..."
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => {
                          const newFaqs = (editingService.faqs || []).filter((_, i) => i !== index)
                          setEditingService({ ...editingService, faqs: newFaqs })
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remover
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingService({
                        ...editingService,
                        faqs: [...(editingService.faqs || []), { question: "", answer: "" }],
                      })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar FAQ
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsServiceDetailsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    saveService(editingService)
                    setIsServiceDetailsDialogOpen(false)
                  }}
                  className="bg-salmon-500 hover:bg-salmon-600"
                >
                  Salvar Detalhes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Combo Dialog */}
      <Dialog open={isComboDialogOpen} onOpenChange={setIsComboDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCombo?.id ? "Editar Combo" : "Novo Combo"}</DialogTitle>
          </DialogHeader>
          {editingCombo && (
            <div className="space-y-4">
              <div>
                <Label>Nome do Combo</Label>
                <Input
                  value={editingCombo.name}
                  onChange={(e) => setEditingCombo({ ...editingCombo, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editingCombo.description}
                  onChange={(e) => setEditingCombo({ ...editingCombo, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Serviços (separados por vírgula)</Label>
                <Input
                  value={editingCombo.services.join(", ")}
                  onChange={(e) =>
                    setEditingCombo({
                      ...editingCombo,
                      services: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Preço Original</Label>
                  <Input
                    type="number"
                    value={editingCombo.preco_original}
                    onChange={(e) =>
                      setEditingCombo({ ...editingCombo, preco_original: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label>Preço Promocional</Label>
                  <Input
                    type="number"
                    value={editingCombo.preco_promocional}
                    onChange={(e) =>
                      setEditingCombo({ ...editingCombo, preco_promocional: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label>Sessões</Label>
                  <Input
                    type="number"
                    value={editingCombo.sessions}
                    onChange={(e) =>
                      setEditingCombo({ ...editingCombo, sessions: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsComboDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => saveCombo(editingCombo)} className="bg-salmon-500 hover:bg-salmon-600">
                  Salvar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Course Dialog */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse?.id ? "Editar Curso" : "Novo Curso"}</DialogTitle>
          </DialogHeader>
          {editingCourse && (
            <div className="space-y-4">
              <div>
                <Label>Nome do Curso</Label>
                <Input
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço</Label>
                  <Input
                    type="number"
                    value={editingCourse.preco}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, preco: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label>Duração</Label>
                  <Input
                    value={editingCourse.duration}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Formato</Label>
                  <Input
                    value={editingCourse.format}
                    onChange={(e) => setEditingCourse({ ...editingCourse, format: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Certificado</Label>
                  <Input
                    value={editingCourse.certificate}
                    onChange={(e) => setEditingCourse({ ...editingCourse, certificate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Turmas</Label>
                <Input
                  value={editingCourse.students}
                  onChange={(e) => setEditingCourse({ ...editingCourse, students: e.target.value })}
                />
              </div>
              <div>
                <Label>Imagem do Curso</Label>
                {editingCourse.image && (
                  <div className="mt-2 mb-3 relative w-full h-48 rounded overflow-hidden border">
                    <Image src={editingCourse.image} alt={editingCourse.name} fill className="object-cover" />
                    <button
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir esta imagem?")) {
                          setEditingCourse({ ...editingCourse, image: "" })
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        if (editingCourse.id && courses.find(c => c.id === editingCourse.id)) {
                          // Curso existente - fazer upload direto
                          await handleCourseImageUpload(editingCourse.id, e.target.files[0])
                        } else {
                          // Novo curso - fazer upload e salvar URL no estado
                          setUploadingPhotos(true)
                          try {
                            const tempId = editingCourse.id || editingCourse.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                            const storageRef = ref(storage, `cursos/${tempId}/${Date.now()}_${e.target.files[0].name}`)
                            await uploadBytes(storageRef, e.target.files[0])
                            const imageUrl = await getDownloadURL(storageRef)
                            setEditingCourse({ ...editingCourse, image: imageUrl })
                            toast({
                              title: "Sucesso",
                              description: "Imagem carregada. Salve o curso para finalizar.",
                            })
                          } catch (error) {
                            console.error("Error uploading image:", error)
                            toast({
                              title: "Erro",
                              description: "Não foi possível carregar a imagem",
                              variant: "destructive",
                            })
                          } finally {
                            setUploadingPhotos(false)
                          }
                        }
                      }
                    }}
                    disabled={uploadingPhotos}
                  />
                  <Button type="button" variant="outline" disabled={uploadingPhotos} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingPhotos ? "Enviando..." : editingCourse.image ? "Trocar Imagem" : "Enviar Imagem"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Envie uma imagem para o curso (recomendado: 1200x675px)</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCourseDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => saveCourse(editingCourse)} className="bg-salmon-500 hover:bg-salmon-600">
                  Salvar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Recurring Appointment Dialog */}
      <Dialog open={isRecurringDialogOpen} onOpenChange={setIsRecurringDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecurring?.id ? "Editar Agendamento Fixo" : "Novo Agendamento Fixo"}</DialogTitle>
          </DialogHeader>
          {editingRecurring && (
            <div className="space-y-4">
              <div>
                <Label>Nome do Cliente</Label>
                <Input
                  value={editingRecurring.clienteNome}
                  onChange={(e) => setEditingRecurring({ ...editingRecurring, clienteNome: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={editingRecurring.clienteEmail}
                    onChange={(e) => setEditingRecurring({ ...editingRecurring, clienteEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={editingRecurring.clientePhone}
                    onChange={(e) => setEditingRecurring({ ...editingRecurring, clientePhone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Serviço</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={editingRecurring.servicoId}
                  onChange={(e) => {
                    const service = services.find((s) => s.id === e.target.value)
                    setEditingRecurring({
                      ...editingRecurring,
                      servicoId: e.target.value,
                      servicoNome: service?.name || "",
                      servicoPreco: service?.preco_promocional || 0,
                    })
                  }}
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - R$ {service.preco_promocional}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={editingRecurring.hora}
                    onChange={(e) => setEditingRecurring({ ...editingRecurring, hora: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={editingRecurring.tipo}
                    onChange={(e) =>
                      setEditingRecurring({
                        ...editingRecurring,
                        tipo: e.target.value as "semanal" | "mensal",
                      })
                    }
                  >
                    <option value="semanal">Semanal</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </div>
              </div>
              {editingRecurring.tipo === "semanal" && (
                <div>
                  <Label>Dia da Semana</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={editingRecurring.diaSemana}
                    onChange={(e) =>
                      setEditingRecurring({ ...editingRecurring, diaSemana: parseInt(e.target.value) })
                    }
                  >
                    <option value="1">Segunda-feira</option>
                    <option value="2">Terça-feira</option>
                    <option value="3">Quarta-feira</option>
                    <option value="4">Quinta-feira</option>
                    <option value="5">Sexta-feira</option>
                    <option value="6">Sábado</option>
                  </select>
                </div>
              )}
              {editingRecurring.tipo === "mensal" && (
                <div>
                  <Label>Dia do Mês (1-31)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={editingRecurring.diaMes}
                    onChange={(e) =>
                      setEditingRecurring({ ...editingRecurring, diaMes: parseInt(e.target.value) })
                    }
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={editingRecurring.ativo}
                  onChange={(e) => setEditingRecurring({ ...editingRecurring, ativo: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="ativo">Agendamento Ativo</Label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRecurringDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      if (editingRecurring.id && recurringAppointments.find((r) => r.id === editingRecurring.id)) {
                        await setDoc(doc(db, "agendamentos-fixos", editingRecurring.id), editingRecurring)
                      } else {
                        const newId = `${editingRecurring.clienteNome.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`
                        await setDoc(doc(db, "agendamentos-fixos", newId), { ...editingRecurring, id: newId })
                      }
                      toast({
                        title: "Sucesso",
                        description: "Agendamento fixo salvo com sucesso",
                      })
                      setIsRecurringDialogOpen(false)
                      setEditingRecurring(null)
                    } catch (error) {
                      console.error("Error saving recurring:", error)
                      toast({
                        title: "Erro",
                        description: "Não foi possível salvar o agendamento fixo",
                        variant: "destructive",
                      })
                    }
                  }}
                  className="bg-salmon-500 hover:bg-salmon-600"
                >
                  Salvar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Configurações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>WhatsApp</Label>
              <Input
                value={config.whatsapp}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
              />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input
                value={config.instagram}
                onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
              />
            </div>
            <div>
              <Label>Endereço</Label>
              <Textarea
                value={config.endereco}
                onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
              />
            </div>
            <div>
              <Label>Horário Semana</Label>
              <Input
                value={config.horarios.semana}
                onChange={(e) =>
                  setConfig({ ...config, horarios: { ...config.horarios, semana: e.target.value } })
                }
              />
            </div>
            <div>
              <Label>Horário Sábado</Label>
              <Input
                value={config.horarios.sabado}
                onChange={(e) =>
                  setConfig({ ...config, horarios: { ...config.horarios, sabado: e.target.value } })
                }
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveConfig} className="bg-salmon-500 hover:bg-salmon-600">
                Salvar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
