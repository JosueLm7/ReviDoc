import { describe, beforeEach, it } from "mocha"
import { cy } from "cypress"

describe("Reviews - View", () => {
  beforeEach(() => {
    cy.login("estudiante@test.com", "Test123456")
  })

  describe("Happy Path - Successfully View Reviews", () => {
    it("Should view list of reviews", () => {
      cy.visit("/app/reviews")

      // Reviews page should load
      cy.contains("Revisiones", { timeout: 10000 }).should("be.visible")

      // Reviews list should be visible
      cy.get("table", { timeout: 5000 }).should("be.visible")
    })

    it("Should view review details", () => {
      cy.visit("/app/reviews")

      // Click first review
      cy.get("a", { timeout: 10000 }).contains("Ver").first().click()

      // Review detail page should load
      cy.url().should("include", "/app/reviews/")

      // Review details should be visible
      cy.contains("Análisis", { timeout: 5000 }).should("be.visible")
    })
  })

  describe("Sad Path - Failed Review View", () => {
    it("Should show error if review does not exist", () => {
      cy.visit("/app/reviews/invalid-id")

      // Should show error
      cy.contains("no encontrada", { timeout: 5000 }).should("be.visible")
    })

    it("Should show empty list if no reviews exist", () => {
      // Mock empty reviews response
      cy.intercept("GET", "**/api/reviews", {
        statusCode: 200,
        body: { data: [] },
      })

      cy.visit("/app/reviews")

      // Should show empty state
      cy.contains("No hay revisiones", { timeout: 5000 }).should("be.visible")
    })
  })
})