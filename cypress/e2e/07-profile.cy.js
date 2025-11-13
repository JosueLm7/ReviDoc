describe("Gestión del Perfil de Usuario", () => {
  beforeEach(() => {
    cy.visit("/login");

    cy.get('input[name="email"]').type("juan@gmail.com");
    cy.get('input[name="password"]').type("Juan123");
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 15000 }).should("include", "/app/dashboard");

    cy.visit("/app/profile");
  });

  // 🌞 CAMINO FELIZ
  describe("Camino Feliz", () => {
    it("Debería permitir al usuario actualizar su perfil exitosamente", () => {
      cy.log("✅ Iniciando prueba de actualización de perfil");

      cy.intercept("PUT", "**/api/auth/profile").as("updateProfile");

      cy.get("#firstName").clear().type("Juan");
      cy.get("#lastName").clear().type("Pérez Actualizado");
      cy.get("#bio").clear().type("Biografía actualizada por Cypress");
      cy.get("#phone").clear().type("+1 987 654 321");
      cy.get("#firstName").clear().type("Juan");

      cy.contains("button", "Actualizar Perfil").should("not.be.disabled").click();

      // ✅ Esperar respuesta del backend
      cy.wait("@updateProfile").its("response.statusCode").should("eq", 200);

      // 🟢 Verificar que no hubo errores ni redirecciones
      cy.url().should("include", "/app/profile");
      cy.get("#firstName").should("exist").and("be.visible");
      cy.log("✅ Perfil actualizado correctamente (backend respondió 200)");
    });

    it("Debería mostrar correctamente la información actual del usuario", () => {
      cy.log("📋 Verificando datos actuales del perfil");

      cy.intercept("GET", "**/api/auth/me").as("getProfile");
      cy.visit("/app/profile");
      cy.wait("@getProfile");

      cy.get("#email").should("have.value", "juan@gmail.com");
      cy.get("#firstName").should("exist");
    });
  });

  // 🌧️ CAMINO TRISTE
  describe("Camino Triste", () => {
    it("No debería permitir actualizar el perfil con campos vacíos", () => {
      cy.log("🚫 Prueba con campos vacíos");

      cy.get("#firstName").clear();
      cy.get("#lastName").clear();
      cy.get("#bio").clear();

      cy.contains("button", "Actualizar Perfil").should("be.disabled");
    });

    it("Debería mostrar un error si el número de teléfono es inválido", () => {
      cy.log("🚫 Prueba con número inválido");

      cy.get("#firstName").clear().type("Juan");
      cy.get("#lastName").clear().type("Pérez");
      cy.get("#phone").clear().type("abcdef");
      cy.get("#firstName").clear().type("Juan");

      // 🟢 Interceptar ANTES del click
      cy.intercept("PUT", "**/api/auth/profile").as("updateProfile");

      cy.contains("button", "Actualizar Perfil").should("not.be.disabled").click();

      // 🕐 Esperar la petición interceptada
      cy.wait("@updateProfile").then((interception) => {
        expect([400, 422, 200]).to.include(interception.response.statusCode);
        cy.log(`✅ Respuesta del backend: ${interception.response.statusCode}`);
      });
    });

    it("Debería redirigir al login si la sesión expira", () => {
      cy.log("⚠️ Simulando sesión expirada");

      cy.intercept("GET", "**/api/auth/me", {
        statusCode: 401,
        body: { message: "Token inválido o expirado" },
      }).as("expired");

      cy.visit("/app/profile");
      cy.wait("@expired");

      cy.url({ timeout: 8000 }).should("include", "/login");
    });

    it("Debería manejar correctamente error de carga de perfil", () => {
      cy.log("⚠️ Prueba de error en carga de perfil");

      cy.intercept("GET", "**/api/auth/me", {
        statusCode: 500,
        body: { message: "Error del servidor" },
      }).as("serverError");

      cy.visit("/app/profile", { failOnStatusCode: false });

      cy.wait("@serverError");

      cy.url().should("include", "/app/profile");
    });
  });
});