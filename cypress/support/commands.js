Cypress.Commands.add("login", (email, password) => {
    cy.visit("/login")
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
  })
  
  Cypress.Commands.add("logout", () => {
    cy.get("button").contains("Logout").click()
    cy.url().should("include", "/")
  })
  
  Cypress.Commands.add("uploadFile", (fileName) => {
    const filePath = `cypress/fixtures/${fileName}`
    cy.get('input[type="file"]').selectFile(filePath)
  })
  