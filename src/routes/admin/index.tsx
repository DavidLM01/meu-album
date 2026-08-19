import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getAlbums, deleteAlbum } from '../../features/albums/albums.ts'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Plus, Image as ImageIcon, Trash2 } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    const albums = await getAlbums()
    return { albums }
  },
  component: AdminDashboard,
})

function AdminDashboard() {
  const { albums } = Route.useLoaderData()
  const router = useRouter()
  const deleteAlbumFn = useServerFn(deleteAlbum)
  const [albumToDelete, setAlbumToDelete] = useState<number | null>(null)
  
  const confirmDelete = async () => {
    if (albumToDelete === null) return
    try {
      await deleteAlbumFn({ data: albumToDelete })
      router.invalidate()
      toast.success('Álbum excluído com sucesso!')
    } catch (error) {
      toast.error('Erro ao excluir álbum')
    } finally {
      setAlbumToDelete(null)
    }
  }

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    setAlbumToDelete(id)
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meus Álbuns</h1>
        <Link to="/admin/albums/create">
          <Button className="bg-white text-black hover:bg-neutral-200 font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Novo Álbum
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <Link
            key={album.id}
            to={`/admin/albums/${album.id}`}
            className="group block relative"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-all text-red-500 hover:text-red-400 hover:bg-red-500/20 rounded-full"
              onClick={(e) => handleDelete(e, album.id)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/30 transition shadow-lg text-white group-hover:-translate-y-1 duration-300">
            {album.coverUrl ? (
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
              />
            ) : (
              <div className="w-full h-48 bg-black/40 flex flex-col gap-2 items-center justify-center text-white/40">
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm">Sem capa</span>
              </div>
            )}
            <CardContent className="p-4 border-t border-white/5">
              <h3 className="font-semibold text-lg">{album.title}</h3>
              <p className="text-sm text-white/60 mt-1 line-clamp-2">
                {album.description || 'Sem descrição'}
              </p>
            </CardContent>
          </Card>
          </Link>
        ))}
        
        {albums.length === 0 && (
          <div className="col-span-full text-center py-12 text-white/50 border border-dashed border-white/20 bg-white/5 rounded-xl">
            Nenhum álbum criado ainda.
          </div>
        )}
      </div>
      
      <AlertDialog open={albumToDelete !== null} onOpenChange={(open) => !open && setAlbumToDelete(null)}>
        <AlertDialogContent className="bg-[#001F3F] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Álbum</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Tem certeza que deseja excluir este álbum? As fotos contidas nele não serão apagadas e continuarão disponíveis no acervo global ("Todas as Fotos").
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Sim, excluir álbum
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
