import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SiteSettings } from '../../core/models/index';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div>
      <h1 class="text-2xl font-heading font-semibold mb-6">Settings</h1>

      <!-- Tabs -->
      <div class="flex gap-2 mb-8 overflow-x-auto pb-2">
        @for (tab of tabs; track tab.key) {
          <button
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap"
            [class]="activeTab() === tab.key
              ? 'bg-accent text-bg-primary'
              : 'bg-bg-elevated border border-border text-text-secondary hover:text-accent'"
            (click)="activeTab.set(tab.key)"
          >
            <app-icon [name]="tab.iconName" [size]="16" class="mr-1"></app-icon> {{ tab.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="glass p-8 rounded-xl"><div class="h-64 skeleton rounded-xl"></div></div>
      }

      <!-- General Settings -->
      @if (activeTab() === 'general' && !loading()) {
        <div class="glass p-8 rounded-xl space-y-5">
          <h3 class="font-heading font-semibold mb-4">General Settings</h3>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Site Name</label>
            <input type="text" [(ngModel)]="general.siteName" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Tagline</label>
            <input type="text" [(ngModel)]="general.tagline" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Hero Background Type</label>
            <select [(ngModel)]="general.heroType" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all">
              <option value="animated">Animated (Default)</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          <button class="btn-primary !rounded-xl" (click)="saveGeneral()"><span>{{ saving() ? 'Saving...' : 'Save Changes' }}</span></button>
        </div>
      }

      <!-- Contact Settings -->
      @if (activeTab() === 'contact' && !loading()) {
        <div class="glass p-8 rounded-xl space-y-5">
          <h3 class="font-heading font-semibold mb-4">Contact Information</h3>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Phone</label>
            <input type="text" [(ngModel)]="contact.phone" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <input type="email" [(ngModel)]="contact.email" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Address</label>
            <input type="text" [(ngModel)]="contact.address" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Google Maps Embed URL</label>
            <input type="text" [(ngModel)]="contact.mapEmbedUrl" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" placeholder="https://www.google.com/maps/embed?..." />
          </div>
          <button class="btn-primary !rounded-xl" (click)="saveContact()"><span>{{ saving() ? 'Saving...' : 'Save Changes' }}</span></button>
        </div>
      }

      <!-- WhatsApp Settings -->
      @if (activeTab() === 'whatsapp' && !loading()) {
        <div class="glass p-8 rounded-xl space-y-5">
          <h3 class="font-heading font-semibold mb-4">WhatsApp Configuration</h3>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Admin Number (with country code, no +)</label>
            <input type="text" [(ngModel)]="whatsapp.number" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" placeholder="919990863647" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Country Code</label>
            <input type="text" [(ngModel)]="whatsapp.countryCode" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" placeholder="+91" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Message Template</label>
            <textarea [(ngModel)]="whatsapp.messageTemplate" rows="5" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all resize-none font-mono text-sm"></textarea>
            <p class="text-text-muted text-xs mt-1">Variables: &#123;serviceName&#125;, &#123;customerName&#125;, &#123;mobile&#125;, &#123;eventDate&#125;, &#123;preferredTime&#125;, &#123;notes&#125;</p>
          </div>
          <button class="btn-primary !rounded-xl" (click)="saveWhatsapp()"><span>{{ saving() ? 'Saving...' : 'Save Changes' }}</span></button>
        </div>
      }

      <!-- SEO Settings -->
      @if (activeTab() === 'seo' && !loading()) {
        <div class="glass p-8 rounded-xl space-y-5">
          <h3 class="font-heading font-semibold mb-4">SEO Configuration</h3>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Meta Title</label>
            <input type="text" [(ngModel)]="seoSettings.metaTitle" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Meta Description</label>
            <textarea [(ngModel)]="seoSettings.metaDescription" rows="3" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all resize-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Keywords</label>
            <input type="text" [(ngModel)]="seoSettings.keywords" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
          </div>
          <button class="btn-primary !rounded-xl" (click)="saveSeo()"><span>{{ saving() ? 'Saving...' : 'Save Changes' }}</span></button>
        </div>
      }

      <!-- Footer Settings -->
      @if (activeTab() === 'footer' && !loading()) {
        <div class="glass p-8 rounded-xl space-y-5">
          <h3 class="font-heading font-semibold mb-4">Footer Configuration</h3>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Copyright Text</label>
            <input type="text" [(ngModel)]="footerSettings.copyright" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Instagram URL</label>
            <input type="text" [(ngModel)]="footerSettings.socialMedia.instagram" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">Facebook URL</label>
            <input type="text" [(ngModel)]="footerSettings.socialMedia.facebook" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1.5">YouTube URL</label>
            <input type="text" [(ngModel)]="footerSettings.socialMedia.youtube" class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-text-primary focus:border-accent-border focus:outline-none transition-all" />
          </div>
          <button class="btn-primary !rounded-xl" (click)="saveFooter()"><span>{{ saving() ? 'Saving...' : 'Save Changes' }}</span></button>
        </div>
      }

      @if (saved()) {
        <div class="fixed bottom-6 right-6 bg-success/90 text-white px-4 py-2 rounded-xl text-sm font-medium animate-fade-in-up z-50 flex items-center gap-2">
          <app-icon name="check" [size]="16"></app-icon> Settings saved successfully!
        </div>
      }
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  private api = inject(ApiService);

  activeTab = signal('general');
  loading = signal(true);
  saving = signal(false);
  saved = signal(false);

  tabs = [
    { key: 'general', label: 'General', iconName: 'settings' },
    { key: 'contact', label: 'Contact', iconName: 'phone' },
    { key: 'whatsapp', label: 'WhatsApp', iconName: 'whatsapp' },
    { key: 'seo', label: 'SEO', iconName: 'search' },
    { key: 'footer', label: 'Footer', iconName: 'link' },
  ];

  general = { siteName: '', tagline: '', logoUrl: '', heroType: 'animated' as string, heroImageUrl: '', heroVideoUrl: '' };
  contact = { phone: '', email: '', address: '', mapEmbedUrl: '' };
  whatsapp = { number: '', countryCode: '', messageTemplate: '' };
  seoSettings = { metaTitle: '', metaDescription: '', keywords: '', ogImageUrl: '' };
  footerSettings = { copyright: '', socialMedia: { instagram: '', facebook: '', youtube: '', twitter: '' }, quickLinks: [] as any[], policies: [] as any[] };

  ngOnInit(): void {
    this.api.getSettings().subscribe({
      next: (s: SiteSettings) => {
        if (s.general) this.general = { ...this.general, ...s.general };
        if (s.contact) this.contact = { ...this.contact, ...s.contact };
        if (s.whatsapp) this.whatsapp = { ...this.whatsapp, ...s.whatsapp };
        if (s.seo) this.seoSettings = { ...this.seoSettings, ...s.seo };
        if (s.footer) this.footerSettings = { ...this.footerSettings, ...s.footer };
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private saveSetting(key: string, value: unknown): void {
    this.saving.set(true);
    this.api.updateSetting(key, value).subscribe({
      next: () => { this.saving.set(false); this.showSaved(); },
      error: () => this.saving.set(false),
    });
  }

  saveGeneral(): void { this.saveSetting('general', this.general); }
  saveContact(): void { this.saveSetting('contact', this.contact); }
  saveWhatsapp(): void { this.saveSetting('whatsapp', this.whatsapp); }
  saveSeo(): void { this.saveSetting('seo', this.seoSettings); }
  saveFooter(): void { this.saveSetting('footer', this.footerSettings); }

  private showSaved(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}
