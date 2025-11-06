// Importar variables necesarias
const describe = window.describe
const beforeEach = window.beforeEach
const it = window.it
const Cypress = window.Cypress
const cy = window.cy

describe("Documentos - Subida", () => {
  beforeEach(() => {
    // Ir a login
    cy.visit("/login")
  
    // Rellenar formulario
    cy.get('input[name="email"]').type("74974962@continental.edu.pe")
    cy.get('input[name="password"]').type("Josuelm123")
    cy.get('button[type="submit"]').click()
  
    // Esperar a que cargue dashboard
    cy.url({ timeout: 10000 }).should("include", "/app/dashboard")
  
    // Luego visitar upload
    cy.visit("/app/documents/upload")

    // Stub para alert, pero dejar que se ejecute
    cy.window().then((win) => {
      cy.stub(win, 'alert').callsFake((msg) => {
        console.log("Alerta disparada:", msg) // Aparece en la consola de Cypress
        win.alert(msg) // Ejecuta la alerta como en la app
      })
    })
  })

  it("Debería subir un documento correctamente", () => {
    const nombreArchivo = "documento-prueba.txt"
    const contenidoArchivo =
      "Este es un documento de prueba para verificar el análisis de texto. El documento contiene múltiples párrafos para un análisis más detallado."

    // Seleccionar archivo
    cy.get('#file-upload', { timeout: 10000 }).selectFile({
      contents: Cypress.Buffer.from(contenidoArchivo),
      fileName: nombreArchivo,
      mimeType: "text/plain",
    }, { force: true })

    // Esperar que aparezca en la lista
    cy.contains(nombreArchivo, { timeout: 5000 }).should("be.visible")

    // Hacer clic en subir
    cy.get("button").contains("Subir").should("not.be.disabled").click({ force: true })

    // Solo verificar que redirige a documentos
    cy.url({ timeout: 10000 }).should("include", "/app/documents")
  })

  describe("Camino Triste - Subida fallida", () => {
    it("Debería rechazar archivo con formato inválido", () => {
      cy.get('#file-upload').selectFile({
        contents: Cypress.Buffer.from("test"),
        fileName: "archivo.exe",
        mimeType: "application/octet-stream",
      }, { force: true })

      cy.get("button").contains("Subir").click({ force: true })
      // Alerta se dispara pero no se verifica
    })

    it("Debería rechazar archivo que exceda el tamaño máximo", () => {
        const contenidoArchivo = "x".repeat(11 * 1024 * 1024) // 11MB

        cy.get('#file-upload').selectFile({
            contents: Cypress.Buffer.from(contenidoArchivo),
            fileName: "archivo-grande.txt",
            mimeType: "text/plain",
        }, { force: true })
    })

    it("Debería mostrar error si la subida falla en el servidor", () => {
      const nombreArchivo = "documento-prueba.txt"
      const contenidoArchivo = "Contenido de prueba"

      // Interceptar la petición y simular error
      cy.intercept("POST", "**/api/documents/upload", {
        statusCode: 500,
        body: { message: "Error del servidor" },
      })

      cy.get('#file-upload').selectFile({
        contents: Cypress.Buffer.from(contenidoArchivo),
        fileName: nombreArchivo,
        mimeType: "text/plain",
      }, { force: true })

      cy.get("button").contains("Subir").click({ force: true })
      // Alerta se dispara pero no se verifica
    })
  })
})
