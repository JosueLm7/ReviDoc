describe("Autenticación - Registro", () => {
    beforeEach(() => {
      cy.visit("/register")
    })
  
    describe("Camino feliz - Registro exitoso", () => {
      it("Debería registrarse correctamente con datos válidos", () => {
        const timestamp = Date.now()
        const email = `newuser${timestamp}@test.com`
  
        cy.get('input[name="name"]').type("Juan Pérez")
        cy.get('input[name="email"]').type(email)
        cy.get('select[name="role"]').select("student")
        cy.get('input[name="password"]').type("Test123456")
        cy.get('input[name="confirmPassword"]').type("Test123456")
  
        cy.get('button[type="submit"]').click()
  
        cy.url().should("include", "/app/dashboard", { timeout: 5000 })
        cy.contains("Dashboard", { timeout: 5000 }).should("be.visible")
      })
    })
  
    describe("Camino triste - Registro fallido", () => {
      it("Debería pasar cuando el correo ya está registrado", () => {
        // Interceptar la petición POST antes del click
        cy.intercept('POST', '**/api/auth/register').as('registerRequest')
  
        cy.get('input[name="name"]').type("Josue Lorenzo Masgo")
        cy.get('input[name="email"]').type("74974962@continental.edu.pe")
        cy.get('select[name="role"]').select("student")
        cy.get('input[name="password"]').type("Josuelm123")
        cy.get('input[name="confirmPassword"]').type("Josuelm123")
  
        cy.get('button[type="submit"]').click()
  
        // Esperar la petición y verificar que devuelva 400 o 409 según tu backend
        cy.wait('@registerRequest').its('response.statusCode').should('be.oneOf', [400, 409])
  
        cy.log("Validación de correo existente ejecutada correctamente")
        cy.url().should("include", "/register")
      })
  
      it("Debería mostrar error cuando las contraseñas no coinciden", () => {
        const timestamp = Date.now()
  
        cy.get('input[name="name"]').type("Juan Pérez")
        cy.get('input[name="email"]').type(`user${timestamp}@test.com`)
        cy.get('select[name="role"]').select("student")
        cy.get('input[name="password"]').type("Test123456")
        cy.get('input[name="confirmPassword"]').type("Different123")
  
        cy.get('button[type="submit"]').click()
        cy.contains("Las contraseñas no coinciden").should("be.visible")
      })
  
      it("Debería mostrar error para contraseña débil", () => {
        const timestamp = Date.now()
  
        cy.get('input[name="name"]').type("Juan Pérez")
        cy.get('input[name="email"]').type(`user${timestamp}@test.com`)
        cy.get('select[name="role"]').select("student")
        cy.get('input[name="password"]').type("weak")
        cy.get('input[name="confirmPassword"]').type("weak")
  
        cy.get('button[type="submit"]').click()
        cy.contains("La contraseña debe tener al menos 6 caracteres").should("be.visible")
      })
  
      it("Debería mostrar error para campos obligatorios faltantes", () => {
        cy.get('input[name="email"]').type("test@test.com")
        cy.get('input[name="password"]').type("Test123456")
        cy.get('input[name="confirmPassword"]').type("Test123456")
  
        cy.get('button[type="submit"]').click()
        cy.contains("El nombre es requerido").should("be.visible")
      })
    })
  })  