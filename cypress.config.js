const { defineConfig } = require("cypress")

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3001", // cambia el puerto si tu app corre en otro
    supportFile: "cypress/support/e2e.js",
    video: false,
  },
})
