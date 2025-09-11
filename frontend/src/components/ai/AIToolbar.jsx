"use client"

import { useState } from "react"
import { SparklesIcon, ShieldCheckIcon, LightBulbIcon, Cog6ToothIcon } from "@heroicons/react/24/outline"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import AIAnalysisPanel from "./AIAnalysisPanel"
import PlagiarismChecker from "./PlagiarismChecker"
import SuggestionsPanel from "./SuggestionsPanel"

function AIToolbar({ text, language = "es", citationStyle = "apa", category = "essay" }) {
  const [activeModal, setActiveModal] = useState(null)
  const [settings, setSettings] = useState({
    language,
    citationStyle,
    category,
  })

  const tools = [
    {
      id: "analysis",
      name: "Análisis IA",
      description: "Análisis completo con inteligencia artificial",
      icon: SparklesIcon,
      color: "bg-secondary text-secondary-foreground",
      component: AIAnalysisPanel,
    },
    {
      id: "plagiarism",
      name: "Verificar Plagio",
      description: "Detección de similitudes y plagio",
      icon: ShieldCheckIcon,
      color: "bg-primary text-primary-foreground",
      component: PlagiarismChecker,
    },
    {
      id: "suggestions",
      name: "Sugerencias",
      description: "Recomendaciones de mejora",
      icon: LightBulbIcon,
      color: "bg-accent text-accent-foreground",
      component: SuggestionsPanel,
    },
  ]

  const openModal = (toolId) => {
    setActiveModal(toolId)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  const activeTool = tools.find((tool) => tool.id === activeModal)
  const ActiveComponent = activeTool?.component

  return (
    <>
      {/* Toolbar */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-semibold text-card-foreground">Herramientas de IA</h3>

          <button
            onClick={() => setActiveModal("settings")}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Configuración"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => openModal(tool.id)}
              disabled={!text || text.trim().length < 10}
              className={`${tool.color} p-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-left`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <tool.icon className="w-6 h-6" />
                <span className="font-medium">{tool.name}</span>
              </div>
              <p className="text-sm opacity-90">{tool.description}</p>
            </button>
          ))}
        </div>

        {(!text || text.trim().length < 10) && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Escribe al menos 10 caracteres para usar las herramientas de IA
          </p>
        )}
      </div>

      {/* Modal */}
      <Transition appear show={!!activeModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-background p-6 text-left align-middle shadow-xl transition-all">
                  {activeModal === "settings" ? (
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-serif font-semibold text-foreground mb-4">
                        Configuración de Herramientas IA
                      </Dialog.Title>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Idioma</label>
                          <select
                            value={settings.language}
                            onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground"
                          >
                            <option value="es">Español</option>
                            <option value="en">Inglés</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Estilo de Citación</label>
                          <select
                            value={settings.citationStyle}
                            onChange={(e) => setSettings((prev) => ({ ...prev, citationStyle: e.target.value }))}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground"
                          >
                            <option value="apa">APA</option>
                            <option value="ieee">IEEE</option>
                            <option value="mla">MLA</option>
                            <option value="chicago">Chicago</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Categoría del Documento
                          </label>
                          <select
                            value={settings.category}
                            onChange={(e) => setSettings((prev) => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground"
                          >
                            <option value="essay">Ensayo</option>
                            <option value="thesis">Tesis</option>
                            <option value="research">Investigación</option>
                            <option value="report">Reporte</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          onClick={closeModal}
                          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={closeModal}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : ActiveComponent ? (
                    <ActiveComponent text={text} settings={settings} onClose={closeModal} />
                  ) : null}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default AIToolbar
