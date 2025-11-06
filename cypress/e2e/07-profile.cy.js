import { describe, beforeEach, it } from "cypress"
import { cy } from "cypress"

describe("Profile - Update", () => {
  beforeEach(() => {
    cy.login("estudiante@test.com", "Test123456")
    cy.visit("/app/profile")
  })

  describe("Happy Path - Successful Profile Update", () => {
    it("Should update profile information", () => {
      // Wait for profile to load
      cy.get("input", { timeout: 10000 }).first().should("be.visible")

      // Update name
      cy.get('input[name="firstName"]').clear().type("Juan")
      cy.get('input[name="lastName"]').clear().type("Pérez Actualizado")

      // Update bio
      cy.get("textarea").first().clear().type("Nueva biografía del usuario actualizada")

      // Click save
      cy.get("button").contains("Guardar").click()

      // Should show success message
      cy.contains("actualizado", { timeout: 5000 }).should("be.visible")
    })

    it("Should update password successfully", () => {
      // Scroll to password section
      cy.get("button").contains("Cambiar Contraseña").click()

      // Fill password form
      cy.get('input[name="currentPassword"]').type("Test123456")
      cy.get('input[name="newPassword"]').type("NewTest123456")
      cy.get('input[name="confirmPassword"]').type("NewTest123456")

      // Click update
      cy.get("button").contains("Actualizar", { timeout: 5000 }).click()

      // Should show success
      cy.contains("contraseña", { timeout: 5000 }).should("be.visible")
    })
  })

  describe("Sad Path - Failed Profile Update", () => {
    it("Should show error for incorrect current password", () => {
      cy.get("button").contains("Cambiar Contraseña").click()

      // Fill with wrong current password
      cy.get('input[name="currentPassword"]').type("WrongPassword123")
      cy.get('input[name="newPassword"]').type("NewTest123456")
      cy.get('input[name="confirmPassword"]').type("NewTest123456")

      // Click update
      cy.get("button").contains("Actualizar", { timeout: 5000 }).click()

      // Should show error
      cy.contains("contraseña actual", { timeout: 5000 }).should("be.visible")
    })

    it("Should show error when new passwords do not match", () => {
      cy.get("button").contains("Cambiar Contraseña").click()

      cy.get('input[name="currentPassword"]').type("Test123456")
      cy.get('input[name="newPassword"]').type("NewTest123456")
      cy.get('input[name="confirmPassword"]').type("Different123")

      // Click update
      cy.get("button").contains("Actualizar", { timeout: 5000 }).click()

      // Should show error
      cy.contains("no coinciden", { timeout: 5000 }).should("be.visible")
    })

    it("Should show error on server failure during update", () => {
      // Mock failed update
      cy.intercept("PUT", "**/api/auth/profile", {
        statusCode: 500,
        body: { message: "Error del servidor" },
      })

      cy.get('input[name="firstName"]').clear().type("Juan")

      cy.get("button").contains("Guardar").click()

      // Should show error
      cy.contains("Error", { timeout: 5000 }).should("be.visible")
    })
  })
})