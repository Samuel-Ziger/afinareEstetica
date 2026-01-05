export interface Service {
  id: string
  name: string
  description: string
  preco_original: number
  preco_promocional: number
  fotos: string[]
  category: "laser" | "facial" | "wellness" | "injectable" | "body"
}

export interface Combo {
  id: string
  name: string
  description: string
  services: string[]
  preco_original: number
  preco_promocional: number
  image: string
}

export interface Course {
  id: string
  name: string
  description: string
  duration: string
  preco: number
  benefits: string[]
  image: string
}

export interface Appointment {
  id: string
  clienteId: string
  clienteNome: string
  clienteEmail: string
  clientePhone: string
  servicoId: string
  servicoNome: string
  data: string
  hora: string
  status: "pendente" | "confirmado" | "concluido" | "cancelado"
  createdAt: Date
}

export interface Config {
  whatsapp: string
  endereco: string
  horarios_funcionamento: {
    weekday: string
    saturday: string
  }
  instagram: string
}
