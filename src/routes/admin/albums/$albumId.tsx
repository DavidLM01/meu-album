import { createFileRoute, useRouter, Link } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { getAlbumById, getPhotosByAlbumId, getPhotosNotInAlbum } from '../../../features/albums/albums.ts'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { UploadCloud, Trash2, ArrowLeft, Plus } from 'lucide-react'
import { Label } from '../../../components/ui/label'
import { uploadPhoto, removePhotoFromAlbum, addExistingPhotoToAlbum } from '../../../features/photos/photos.ts'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog'
import { compressToWebP } from '../../../utils/image.ts'

export const Route = createFileRoute('/admin/albums/$albumId')({
  loader: async ({ params }) => {
    const albumId = parseInt(params.albumId, 10)
    const [album, photos, availablePhotos] = await Promise.all([
      getAlbumById({ data: albumId }),
      getPhotosByAlbumId({ data: albumId }),
      getPhotosNotInAlbum({ data: albumId }),
    ])
    if (!album) throw new Error('Álbum não encontrado')
    return { album, photos, availablePhotos }
  },
  component: AdminAlbumView,
})

function AdminAlbumView() {
  const { album, photos, availablePhotos } = Route.useLoaderData()
  const router = useRouter()
  const upload = useServerFn(uploadPhoto)
  const removePhoto = useServerFn(removePhotoFromAlbum)
  const addExisting = useServerFn(addExistingPhotoToAlbum)
  
  const [uploading, setUploading] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    let successCount = 0
    let errorCount = 0

    for (const file of files) {
      try {
        const webpFile = await compressToWebP(file, 0.8)
        const formData = new FormData()
        formData.append('file', webpFile)
        formData.append('albumId', album.id.toString())
        await upload({ data: formData })
        successCount++
      } catch (err: any) {
        console.error(err)
        toast.error(err.message || `Erro ao enviar ${file.name}`)
        errorCount++
      }
    }
    
    router.invalidate()
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''

    if (successCount > 0) toast.success(`${successCount} foto(s) enviada(s) com sucesso!`)
    if (errorCount > 0) toast.error(`${errorCount} foto(s) falharam.`)
  }

  const [photoToRemove, setPhotoToRemove] = useState<number | null>(null)

  const confirmDeletePhoto = async () => {
    if (photoToRemove === null) return
    try {
      await removePhoto({ data: { albumId: album.id, photoId: photoToRemove } })
      router.invalidate()
      toast.success('Foto removida do álbum!')
    } catch (err) {
      toast.error('Erro ao remover foto')
    } finally {
      setPhotoToRemove(null)
    }
  }

  const handleDeletePhoto = (photoId: number) => {
    setPhotoToRemove(photoId)
  }

  const handleAddExisting = async (photoId: number) => {
    await addExisting({ data: { albumId: album.id, photoId } })
    router.invalidate()
    setShowGallery(false)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link to="/admin">
          <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full pl-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Álbuns
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{album.title}</h1>
          <p className="text-white/70 mt-1">{album.description}</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowGallery(true)} variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
            <Plus className="w-4 h-4 mr-2" />
            Escolher Existente
          </Button>
          <div>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
              ref={fileInputRef}
            />
            <Label
              htmlFor="photo-upload"
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 bg-white text-black shadow hover:bg-neutral-200 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <UploadCloud className="w-4 h-4" />
              {uploading ? 'Enviando...' : 'Fazer Upload'}
            </Label>
          </div>
        </div>
      </div>

      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col bg-[#001F3F] border-white/20 text-white">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Selecionar Fotos Existentes</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowGallery(false)}>
                &times;
              </Button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {availablePhotos.length === 0 ? (
                <p className="col-span-full text-center text-white/50 py-10">Não há outras fotos disponíveis para adicionar.</p>
              ) : (
                availablePhotos.map(p => (
                  <div key={p.id} className="relative group rounded-lg overflow-hidden aspect-square border border-white/10 cursor-pointer" onClick={() => handleAddExisting(p.id)}>
                    <img src={p.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Plus className="text-white w-8 h-8" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="relative group overflow-hidden aspect-square bg-white/5 border-white/10 rounded-xl">
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeletePhoto(photo.id)}
                className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-red-500 hover:text-red-400 hover:bg-transparent shadow-none"
              >
                <Trash2 className="h-8 w-8" />
              </Button>
            </div>
          </Card>
        ))}
        {photos.length === 0 && (
          <div className="col-span-full text-center py-20 text-white/50 border border-dashed border-white/20 rounded-xl bg-white/5 flex flex-col items-center justify-center gap-4">
            <UploadCloud className="h-10 w-10 text-white/30" />
            <p>Nenhuma foto neste álbum.</p>
          </div>
        )}
      </div>

      <AlertDialog open={photoToRemove !== null} onOpenChange={(open) => !open && setPhotoToRemove(null)}>
        <AlertDialogContent className="bg-[#001F3F] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Foto do Álbum</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Tem certeza que deseja remover esta foto deste álbum? A foto continuará salva na galeria global.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePhoto} className="bg-red-600 hover:bg-red-700 text-white">
              Sim, remover foto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
