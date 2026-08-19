import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { checkAuth } from '../../features/auth/auth.ts'
import { LayoutDashboard, FolderPlus, Globe, LogOut, Image as ImageIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const auth = await checkAuth()
    if (!auth.isAuthenticated) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#000D1A] text-white flex flex-col md:flex-row">
      {/* Sidebar / Topnav */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-black/20 p-4 md:p-6 flex flex-row md:flex-col gap-4 md:gap-6 backdrop-blur-xl overflow-x-auto items-center md:items-start shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-white px-2 hidden md:block">Admin</h2>
        <nav className="flex flex-row md:flex-col gap-2 w-full">
          <Link to="/admin" className="[&.active]:bg-white/10 rounded-md shrink-0 whitespace-nowrap">
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Álbuns
            </Button>
          </Link>
          <Link to="/admin/photos" className="[&.active]:bg-white/10 rounded-md shrink-0 whitespace-nowrap">
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
              <ImageIcon className="mr-2 h-4 w-4" />
              Todas as Fotos
            </Button>
          </Link>
          <Link to="/admin/albums/create" className="[&.active]:bg-white/10 rounded-md shrink-0 whitespace-nowrap">
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
              <FolderPlus className="mr-2 h-4 w-4" />
              Novo Álbum
            </Button>
          </Link>
          <Link to="/" className="md:mt-auto whitespace-nowrap shrink-0">
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
              <Globe className="mr-2 h-4 w-4" />
              Ver Site
            </Button>
          </Link>
        </nav>
      </aside>
      
      {/* Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  )
}
