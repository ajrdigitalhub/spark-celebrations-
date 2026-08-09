import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen pt-32 pb-24 flex items-center justify-center">
      <div class="text-center animate-fade-in-up">
        <h1 class="text-4xl md:text-5xl font-heading font-bold text-white mb-6">Upcoming Events</h1>
        <p class="text-text-secondary text-lg max-w-2xl mx-auto">
          We are currently updating our events calendar. Stay tuned for exciting new announcements!
        </p>
      </div>
    </div>
  `
})
export class EventsComponent {}
