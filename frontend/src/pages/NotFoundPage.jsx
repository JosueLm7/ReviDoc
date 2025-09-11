"use client"
import { Link } from "react-router-dom"
import { HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Página no encontrada</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Ir al Inicio
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver Atrás
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
