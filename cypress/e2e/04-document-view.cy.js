import { describe, beforeEach, it } from "mocha"
import { cy } from "cypress"

describe("Documents - View", () => {
  beforeEach(() => {
    cy.login("estudiante@test.com", "Test123456")
    cy.visit("/app/documents")
  })

  describe("Happy Path - Successfully View Document", () => {
    it("Should view document details", () => {
      // Wait for documents to load
      cy.get("a", { timeout: 10000 }).contains("Ver").first().click()

      // Document view page should be visible
      cy.url().should("include", "/app/documents/")

      // PDF preview should be visible
      cy.get("iframe").should("be.visible")

      // Document content should be visible
      cy.contains("Análisis IA").should("be.visible")
    })
  })

  describe("Sad Path - Failed Document View", () => {
    it("Should show error if document does not exist", () => {
      // Try to access non-existent document
      cy.visit("/app/documents/invalid-id")

      // Should show error message
      cy.contains("no encontrado", { timeout: 5000 }).should("be.visible")
    })

    it("Should show error if user is not authorized", () => {
      // Logout and login as different user
      cy.window().then((win) => {
        win.localStorage.removeItem("token")
      })

      cy.login("otro@test.com", "Test123456")

      // Try to access another user's document
      cy.visit("/app/documents/invalid-id")

      // Should redirect or show unauthorized
      cy.url().should("not.include", "/invalid-id")
    })
  })
})