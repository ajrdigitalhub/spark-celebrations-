import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';

@Component({
  selector: 'app-cursor-sparkle',
  standalone: true,
  template: `<canvas #sparkleCanvas class="fixed inset-0 pointer-events-none z-[9999]"></canvas>`
})
export class CursorSparkleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sparkleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private animationFrameId: number = 0;
  private mouse = { x: 0, y: 0 };
  private resizeListener = () => this.resizeCanvas();
  private mouseMoveListener = (e: MouseEvent) => {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    
    // Add 1-2 particles per mouse move event
    if (Math.random() > 0.3) {
      this.particles.push({
        x: this.mouse.x,
        y: this.mouse.y,
        size: Math.random() * 4 + 2, // 2 to 6px
        speedX: (Math.random() - 0.5) * 2,
        speedY: Math.random() * 2 + 0.5, // falling down
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        life: 1, // Opacity
        decay: Math.random() * 0.02 + 0.015,
        color: this.getRandomGoldColor()
      });
    }
  };

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    if (typeof window !== 'undefined') {
      this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
      this.resizeCanvas();
      window.addEventListener('resize', this.resizeListener);
      window.addEventListener('mousemove', this.mouseMoveListener);
      
      this.ngZone.runOutsideAngular(() => {
        this.animate();
      });
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeListener);
      window.removeEventListener('mousemove', this.mouseMoveListener);
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private resizeCanvas() {
    if (typeof window !== 'undefined') {
      this.canvasRef.nativeElement.width = window.innerWidth;
      this.canvasRef.nativeElement.height = window.innerHeight;
    }
  }

  private getRandomGoldColor() {
    const colors = [
      '#FFDF00', // Gold
      '#D4AF37', // Metallic Gold
      '#FFD700', // Yellow
      '#FDF5E6', // Old Lace (white/gold)
      '#FFFFFF'  // White sparkle
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private drawStar(x: number, y: number, radius: number, color: string, alpha: number, rotation: number) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    this.ctx.shadowBlur = radius * 2.5 + 2; // Golden glow
    this.ctx.shadowColor = color;
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      this.ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * radius,
                      -Math.sin((18 + i * 72) / 180 * Math.PI) * radius);
      this.ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * (radius / 2.5),
                      -Math.sin((54 + i * 72) / 180 * Math.PI) * (radius / 2.5));
    }
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add border (stroke)
    this.ctx.lineWidth = 0.8;
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.rot += p.rotSpeed;
      p.life -= p.decay;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        i--;
      } else {
        // Draw star
        this.drawStar(p.x, p.y, p.size, p.color, p.life, p.rot);
      }
    }
    
    this.animationFrameId = requestAnimationFrame(this.animate);
  }
}
