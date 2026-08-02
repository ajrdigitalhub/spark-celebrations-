import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  date,
  varchar,
} from 'drizzle-orm/pg-core';

// ─────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  features: text('features').array(),
  price: text('price'),
  imageUrl: text('image_url'),
  galleryUrls: text('gallery_urls').array(),
  isActive: boolean('is_active').default(true).notNull(),
  bookingEnabled: boolean('booking_enabled').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// Gallery
// ─────────────────────────────────────────────
export const gallery = pgTable('gallery', {
  id: uuid('id').primaryKey().defaultRandom(),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  category: varchar('category', { length: 100 }).default('general').notNull(),
  caption: text('caption'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// Bookings
// ─────────────────────────────────────────────
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerName: text('customer_name').notNull(),
  mobile: varchar('mobile', { length: 20 }).notNull(),
  serviceName: text('service_name').notNull(),
  eventDate: date('event_date').notNull(),
  preferredTime: varchar('preferred_time', { length: 50 }),
  notes: text('notes'),
  selectedAddons: jsonb('selected_addons'),
  status: varchar('status', { length: 30 }).default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// Testimonials
// ─────────────────────────────────────────────
export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerName: text('customer_name').notNull(),
  review: text('review').notNull(),
  rating: integer('rating').default(5).notNull(),
  photoUrl: text('photo_url'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// Flipbook
// ─────────────────────────────────────────────
export const flipbook = pgTable('flipbook', {
  id: uuid('id').primaryKey().defaultRandom(),
  coverImage: text('cover_image'),
  backCoverImage: text('back_cover_image'),
  images: jsonb('images').$type<string[]>().default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// Site Settings (key-value store)
// ─────────────────────────────────────────────
export const siteSettings = pgTable('site_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// Hero Items
// ─────────────────────────────────────────────
export const heroItems = pgTable('hero_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  mediaUrl: text('media_url').notNull(),
  mediaType: varchar('media_type', { length: 20 }).default('image').notNull(),
  caption: text('caption'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// Add-ons
// ─────────────────────────────────────────────
export const addons = pgTable('addons', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  price: text('price'), // Storing as text to support "From ₹500" or custom strings
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

