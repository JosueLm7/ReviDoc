import { Outlet } from "react-router-dom"
import PublicHeader from "./PublicHeader"

function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
