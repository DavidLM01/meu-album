import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const albums = sqliteTable('albums', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  title: text().notNull(),
  description: text(),
  coverUrl: text('cover_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})

export const photos = sqliteTable('photos', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  name: text('name'),
  url: text().notNull(),
  vercelBlobUrl: text('vercel_blob_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})

export const albumPhotos = sqliteTable('album_photos', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  albumId: integer('album_id')
    .notNull()
    .references(() => albums.id, { onDelete: 'cascade' }),
  photoId: integer('photo_id')
    .notNull()
    .references(() => photos.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})

