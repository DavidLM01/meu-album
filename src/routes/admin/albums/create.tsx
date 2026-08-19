import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { createAlbum } from '../../../features/albums/albums.ts'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/albums/create')({
  component: CreateAlbum,
})

function CreateAlbum() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const create = useServerFn(createAlbum)
  const navigate = useNavigate()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await create({ data: { title, description, coverUrl } })
    if (result) {
      router.invalidate().then(() => {
        navigate({ to: `/admin/albums/${result.id}` })
      })
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/admin">
          <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full pl-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Álbuns
          </Button>
        </Link>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Criar Novo Álbum</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-black/20 border-white/10 placeholder:text-white/40 focus-visible:ring-white/40"
                placeholder="Ex: Formatura Engenharia"
                required
              />
            </div>
        
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-black/20 border-white/10 placeholder:text-white/40 focus-visible:ring-white/40 min-h-[120px]"
                placeholder="Uma breve descrição sobre o evento..."
              />
            </div>
        
            <div className="space-y-2">
              <Label htmlFor="coverUrl">URL da Capa (opcional)</Label>
              <Input
                id="coverUrl"
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="bg-black/20 border-white/10 placeholder:text-white/40 focus-visible:ring-white/40"
                placeholder="https://..."
              />
            </div>

            <Button
              type="submit"
              className="bg-white text-black font-semibold hover:bg-neutral-200 self-start mt-2"
            >
              Criar Álbum
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
