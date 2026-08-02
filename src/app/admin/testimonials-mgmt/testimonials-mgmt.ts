import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Testimonial } from '../../core/models/index';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-testimonials-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-heading font-semibold">Testimonials</h1>
        <button class="btn-primary !py-2.5 !px-5 !text-sm !rounded-xl" (click)="openForm()">
          <span>+ Add Testimonial</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (t of testimonials(); track t.id) {
          <div class="glass p-6 rounded-xl relative group">
            <div class="flex items-center gap-1 mb-3">
              @for (s of getStars(t.rating); track $index) {
                <app-icon name="star" [size]="14" class="text-accent"></app-icon>
              }
            </div>
            <p class="text-text-secondary text-sm mb-4 line-clamp-3">{{ t.review }}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-accent-subtle flex items-center justify-center text-accent text-xs font-semibold">
                  {{ t.customerName.charAt(0) }}
                </div>
                <span class="text-sm text-text-primary">{{ t.customerName }}</span>
              </div>
              @if (t.isFeatured) {
                <span class="px-2 py-0.5 bg-accent-subtle text-accent text-xs rounded-full">Featured</span>
              }
            </div>
            <!-- Actions -->
            <div class="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="px-2 py-1 bg-bg-elevated rounded text-xs text-text-secondary hover:text-accent" (click)="editTestimonial(t)">Edit</button>
              <button class="px-2 py-1 bg-bg-elevated rounded text-xs text-text-secondary hover:text-error" (click)="deleteTestimonial(t)">Del</button>
            </div>
          </div>
        }
      </div>

      @if (testimonials().length === 0) {
        <div class="text-center py-20 text-text-muted">
          <div class="flex justify-center mb-4"><app-icon name="star" [size]="64"></app-icon></div>
          <h3 class="text-lg font-heading font-semibold mb-2 text-text-primary">No testimonials yet</h3>
          <p class="text-sm">Add customer reviews to display on your website</p>
        </div>
      }

      <!-- Form Modal -->
      @if (formOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center" (click)="closeForm()">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative w-full max-w-md bg-bg-surface border border-border rounded-2xl p-8" (click)="$event.stopPropagation()">
            <h3 class="text-xl font-heading font-semibold mb-6">{{ editing() ? 'Edit' : 'Add' }} Testimonial</h3>
            <form (ngSubmit)="save()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1.5">Customer Name *</label>
                <input type="text" [(ngModel)]="form.customerName" name="name" required class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1.5">Review *</label>
                <textarea [(ngModel)]="form.review" name="review" rows="3" required class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all resize-none"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-text-secondary mb-1.5">Rating (1-5)</label>
                <select [(ngModel)]="form.rating" name="rating" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all">
                  @for (r of [5,4,3,2,1]; track r) {
                    <option [value]="r">{{ r }} Stars</option>
                  }
                </select>
              </div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="form.isFeatured" name="featured" class="w-4 h-4 accent-accent" />
                <span class="text-sm text-text-secondary">Featured on homepage</span>
              </label>
              <div class="flex gap-3 mt-6">
                <button type="button" class="btn-ghost flex-1 !rounded-xl" (click)="closeForm()">Cancel</button>
                <button type="submit" class="btn-primary flex-1 !rounded-xl"><span>Save</span></button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  `,
})
export class TestimonialsMgmtComponent implements OnInit {
  private api = inject(ApiService);

  testimonials = signal<Testimonial[]>([]);
  formOpen = signal(false);
  editing = signal(false);
  editId = '';

  form = { customerName: '', review: '', rating: 5, isFeatured: false };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getTestimonials().subscribe({ next: (d) => this.testimonials.set(d) });
  }

  openForm(): void {
    this.editing.set(false);
    this.form = { customerName: '', review: '', rating: 5, isFeatured: false };
    this.formOpen.set(true);
  }

  editTestimonial(t: Testimonial): void {
    this.editing.set(true);
    this.editId = t.id;
    this.form = { customerName: t.customerName, review: t.review, rating: t.rating, isFeatured: t.isFeatured };
    this.formOpen.set(true);
  }

  closeForm(): void { this.formOpen.set(false); }

  save(): void {
    if (!this.form.customerName || !this.form.review) return;
    const data: Partial<Testimonial> = { ...this.form, rating: Number(this.form.rating) };
    const obs = this.editing()
      ? this.api.updateTestimonial(this.editId, data)
      : this.api.createTestimonial(data);
    obs.subscribe({ next: () => { this.closeForm(); this.load(); } });
  }

  deleteTestimonial(t: Testimonial): void {
    if (confirm(`Delete review by "${t.customerName}"?`)) {
      this.api.deleteTestimonial(t.id).subscribe({ next: () => this.load() });
    }
  }

  getStars(n: number): number[] { return Array.from({ length: n }, (_, i) => i); }
}
