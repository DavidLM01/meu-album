import { createFileRoute, Link } from '@tanstack/react-router'
import { getAlbumById, getPhotosByAlbumId } from '../../features/albums/albums.ts'
import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Play } from 'lucide-react'

export const Route = createFileRoute('/album/$albumId')({
  loader: async ({ params }) => {
    const albumId = parseInt(params.albumId, 10)
    const [album, photos] = await Promise.all([
      getAlbumById({ data: albumId }),
      getPhotosByAlbumId({ data: albumId }),
    ])
    if (!album) throw new Error('Álbum não encontrado')
    return { album, photos }
  },
  component: AlbumGallery,
})

function AlbumGallery() {
  const { album, photos } = Route.useLoaderData()
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#000D1A] text-white selection:bg-white/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#000D1A]/60 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <Link to="/">
          <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full pl-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-lg font-bold tracking-tight absolute left-1/2 -translate-x-1/2">
          {album.title}
        </h1>
        <Link to={`/slideshow/${album.id}`}>
          <Button className="bg-white text-black hover:bg-neutral-200 rounded-full">
            <Play className="w-4 h-4 mr-2" />
            Apresentar
          </Button>
        </Link>
      </header>

      {/* Gallery Grid (Masonry effect using Tailwind columns) */}
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <div className="columns-2 md:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="break-inside-avoid rounded-xl overflow-hidden cursor-zoom-in group"
              onClick={() => setSelectedPhoto(photo.url)}
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        
        {photos.length === 0 && (
          <div className="text-center text-neutral-500 py-32">
            Nenhuma foto disponível neste álbum.
          </div>
        )}
      </main>

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-[#000D1A]/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setSelectedPhoto(null)}
        >
          <img 
            src={selectedPhoto} 
            alt="Fullscreen" 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
          />
        </div>
      )}
    </div>
  )
}
