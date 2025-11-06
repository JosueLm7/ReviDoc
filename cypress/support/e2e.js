import './commands'

// Ignorar errores no controlados en el navegador
Cypress.on("uncaught:exception", (err, runnable) => {
  return false
})