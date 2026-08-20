import { createFileRoute, Link } from '@tanstack/react-router'
import { getAlbumById, getPhotosByAlbumId } from '../../features/albums/albums.ts'
import { useState, useEffect, useRef } from 'react'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Play, ChevronLeft, ChevronRight, X } from 'lucide-react'

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
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const minSwipeDistance = 50

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedPhotoIndex === null) return
      if (e.key === 'Escape') setSelectedPhotoIndex(null)
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhotoIndex])

  const handlePrev = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) => (prev! > 0 ? prev! - 1 : photos.length - 1))
    }
  }

  const handleNext = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) => (prev! < photos.length - 1 ? prev! + 1 : 0))
    }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) handleNext()
    if (isRightSwipe) handlePrev()
  }

  return (
    <div className="min-h-screen bg-[#000D1A] text-white selection:bg-white/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#000D1A]/60 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link to="/" hash="albums">
          <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full sm:pl-2 px-2 sm:px-4">
            <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        </Link>
        <h1 className="text-base sm:text-lg font-bold tracking-tight absolute left-1/2 -translate-x-1/2 truncate max-w-[50%] text-center">
          {album.title}
        </h1>
        <Link to={`/slideshow/${album.id}`}>
          <Button className="bg-white text-black hover:bg-neutral-200 rounded-full px-2 sm:px-4">
            <Play className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2 fill-current" />
            <span className="hidden sm:inline">Apresentar</span>
          </Button>
        </Link>
      </header>

      {/* Gallery Grid (Masonry effect using Tailwind columns) */}
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <div className="columns-2 md:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
          {photos.map((photo, index) => (
            <div 
              key={photo.id} 
              className="break-inside-avoid rounded-xl overflow-hidden cursor-zoom-in group"
              onClick={() => setSelectedPhotoIndex(index)}
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
      {selectedPhotoIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-[#000D1A]/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedPhotoIndex(null)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Top-right controls */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 sm:gap-4 z-50">
            {/* Play button (Slideshow) - Hidden on mobile, visible on sm and up */}
            <Link 
              to={`/slideshow/${album.id}`}
              className="hidden sm:flex p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              title="Iniciar Apresentação"
            >
              <Play className="w-6 h-6 fill-current" />
            </Link>

            {/* Close button */}
            <button 
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedPhotoIndex(null) }}
              title="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Previous button */}
          {photos.length > 1 && (
            <button 
              className="hidden sm:block absolute left-4 sm:left-8 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-50 backdrop-blur-md"
              onClick={(e) => { e.stopPropagation(); handlePrev() }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Photo */}
          <img 
            src={photos[selectedPhotoIndex].url} 
            alt="Fullscreen" 
            className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm select-none"
            onClick={(e) => e.stopPropagation()} // Prevent clicking the image from closing
          />

          {/* Next button */}
          {photos.length > 1 && (
            <button 
              className="hidden sm:block absolute right-4 sm:right-8 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-50 backdrop-blur-md"
              onClick={(e) => { e.stopPropagation(); handleNext() }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
