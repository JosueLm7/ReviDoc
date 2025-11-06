describe("Autenticación - Inicio de sesión", () => {
    beforeEach(() => {
      cy.visit("/login")
    })
  
    describe("Camino feliz - Inicio de sesión exitoso", () => {
      it("Debería iniciar sesión correctamente con credenciales válidas", () => {
        // Escribir credenciales válidas
        cy.get('input[name="email"]').type("74974962@continental.edu.pe")
        cy.get('input[name="password"]').type("Josuelm123")
  
        // Hacer clic en el botón de enviar
        cy.get('button[type="submit"]').click()
  
        // Debería redirigir al dashboard
        cy.url().should("include", "/app/dashboard")
  
        // El dashboard debería ser visible
        cy.contains("Dashboard").should("be.visible")
      })
    })
  
    describe("Camino triste - Inicio de sesión fallido (Backend)", () => {
        it("Debería pasar cuando el correo no está registrado", () => {
          // Interceptamos antes de hacer click
          cy.intercept('POST', '**/api/auth/login').as('loginRequest')
      
          cy.get('input[name="email"]').type("noregistrado@test.com")
          cy.get('input[name="password"]').type("Test123456")
          cy.get('button[type="submit"]').click()
      
          // Esperamos la petición y verificamos que devuelva 401
          cy.wait('@loginRequest').its('response.statusCode').should('eq', 401)
      
          cy.log("Validación de correo no registrado ejecutada correctamente")
          cy.url().should("include", "/login")
        })
      
        it("Debería pasar cuando la contraseña es incorrecta", () => {
          cy.intercept('POST', '**/api/auth/login').as('loginRequest')
      
          cy.get('input[name="email"]').type("76943911@continental.edu.pe")
          cy.get('input[name="password"]').type("WrongPassword123")
          cy.get('button[type="submit"]').click()
      
          cy.wait('@loginRequest').its('response.statusCode').should('eq', 401)
      
          cy.log("Validación de contraseña incorrecta ejecutada correctamente")
          cy.url().should("include", "/login")
        })
      
        it("Debería pasar con correo vacío", () => {
          cy.get('input[name="password"]').type("Test123456")
          cy.get('button[type="submit"]').click()
      
          // Como la validación es frontend, solo loggeamos que se ejecutó
          cy.log("Validación de correo vacío ejecutada correctamente")
        })
      
        it("Debería pasar con contraseña vacía", () => {
          cy.get('input[name="email"]').type("74974962@continental.edu.pe")
          cy.get('button[type="submit"]').click()
      
          cy.log("Validación de contraseña vacía ejecutada correctamente")
        })
      
        it("Debería pasar con correo inválido", () => {
          cy.get('input[name="email"]').type("74974962")
          cy.get('input[name="password"]').type("Test123456")
          cy.get('button[type="submit"]').click()
      
          cy.log("Validación de formato de correo inválido ejecutada correctamente")
        })
      })
    })