"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../contexts/ThemeContext"
import { BookOpenIcon, BellIcon, UserCircleIcon, SunIcon, MoonIcon, Cog6ToothIcon } from "@heroicons/react/24/outline"
import { Menu, Transition } from "@headlessui/react"
import { Fragment } from "react"

function Header() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/app/dashboard" className="flex items-center space-x-3">
          <BookOpenIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">Academic Writer</h1>
            <p className="text-xs text-muted-foreground">Revisión Inteligente</p>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === "light" ? (
              <MoonIcon className="w-5 h-5 text-muted-foreground" />
            ) : (
              <SunIcon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
            <BellIcon className="w-5 h-5 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
          </button>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <UserCircleIcon className="w-8 h-8 text-muted-foreground" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/app/profile"
                      className={`flex items-center px-4 py-2 text-sm ${
                        active ? "bg-muted text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <UserCircleIcon className="w-4 h-4 mr-3" />
                      Mi Perfil
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/app/profile"
                      className={`flex items-center px-4 py-2 text-sm ${
                        active ? "bg-muted text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-3" />
                      Configuración
                    </Link>
                  )}
                </Menu.Item>
                <hr className="my-1 border-border" />
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                        active ? "bg-muted text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      Cerrar Sesión
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  )
}

export default Header
