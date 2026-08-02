import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-heading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center mb-12 lg:mb-16">
      @if (badge) {
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-subtle border border-accent-border rounded-full text-accent text-xs font-semibold uppercase tracking-widest mb-5">
          <span class="w-1.5 h-1.5 rounded-full bg-accent"></span>
          {{ badge }}
        </div>
      }
      <h2 class="font-heading font-semibold leading-tight">
        {{ title }}
        @if (highlight) {
          <span class="text-gradient-gold"> {{ highlight }}</span>
        }
      </h2>
      @if (subtitle) {
        <p class="mt-4 max-w-2xl mx-auto text-text-secondary text-lg">
          {{ subtitle }}
        </p>
      }
    </div>
  `,
})
export class SectionHeadingComponent {
  @Input() badge = '';
  @Input() title = '';
  @Input() highlight = '';
  @Input() subtitle = '';
}
