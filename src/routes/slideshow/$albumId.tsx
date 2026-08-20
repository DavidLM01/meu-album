import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { getPhotosByAlbumId, getAllPhotos } from '../../features/albums/albums.ts'
import { useState, useEffect, useRef } from 'react'
import { Button } from '../../components/ui/button'
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react'

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

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const minSwipeDistance = 50

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
    <div 
      className="min-h-screen bg-[#000D1A] overflow-hidden relative group"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
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

      {/* Controls Overlay (always visible on mobile, hover on desktop) */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
        {/* Close button (top right, identical to lightbox) */}
        <Link 
          to={albumId === 'all' ? '/photos' : `/album/${albumId}`}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto"
        >
          <X className="w-6 h-6" />
        </Link>
      </div>

      {/* Player Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 hidden sm:flex gap-4 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-1 sm:gap-2 max-w-[90%] overflow-hidden">
        {photos.map((_, index) => (
          <div
            key={index}
            className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 flex-shrink-0 ${
              index === currentIndex ? 'w-4 sm:w-8 bg-white' : 'w-1 sm:w-2 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
