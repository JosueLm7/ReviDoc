import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"

function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 pt-16">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
