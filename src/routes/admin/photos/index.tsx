import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { getAllPhotos } from '../../../features/albums/albums.ts'
import { Card } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { UploadCloud, Trash2 } from 'lucide-react'
import { Label } from '../../../components/ui/label'
import { uploadPhoto, deleteGlobalPhoto } from '../../../features/photos/photos.ts'
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

export const Route = createFileRoute('/admin/photos/')({
  loader: async () => {
    const photos = await getAllPhotos()
    return { photos }
  },
  component: AdminGlobalPhotos,
})

function AdminGlobalPhotos() {
  const { photos } = Route.useLoaderData()
  const router = useRouter()
  const upload = useServerFn(uploadPhoto)
  const removePhoto = useServerFn(deleteGlobalPhoto)
  
  const [uploading, setUploading] = useState(false)
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
        formData.append('albumId', '0') 
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

  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null)

  const confirmDeletePhoto = async () => {
    if (photoToDelete === null) return
    try {
      await removePhoto({ data: photoToDelete })
      router.invalidate()
      toast.success('Foto excluída permanentemente!')
    } catch (err) {
      toast.error('Erro ao excluir foto')
    } finally {
      setPhotoToDelete(null)
    }
  }

  const handleDeletePhoto = (photoId: number) => {
    setPhotoToDelete(photoId)
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Todas as Fotos</h1>
          <p className="text-white/70 mt-1">Repositório global contendo todas as imagens cadastradas.</p>
        </div>
        
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
            <p>Nenhuma foto armazenada no sistema.</p>
          </div>
        )}
      </div>

      <AlertDialog open={photoToDelete !== null} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
        <AlertDialogContent className="bg-[#001F3F] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Foto Definitivamente?</AlertDialogTitle>
            <AlertDialogDescription className="text-red-400 font-medium">
              Atenção: Esta ação excluirá a foto permanentemente de TODOS os álbuns e do sistema. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePhoto} className="bg-red-600 hover:bg-red-700 text-white">
              Sim, excluir para sempre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
