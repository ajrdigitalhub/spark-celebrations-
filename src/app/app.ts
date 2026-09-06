import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LenisService } from './core/services/lenis.service';
import { GsapService } from './core/services/gsap.service';
import { LoaderComponent } from './shared/components/loader/loader';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent],
  template: `
    <app-loader />
    <div class="grain-overlay">
      <router-outlet />
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private lenis = inject(LenisService);
  private gsap = inject(GsapService);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      await this.gsap.init();
      
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(async (event: any) => {
        if (event.urlAfterRedirects.startsWith('/admin')) {
          this.lenis.destroy();
        } else {
          await this.lenis.init();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.lenis.destroy();
    this.gsap.killAll();
  }
}
