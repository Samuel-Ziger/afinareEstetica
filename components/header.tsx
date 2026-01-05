"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Bell, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      {/* Top Bar */}
      <div className="bg-neutral-100 border-b border-gray-200 py-1">
        <div className="container px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Lock className="h-3 w-3" />
            <span>Afinare Estética</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-3 w-3 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div>
            <div className="font-serif text-3xl text-gray-900 leading-none">Afinare Estética</div>
            <div className="text-[10px] text-gray-500 tracking-wide">Beleza além da aparência</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-sm font-medium text-gray-900 hover:text-salmon-500 transition-colors relative after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-salmon-500"
          >
            Home
          </Link>
          <Link href="/servicos" className="text-sm font-medium text-gray-600 hover:text-salmon-500 transition-colors">
            Serviços
          </Link>
          <Link href="/combos" className="text-sm font-medium text-gray-600 hover:text-salmon-500 transition-colors">
            Combos
          </Link>
          <Link href="/cursos" className="text-sm font-medium text-gray-600 hover:text-salmon-500 transition-colors">
            Cursos
          </Link>
          <Link
            href="/agendamento"
            className="text-sm font-medium text-gray-600 hover:text-salmon-500 transition-colors"
          >
            Agendamento
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-salmon-500 hover:bg-salmon-600 text-white rounded-full px-6">
              Login
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-gray-200 bg-white">
          <div className="container flex flex-col space-y-4 px-4 py-4">
            <Link
              href="/"
              className="text-sm font-medium hover:text-salmon-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/servicos"
              className="text-sm font-medium hover:text-salmon-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Serviços
            </Link>
            <Link
              href="/combos"
              className="text-sm font-medium hover:text-salmon-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Combos
            </Link>
            <Link
              href="/cursos"
              className="text-sm font-medium hover:text-salmon-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cursos
            </Link>
            <Link
              href="/agendamento"
              className="text-sm font-medium hover:text-salmon-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Agendamento
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" className="w-full bg-salmon-500 hover:bg-salmon-600 text-white">
                Login
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
