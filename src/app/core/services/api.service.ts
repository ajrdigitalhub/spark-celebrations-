import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  SparkService,
  Booking,
  GalleryImage,
  Testimonial,
  Flipbook,
  SiteSettings,
  UploadResponse,
  HeroItem,
  Addon,
} from '../models/index';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = environment.apiUrl;

  private get authHeaders(): HttpHeaders {
    const token = this.auth.getAccessToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  // ── Services ────────────────────────────────
  getServices(): Observable<SparkService[]> {
    return this.http.get<SparkService[]>(`${this.baseUrl}/services`);
  }

  getAllServices(): Observable<SparkService[]> {
    return this.http.get<SparkService[]>(`${this.baseUrl}/services/all`, {
      headers: this.authHeaders,
    });
  }

  getService(id: string): Observable<SparkService> {
    return this.http.get<SparkService>(`${this.baseUrl}/services/${id}`);
  }

  createService(data: Partial<SparkService>): Observable<SparkService> {
    return this.http.post<SparkService>(`${this.baseUrl}/services`, data, {
      headers: this.authHeaders,
    });
  }

  updateService(id: string, data: Partial<SparkService>): Observable<SparkService> {
    return this.http.put<SparkService>(`${this.baseUrl}/services/${id}`, data, {
      headers: this.authHeaders,
    });
  }

  deleteService(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/services/${id}`, {
      headers: this.authHeaders,
    });
  }

  reorderServices(items: { id: string; sortOrder: number }[]): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/services/reorder`, { items }, {
      headers: this.authHeaders,
    });
  }

  // ── Hero Items ──────────────────────────────
  getHeroItems(): Observable<HeroItem[]> {
    return this.http.get<HeroItem[]>(`${this.baseUrl}/hero`);
  }

  createHeroItem(data: Partial<HeroItem>): Observable<HeroItem> {
    return this.http.post<HeroItem>(`${this.baseUrl}/hero`, data, {
      headers: this.authHeaders,
    });
  }

  updateHeroItem(id: string, data: Partial<HeroItem>): Observable<HeroItem> {
    return this.http.put<HeroItem>(`${this.baseUrl}/hero/${id}`, data, {
      headers: this.authHeaders,
    });
  }

  deleteHeroItem(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/hero/${id}`, {
      headers: this.authHeaders,
    });
  }

  // ── Addons ──────────────────────────────────
  getAddons(admin = false): Observable<Addon[]> {
    const params = admin ? '?admin=true' : '';
    return this.http.get<Addon[]>(`${this.baseUrl}/addons${params}`);
  }

  createAddon(data: Partial<Addon>): Observable<Addon> {
    return this.http.post<Addon>(`${this.baseUrl}/addons`, data, {
      headers: this.authHeaders,
    });
  }

  updateAddon(id: string, data: Partial<Addon>): Observable<Addon> {
    return this.http.put<Addon>(`${this.baseUrl}/addons/${id}`, data, {
      headers: this.authHeaders,
    });
  }

  deleteAddon(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/addons/${id}`, {
      headers: this.authHeaders,
    });
  }

  // ── Gallery ─────────────────────────────────
  getGallery(category?: string): Observable<GalleryImage[]> {
    const params = category && category !== 'all' ? `?category=${category}` : '';
    return this.http.get<GalleryImage[]>(`${this.baseUrl}/gallery${params}`);
  }

  addGalleryImages(images: Partial<GalleryImage>[]): Observable<GalleryImage[]> {
    return this.http.post<GalleryImage[]>(`${this.baseUrl}/gallery`, { images }, {
      headers: this.authHeaders,
    });
  }

  updateGalleryImage(id: string, data: Partial<GalleryImage>): Observable<GalleryImage> {
    return this.http.put<GalleryImage>(`${this.baseUrl}/gallery/${id}`, data, {
      headers: this.authHeaders,
    });
  }

  deleteGalleryImage(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/gallery/${id}`, {
      headers: this.authHeaders,
    });
  }

  // ── Bookings ────────────────────────────────
  submitBooking(data: Partial<Booking>): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings`, data);
  }

  getBookings(status?: string): Observable<Booking[]> {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings${params}`, {
      headers: this.authHeaders,
    });
  }

  updateBookingStatus(id: string, status: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/bookings/${id}`, { status }, {
      headers: this.authHeaders,
    });
  }

  // ── Flipbook ────────────────────────────────
  getFlipbook(): Observable<Flipbook | null> {
    return this.http.get<Flipbook | null>(`${this.baseUrl}/flipbook`);
  }

  uploadFlipbook(images: string[]): Observable<Flipbook> {
    return this.http.post<Flipbook>(`${this.baseUrl}/flipbook`, { images }, {
      headers: this.authHeaders,
    });
  }

  updateFlipbookImages(id: string, images: string[]): Observable<Flipbook> {
    return this.http.put<Flipbook>(`${this.baseUrl}/flipbook/${id}/pages`, { images }, {
      headers: this.authHeaders,
    });
  }

  updateFlipbookCovers(id: string, covers: { coverImage?: string; backCoverImage?: string }): Observable<Flipbook> {
    return this.http.put<Flipbook>(`${this.baseUrl}/flipbook/${id}`, covers, {
      headers: this.authHeaders,
    });
  }

  toggleFlipbook(id: string, isActive: boolean): Observable<Flipbook> {
    return this.http.put<Flipbook>(`${this.baseUrl}/flipbook/${id}`, { isActive }, {
      headers: this.authHeaders,
    });
  }

  deleteFlipbook(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/flipbook/${id}`, {
      headers: this.authHeaders,
    });
  }

  // ── Testimonials ────────────────────────────
  getTestimonials(featured?: boolean): Observable<Testimonial[]> {
    const params = featured ? '?featured=true' : '';
    return this.http.get<Testimonial[]>(`${this.baseUrl}/testimonials${params}`);
  }

  createTestimonial(data: Partial<Testimonial>): Observable<Testimonial> {
    return this.http.post<Testimonial>(`${this.baseUrl}/testimonials`, data, {
      headers: this.authHeaders,
    });
  }

  updateTestimonial(id: string, data: Partial<Testimonial>): Observable<Testimonial> {
    return this.http.put<Testimonial>(`${this.baseUrl}/testimonials/${id}`, data, {
      headers: this.authHeaders,
    });
  }

  deleteTestimonial(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/testimonials/${id}`, {
      headers: this.authHeaders,
    });
  }

  // ── Settings ────────────────────────────────
  getSettings(): Observable<SiteSettings> {
    return this.http.get<SiteSettings>(`${this.baseUrl}/settings`);
  }

  updateSetting(key: string, value: unknown): Observable<any> {
    return this.http.put(`${this.baseUrl}/settings/${key}`, { value }, {
      headers: this.authHeaders,
    });
  }

  // ── Upload ──────────────────────────────────
  uploadFile(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(`${this.baseUrl}/upload`, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.getAccessToken() || ''}`,
      }),
    });
  }

  uploadMultipleFiles(files: File[]): Observable<UploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<UploadResponse[]>(`${this.baseUrl}/upload/multiple`, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.getAccessToken() || ''}`,
      }),
    });
  }

  // ── Helper: Get full image URL ──────────────
  getImageUrl(path: string | null): string {
    if (!path) return '/assets/images/placeholder.jpg';
    if (path.startsWith('http')) return path;
    return `${environment.uploadsBaseUrl}${path}`;
  }
}
