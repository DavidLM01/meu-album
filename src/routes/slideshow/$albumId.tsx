import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { getPhotosByAlbumId, getAllPhotos } from '../../features/albums/albums.ts'
import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

export const Route = createFileRoute('/slideshow/$albumId')({
  loader: async ({ params }) => {
    if (params.albumId === 'all') {
      const photos = await getAllPhotos()
      return { photos }
    }
    const albumId = parseInt(params.albumId, 10)
    const photos = await getPhotosByAlbumId({ data: albumId })
    return { photos }
  },
  component: Slideshow,
})

function Slideshow() {
  const { photos } = Route.useLoaderData()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (photos.length <= 1 || !isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
    }, 10000) // Change photo every 10 seconds

    return () => clearInterval(interval)
  }, [photos, isAutoPlaying])

  const handlePrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const { albumId } = Route.useParams()

  // Press ESC to exit slideshow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate({ to: albumId === 'all' ? '/photos' : `/album/${albumId}` })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, albumId])

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-[#000D1A] flex items-center justify-center text-white">
        <p className="text-xl">Nenhuma foto para exibir no slideshow.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000D1A] overflow-hidden relative group">
      {/* Photos */}
      {photos.map((photo, index) => (
        <img
          key={photo.id}
          src={photo.url}
          alt=""
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}

      {/* Controls Overlay (appears on hover) */}
      <div className="absolute top-0 left-0 right-0 p-6 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-[#000D1A]/80 to-transparent flex justify-between items-center">
        <Link to={Route.useParams().albumId === 'all' ? '/photos' : `/album/${Route.useParams().albumId}`}>
          <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 rounded-full pl-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <p className="text-white font-medium">Modo TV (Pressione ESC para sair)</p>
      </div>

      {/* Player Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex gap-4 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button variant="outline" size="icon" className="rounded-full bg-black/50 border-white/20 text-white hover:bg-white/20" onClick={handlePrev}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button variant="outline" size="icon" className="rounded-full bg-black/50 border-white/20 text-white hover:bg-white/20" onClick={() => setIsAutoPlaying(!isAutoPlaying)}>
          {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <Button variant="outline" size="icon" className="rounded-full bg-black/50 border-white/20 text-white hover:bg-white/20" onClick={handleNext}>
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2">
        {photos.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
