import { Phone, Instagram } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container px-4 py-8">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-700">CLN 103 bl b sala 16 Asa Norte</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-700">
            {/* WhatsApp */}
            <Link 
              href="https://wa.me/5561986543099" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-salmon-500 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>WhatsApp: (61) 98654-3099</span>
            </Link>

            {/* Instagram */}
            <Link 
              href="https://instagram.com/afinare.estetica" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-salmon-500 transition-colors"
            >
              <Instagram className="h-4 w-4" />
              <span>@afinare.estetica</span>
            </Link>
          </div>

          <p className="text-xs text-gray-500">
            Segunda a Sexta: 08h às 19h | Sábado: 08h às 13h
          </p>
        </div>
      </div>
    </footer>
  )
}
