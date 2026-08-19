import { createFileRoute, Link } from '@tanstack/react-router'
import { getAlbums, getPhotosByAlbumId, getAllPhotos } from '../features/albums/albums.ts'
import { Images } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useServerFn } from '@tanstack/react-start'

export const Route = createFileRoute('/')({
  loader: async () => {
    const albums = await getAlbums()
    return { albums }
  },
  component: Home,
})

function Home() {
  const { albums } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-[#000D1A] text-white selection:bg-[#D4AF37]/30">

      {/* Hero Section with Beautiful Glow */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden min-h-screen flex flex-col justify-center border-b border-white/5">

        {/* Animated Glow Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {/* Base deep blue glow */}
          <div className="absolute w-[800px] h-[600px] bg-[#001F3F] rounded-full blur-[120px] opacity-50 animate-pulse" style={{ animationDuration: '4s' }} />
          {/* Accent gold glow */}
          <div className="absolute w-[400px] h-[400px] bg-[#D4AF37] rounded-full blur-[150px] opacity-20 animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 drop-shadow-2xl">
            Momentos Inesquecíveis
          </h1>
          <p className="text-xl text-neutral-300 font-light max-w-2xl mx-auto mb-10 drop-shadow-lg">
            Uma coleção das minhas memórias de formatura.
          </p>

          <a
            href="#albums"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-[#000D1A] font-medium text-lg hover:bg-neutral-200 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
          >
            Explorar Álbuns
          </a>
        </div>
      </div>

      {/* Albums Grid */}
      <div id="albums" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card Todas as Fotos */}
          <Link
            to="/photos"
            className="group relative block rounded-2xl overflow-hidden aspect-[4/5] glass-panel border border-white/10 hover:border-white/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/10"
          >
            <AllPhotosCover />
            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 z-10">
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Todas as Fotos
              </h3>
              <p className="text-neutral-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                Ver todo o acervo de memórias
              </p>
            </div>
          </Link>

          {albums.map((album) => (
            <Link
              key={album.id}
              to={`/album/${album.id}`}
              className="group relative block rounded-2xl overflow-hidden aspect-[4/5] glass-panel border border-white/10 hover:border-white/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl"
            >
              <AlbumCover albumId={album.id} fallbackUrl={album.coverUrl} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000D1A]/80 via-[#000D1A]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                  {album.title}
                </h3>
                <p className="text-neutral-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {album.description}
                </p>
              </div>
            </Link>
          ))}
          {albums.length === 0 && (
            <div className="col-span-full text-center text-neutral-500 py-20 border border-white/10 rounded-2xl glass-panel">
              Nenhum álbum foi publicado ainda.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-neutral-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Meu Álbum. Todos os direitos reservados.</p>
        <Link to="/admin" className="hover:text-white transition mt-4 inline-block">Área Restrita</Link>
      </footer>
    </div>
  )
}

function AlbumCover({ albumId, fallbackUrl }: { albumId: number, fallbackUrl?: string | null }) {
  const [photos, setPhotos] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const getPhotos = useServerFn(getPhotosByAlbumId)
  
  useEffect(() => {
    getPhotos({ data: albumId }).then(res => {
       if (res.length > 0) {
          setPhotos(res.map(r => r.url).sort(() => Math.random() - 0.5))
       }
    })
  }, [albumId, getPhotos])

  useEffect(() => {
    if (photos.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % photos.length)
    }, 5000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [photos])

  const url = photos.length > 0 ? photos[currentIdx] : fallbackUrl
  if (!url) return null

  return (
    <img
      src={url}
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
    />
  )
}

function AllPhotosCover() {
  const [photos, setPhotos] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const getPhotos = useServerFn(getAllPhotos)
  
  useEffect(() => {
    getPhotos().then(res => {
       if (res.length > 0) {
          setPhotos(res.map(r => r.url).sort(() => Math.random() - 0.5))
       }
    })
  }, [getPhotos])

  useEffect(() => {
    if (photos.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % photos.length)
    }, 6000) 
    return () => clearInterval(interval)
  }, [photos])

  const url = photos.length > 0 ? photos[currentIdx] : null

  return (
    <>
       {url && (
          <img src={url} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-1000" />
       )}
       <div className="absolute inset-0 bg-gradient-to-t from-[#000D1A]/80 via-[#000D1A]/20 to-transparent z-0" />
    </>
  )
}

