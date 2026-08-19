import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db/index.ts'
import { albums, photos, albumPhotos } from '../../db/schema.ts'
import { eq, desc, and, notInArray } from 'drizzle-orm'
import { checkAuth } from '../auth/auth.ts'

export const getAlbums = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.select().from(albums).orderBy(desc(albums.createdAt))
})

export const getAlbumById = createServerFn({ method: 'GET' })
  .validator((id: number) => id)
  .handler(async ({ data }) => {
    const albumList = await db.select().from(albums).where(eq(albums.id, data))
    return albumList[0] || null
  })

export const getPhotosByAlbumId = createServerFn({ method: 'GET' })
  .validator((albumId: number) => albumId)
  .handler(async ({ data }) => {
    const results = await db
      .select({
        id: photos.id,
        url: photos.url,
        createdAt: photos.createdAt,
      })
      .from(photos)
      .innerJoin(albumPhotos, eq(photos.id, albumPhotos.photoId))
      .where(eq(albumPhotos.albumId, data))
      .orderBy(desc(photos.createdAt))

    return results
  })

export const getAllPhotos = createServerFn({ method: 'GET' }).handler(async () => {
  return await db.select().from(photos).orderBy(desc(photos.createdAt))
})

export const getPhotosNotInAlbum = createServerFn({ method: 'GET' })
  .validator((albumId: number) => albumId)
  .handler(async ({ data }) => {
    // Pegar IDs das fotos que JÁ estão neste álbum
    const existingLinks = await db
      .select({ photoId: albumPhotos.photoId })
      .from(albumPhotos)
      .where(eq(albumPhotos.albumId, data))

    const existingPhotoIds = existingLinks.map(l => l.photoId)

    // Buscar fotos que não estão na lista
    if (existingPhotoIds.length > 0) {
      return await db
        .select()
        .from(photos)
        .where(notInArray(photos.id, existingPhotoIds))
        .orderBy(desc(photos.createdAt))
    }

    // Se nenhuma foto estiver no álbum, retorna todas
    return await db.select().from(photos).orderBy(desc(photos.createdAt))
  })

export const createAlbum = createServerFn({ method: 'POST' })
  .validator(
    (d: { title: string; description: string; coverUrl?: string }) => d,
  )
  .handler(async ({ data }) => {
    const auth = await checkAuth()
    if (!auth.isAuthenticated) throw new Error('Unauthorized')

    const newAlbum = await db
      .insert(albums)
      .values({
        title: data.title,
        description: data.description,
        coverUrl: data.coverUrl,
      })
      .returning()
    return newAlbum[0]
  })

export const deleteAlbum = createServerFn({ method: 'POST' })
  .validator((id: number) => id)
  .handler(async ({ data }) => {
    const auth = await checkAuth()
    if (!auth.isAuthenticated) throw new Error('Unauthorized')

    await db.delete(albums).where(eq(albums.id, data))
    return { success: true }
  })
