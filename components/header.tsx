"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user)
    })
    return () => unsubscribe()
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">

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
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-salmon-500 transition-colors">
              <Button size="sm" variant="outline" className="rounded-full px-6">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          )}
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
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="outline" className="w-full">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            )}
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
