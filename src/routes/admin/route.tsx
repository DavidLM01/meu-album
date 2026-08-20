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
      {/* Sidebar / Bottomnav (Mobile) */}
      <aside className="fixed bottom-0 left-0 right-0 z-50 md:relative md:w-64 border-t md:border-t-0 md:border-r border-white/10 bg-[#000D1A]/95 md:bg-black/20 p-3 md:p-6 flex flex-row md:flex-col gap-2 md:gap-6 backdrop-blur-xl overflow-x-auto items-center md:items-start shrink-0">
        <h2 className="text-xl font-bold tracking-tight text-white px-2 hidden md:block">Admin</h2>
        <nav className="flex flex-row md:flex-col gap-2 w-full">
          <Link to="/admin" className="[&.active]:bg-white/10 rounded-md shrink-0 whitespace-nowrap">
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 text-sm md:text-base">
              <LayoutDashboard className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Álbuns
            </Button>
          </Link>
          <Link to="/admin/photos" className="[&.active]:bg-white/10 rounded-md shrink-0 whitespace-nowrap">
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 text-sm md:text-base">
              <ImageIcon className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Todas as Fotos
            </Button>
          </Link>
          <Link to="/admin/albums/create" className="[&.active]:bg-white/10 rounded-md shrink-0 whitespace-nowrap">
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 text-sm md:text-base">
              <FolderPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Novo Álbum
            </Button>
          </Link>
          <Link to="/" className="md:mt-auto whitespace-nowrap shrink-0">
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 text-sm md:text-base">
              <Globe className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Ver Site
            </Button>
          </Link>
        </nav>
      </aside>
      
      {/* Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  )
}
