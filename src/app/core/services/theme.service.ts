import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  
  // Default to true (dark theme)
  isDarkTheme = signal<boolean>(true);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
    }

    // Effect to update the DOM and localStorage whenever the signal changes
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const isDark = this.isDarkTheme();
        localStorage.setItem('spark-theme', isDark ? 'dark' : 'light');
        
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    });
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('spark-theme');
    
    // If user has a saved preference, use it
    if (savedTheme) {
      this.isDarkTheme.set(savedTheme === 'dark');
    } else {
      // Check system preference if no saved theme, otherwise default dark
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      // We still default to dark since it's a premium luxury site, 
      // but you can uncomment this if you want to respect system preference:
      // this.isDarkTheme.set(!prefersLight);
      this.isDarkTheme.set(true); 
    }
  }

  toggleTheme() {
    this.isDarkTheme.update(dark => !dark);
  }
}
