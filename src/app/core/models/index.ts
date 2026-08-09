export interface HeroItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SparkService {
  id: string;
  title: string;
  description: string | null;
  features: string[] | null;
  price: string | null;
  imageUrl: string | null;
  galleryUrls: string[] | null;
  availableVenues: string[] | null;
  isActive: boolean;
  bookingEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Addon {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  customerName: string;
  mobile: string;
  serviceName: string;
  eventDate: string;
  preferredTime: string | null;
  notes: string | null;
  selectedAddons: string[] | null;
  status: 'pending' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  category: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  review: string;
  rating: number;
  photoUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Flipbook {
  id: string;
  coverImage?: string;
  backCoverImage?: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  general: {
    siteName: string;
    tagline: string;
    logoUrl: string;
    heroType: 'image' | 'video' | 'animated';
    heroImageUrl: string;
    heroVideoUrl: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    mapEmbedUrl: string;
  };
  whatsapp: {
    number: string;
    countryCode: string;
    messageTemplate: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImageUrl: string;
  };
  footer: {
    copyright: string;
    socialMedia: {
      instagram: string;
      facebook: string;
      youtube: string;
      twitter: string;
    };
    quickLinks: { label: string; url: string }[];
    policies: { label: string; url: string }[];
  };
}

export interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}
