import { Link } from "react-router-dom"
import {
  BookOpenIcon,
  SparklesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@heroicons/react/24/outline"

function HomePage() {
  const features = [
    {
      icon: SparklesIcon,
      title: "Análisis con IA",
      description:
        "Corrección automática de gramática, estilo y coherencia usando modelos avanzados de inteligencia artificial.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Detección de Plagio",
      description: "Identificación de similitudes y verificación de originalidad con tecnología de embeddings.",
    },
    {
      icon: ChartBarIcon,
      title: "Estadísticas Detalladas",
      description: "Métricas completas de progreso y análisis de patrones de escritura para mejorar continuamente.",
    },
    {
      icon: BookOpenIcon,
      title: "Múltiples Formatos",
      description: "Soporte para PDF, Word y texto plano con extracción inteligente de contenido.",
    },
  ]

  const benefits = [
    "Retroalimentación instantánea y detallada",
    "Mejora continua de habilidades de escritura",
    "Cumplimiento de estándares académicos",
    "Interfaz intuitiva y fácil de usar",
    "Soporte para múltiples estilos de citación",
    "Análisis de coherencia y estructura",
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-muted/20 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 text-balance">
              Mejora tu Escritura Académica con <span className="text-secondary">Inteligencia Artificial</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
              Plataforma colaborativa que utiliza IA avanzada para revisar, corregir y mejorar tus trabajos académicos.
              Obtén retroalimentación instantánea y eleva la calidad de tu escritura.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors inline-flex items-center justify-center"
              >
                Comenzar Gratis
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/login"
                className="border border-border text-foreground px-8 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Funcionalidades Avanzadas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Herramientas potenciadas por IA para transformar tu proceso de escritura académica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card p-6 rounded-lg border border-border">
                <feature.icon className="w-12 h-12 text-secondary mb-4" />
                <h3 className="text-xl font-serif font-semibold text-card-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-pretty">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
                ¿Por qué elegir ReviDoc?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Nuestra plataforma combina tecnología de vanguardia con metodologías pedagógicas probadas para ofrecer
                la mejor experiencia de mejora en escritura académica.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckIcon className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-center">
                <SparklesIcon className="w-16 h-16 text-secondary mx-auto mb-6" />
                <h3 className="text-2xl font-serif font-bold text-card-foreground mb-4">Comienza Hoy Mismo</h3>
                <p className="text-muted-foreground mb-6">
                  Únete a miles de estudiantes y profesores que ya están mejorando su escritura académica con nuestra
                  plataforma.
                </p>
                <Link
                  to="/register"
                  className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors inline-block"
                >
                  Crear Cuenta Gratuita
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            ¿Listo para mejorar tu escritura académica?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a nuestra comunidad y descubre cómo la inteligencia artificial puede transformar tu forma de escribir.
          </p>
          <Link
            to="/register"
            className="bg-secondary text-secondary-foreground px-8 py-4 rounded-lg font-medium hover:bg-secondary/90 transition-colors inline-flex items-center"
          >
            Empezar Ahora
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
