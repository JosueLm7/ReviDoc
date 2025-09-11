"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme")
    return savedTheme || "light"
  })

  useEffect(() => {
    const root = window.document.documentElement

    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  const value = {
    theme,
    setTheme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
