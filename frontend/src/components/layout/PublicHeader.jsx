"use client"
import { Link } from "react-router-dom"
import { useTheme } from "../../contexts/ThemeContext"
import { BookOpenIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline"

function PublicHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <BookOpenIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">Academic Writer</h1>
              <p className="text-xs text-muted-foreground">Revisión Inteligente con IA</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === "light" ? (
                <MoonIcon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <SunIcon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Iniciar Sesión
            </Link>

            <Link
              to="/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default PublicHeader
