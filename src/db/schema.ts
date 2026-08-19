import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core'

export const albums = pgTable('albums', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  coverUrl: text('cover_url'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const photos = pgTable('photos', {
  id: serial('id').primaryKey(),
  name: text('name'),
  url: text('url').notNull(),
  vercelBlobUrl: text('vercel_blob_url'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const albumPhotos = pgTable('album_photos', {
  id: serial('id').primaryKey(),
  albumId: integer('album_id')
    .notNull()
    .references(() => albums.id, { onDelete: 'cascade' }),
  photoId: integer('photo_id')
    .notNull()
    .references(() => photos.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
})
