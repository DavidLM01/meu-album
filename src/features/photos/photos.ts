import { createServerFn } from '@tanstack/react-start'
import { put, del } from '@vercel/blob'
import { db } from '../../db/index.ts'
import { photos, albumPhotos } from '../../db/schema.ts'
import { checkAuth } from '../auth/auth.ts'
import { eq, and } from 'drizzle-orm'

export const uploadPhoto = createServerFn({ method: 'POST' })
  .validator((d: FormData) => d)
  .handler(async ({ data }) => {
    const auth = await checkAuth()
    if (!auth.isAuthenticated) throw new Error('Unauthorized')

    const file = data.get('file') as File
    const albumIdStr = data.get('albumId') as string
    if (!file || !albumIdStr) {
      throw new Error('File and AlbumId are required')
    }

    const albumId = parseInt(albumIdStr, 10)

    // Check if photo with same name already exists
    const existingPhoto = await db.select().from(photos).where(eq(photos.name, file.name))
    if (existingPhoto.length > 0) {
      throw new Error('Esta foto já foi adicionada.')
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    // Save in database
    const newPhoto = await db
      .insert(photos)
      .values({
        name: file.name,
        url: blob.url,
        vercelBlobUrl: blob.url,
      })
      .returning()

    if (albumId && albumId > 0) {
      await db.insert(albumPhotos).values({
        albumId,
        photoId: newPhoto[0].id
      })
    }

    return newPhoto[0]
  })

export const removePhotoFromAlbum = createServerFn({ method: 'POST' })
  .validator((d: { albumId: number; photoId: number }) => d)
  .handler(async ({ data }) => {
    const auth = await checkAuth()
    if (!auth.isAuthenticated) throw new Error('Unauthorized')

    await db.delete(albumPhotos).where(
      and(
        eq(albumPhotos.albumId, data.albumId),
        eq(albumPhotos.photoId, data.photoId)
      )
    )
    return { success: true }
  })

export const addExistingPhotoToAlbum = createServerFn({ method: 'POST' })
  .validator((d: { albumId: number; photoId: number }) => d)
  .handler(async ({ data }) => {
    const auth = await checkAuth()
    if (!auth.isAuthenticated) throw new Error('Unauthorized')
    
    // Check if link already exists
    const existing = await db.select().from(albumPhotos).where(
      and(
        eq(albumPhotos.albumId, data.albumId),
        eq(albumPhotos.photoId, data.photoId)
      )
    )

    if (existing.length === 0) {
      await db.insert(albumPhotos).values({
        albumId: data.albumId,
        photoId: data.photoId
      })
    }
    
    return { success: true }
  })

export const deleteGlobalPhoto = createServerFn({ method: 'POST' })
  .validator((photoId: number) => photoId)
  .handler(async ({ data }) => {
    const auth = await checkAuth()
    if (!auth.isAuthenticated) throw new Error('Unauthorized')

    const photoList = await db.select().from(photos).where(eq(photos.id, data))
    const photo = photoList[0]

    if (photo && photo.url) {
      try {
        await del(photo.url, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
      } catch (err) {
        console.error('Erro ao excluir do Vercel Blob:', err)
      }
    }

    await db.delete(photos).where(eq(photos.id, data))
    return { success: true }
  })
