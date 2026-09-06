import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

const vertexShader = `
#define M_PI 3.1415926535897932384626433832795
uniform float uTime;
uniform float uSize;
attribute float aScale;
attribute vec3 aColor;
attribute float random;
attribute float random1;
attribute float aSpeed;
varying vec3 vColor;
varying vec2 vUv;
void main() {
  float sign = 2.0* (step(random, 0.5) -.5);
  float t = sign*mod(-uTime * aSpeed* 0.005 + 10.0*aSpeed*aSpeed, M_PI);
  float a = pow(t, 2.0) * pow((t - sign * M_PI), 2.0);
  float radius = 0.14;
  vec3 myOffset = vec3(t,  1.0, 0.0);
  myOffset = vec3(radius *16.0 * pow(sin(t), 2.0) * sin(t), radius * (13.0 * cos(t) - 5.0 * cos(2.0 * t) - 2.0 * cos(3.0 * t) - cos(4.0 * t)), .15*(a*(random1 - .5))*sin(abs(10.0*(sin(.2*uTime + .2*random)))*t));
  vec3 displacedPosition = myOffset;
  vec4 modelPosition = modelMatrix * vec4(displacedPosition.xyz, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  viewPosition.xyz += position * aScale * uSize * pow(a, .5) * .5;
  gl_Position = projectionMatrix * viewPosition;
  vColor = aColor;
  vUv = uv;
}
`;

const fragmentShader = `
varying vec3 vColor;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  vec3 color = vColor;
  float strength = distance(uv, vec2(0.5));
  strength *= 2.0;
  strength = 1.0 - strength;
  gl_FragColor = vec4(strength * color, 1.0);
}
`;

const vertexShader1 = `
#define M_PI 3.1415926535897932384626433832795
uniform float uTime;
uniform float uSize;
attribute float aScale;
attribute vec3 aColor;
attribute float phi;
attribute float random;
attribute float random1;
varying vec3 vColor;
varying vec2 vUv;
void main() {
  float t = 0.01 * uTime + 12.0;
  float angle = phi;
  t = mod((-uTime + 100.0) * 0.06* random1 + random *2.0 * M_PI , 2.0 * M_PI);
  vec3 myOffset = vec3(5.85*cos(angle * t), 2.0*(t - M_PI), 3.0*sin(angle * t/t));
  vec4 modelPosition = modelMatrix * vec4(myOffset, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  viewPosition.xyz += position * aScale * uSize;
  gl_Position = projectionMatrix * viewPosition;
  vColor = aColor;
  vUv = uv;
}
`;

const fragmentShader1 = `
uniform sampler2D uTex;
varying vec3 vColor;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  vec3 color = vColor;
  float strength = distance(uv, vec2(0.5, .65));
  strength *= 2.0;
  strength = 1.0 - strength;
  vec3 texture = texture2D(uTex, uv).rgb;
  gl_FragColor = vec4(texture * color * (strength + .3), 1.);
}
`;

@Component({
  selector: 'app-animated-heart',
  standalone: true,
  template: `<canvas #webglCanvas class="w-full h-full block"></canvas>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AnimatedHeartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('webglCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private clock!: THREE.Clock;
  private timer: number = 0;
  private model: any;
  private heart: any;
  private snow: any;
  
  private angle = { x: 0, z: 0 };
  private resizeListener = () => this.onResize();

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.initThreeJs();
    this.ngZone.runOutsideAngular(() => {
      this.loop();
    });
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeListener);
      cancelAnimationFrame(this.timer);
      if (this.renderer) {
        this.renderer.dispose();
      }
    }
  }

  private initThreeJs() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    // Allow transparent background instead of solid color
    // this.scene.background = new THREE.Color(0x16000a); 
    
    this.clock = new THREE.Clock();
    
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 4.5);
    this.scene.add(this.camera);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true // Enable background transparency
    });
    
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height);
    
    this.addModel();
    this.addHeart();
    this.addSnow();
  }

  private async addModel() {
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    
    loader.load(
      "https://assets.codepen.io/74321/heart.glb",
      (gltf) => {
        this.model = gltf.scene.children[0];
        this.model.scale.set(0.01, 0.01, 0.01);
        
        this.model.material = new THREE.MeshMatcapMaterial({
          matcap: textureLoader.load(
            "https://assets.codepen.io/74321/3.png",
            () => {
              gsap.to(this.model.scale, {
                x: 0.35,
                y: 0.35,
                z: 0.35,
                duration: 1.5,
                ease: "Elastic.easeOut"
              });
            }
          ),
          color: "#ff89aC"
        });
        
        this.scene.add(this.model);
      },
      undefined,
      (err) => console.error(err)
    );
  }

  private addHeart() {
    const textureLoader = new THREE.TextureLoader();
    const heartMaterial = new THREE.ShaderMaterial({
      fragmentShader: fragmentShader,
      vertexShader: vertexShader,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 0.2 },
        uTex: { value: textureLoader.load("https://assets.codepen.io/74321/heart.png") }
      },
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const count = 1500;
    const scales = new Float32Array(count * 1);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const randoms = new Float32Array(count);
    const randoms1 = new Float32Array(count);
    const colorChoices = ["white", "red", "pink", "crimson", "hotpink", "green"];

    const squareGeometry = new THREE.PlaneGeometry(1, 1);
    const instancedGeometry = new THREE.InstancedBufferGeometry();
    
    // Copy attributes correctly
    const posAttr = squareGeometry.attributes['position'];
    instancedGeometry.setAttribute('position', posAttr);
    const uvAttr = squareGeometry.attributes['uv'];
    instancedGeometry.setAttribute('uv', uvAttr);
    const normAttr = squareGeometry.attributes['normal'];
    if (normAttr) instancedGeometry.setAttribute('normal', normAttr);
    
    instancedGeometry.index = squareGeometry.index;
    
    (instancedGeometry as any).maxInstancedCount = count;

    for (let i = 0; i < count; i++) {
      const i3 = 3 * i;
      randoms[i] = Math.random();
      randoms1[i] = Math.random();
      scales[i] = Math.random() * 0.35;
      
      const colorIndex = Math.floor(Math.random() * colorChoices.length);
      const color = new THREE.Color(colorChoices[colorIndex]);
      colors[i3 + 0] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      speeds[i] = Math.random() * (12.5 * Math.PI);
    }
    
    instancedGeometry.setAttribute("random", new THREE.InstancedBufferAttribute(randoms, 1, false));
    instancedGeometry.setAttribute("random1", new THREE.InstancedBufferAttribute(randoms1, 1, false));
    instancedGeometry.setAttribute("aScale", new THREE.InstancedBufferAttribute(scales, 1, false));
    instancedGeometry.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(speeds, 1, false));
    instancedGeometry.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3, false));

    this.heart = new THREE.Mesh(instancedGeometry, heartMaterial);
    this.scene.add(this.heart);
  }

  private addSnow() {
    const textureLoader = new THREE.TextureLoader();
    const snowMaterial = new THREE.ShaderMaterial({
      fragmentShader: fragmentShader1,
      vertexShader: vertexShader1,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 0.3 },
        uTex: { value: textureLoader.load("https://assets.codepen.io/74321/heart.png") }
      },
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const count = 550;
    const scales = new Float32Array(count * 1);
    const colors = new Float32Array(count * 3);
    const phis = new Float32Array(count);
    const randoms = new Float32Array(count);
    const randoms1 = new Float32Array(count);
    const colorChoices = ["red", "pink", "hotpink", "green"];

    const squareGeometry = new THREE.PlaneGeometry(1, 1);
    const instancedGeometry = new THREE.InstancedBufferGeometry();
    
    const posAttr = squareGeometry.attributes['position'];
    instancedGeometry.setAttribute('position', posAttr);
    const uvAttr = squareGeometry.attributes['uv'];
    instancedGeometry.setAttribute('uv', uvAttr);
    const normAttr = squareGeometry.attributes['normal'];
    if (normAttr) instancedGeometry.setAttribute('normal', normAttr);
    
    instancedGeometry.index = squareGeometry.index;
    (instancedGeometry as any).maxInstancedCount = count;

    for (let i = 0; i < count; i++) {
      const phi = (Math.random() - 0.5) * 10;
      const i3 = 3 * i;
      phis[i] = phi;
      randoms[i] = Math.random();
      randoms1[i] = Math.random();
      scales[i] = Math.random() * 0.35;
      
      const colorIndex = Math.floor(Math.random() * colorChoices.length);
      const color = new THREE.Color(colorChoices[colorIndex]);
      colors[i3 + 0] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    
    instancedGeometry.setAttribute("phi", new THREE.InstancedBufferAttribute(phis, 1, false));
    instancedGeometry.setAttribute("random", new THREE.InstancedBufferAttribute(randoms, 1, false));
    instancedGeometry.setAttribute("random1", new THREE.InstancedBufferAttribute(randoms1, 1, false));
    instancedGeometry.setAttribute("aScale", new THREE.InstancedBufferAttribute(scales, 1, false));
    instancedGeometry.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3, false));

    this.snow = new THREE.Mesh(instancedGeometry, snowMaterial);
    this.scene.add(this.snow);
  }

  private onResize() {
    if (!this.camera || !this.renderer) return;
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private loop = () => {
    const elapsed = this.clock.getElapsedTime();
    
    // Constant slow rotation instead of audio-driven
    this.angle.x += 0.005;
    this.angle.z += 0.003;

    if (this.model) {
      this.model.rotation.y = -0.15;
      this.model.rotation.z = this.angle.z;
      this.model.rotation.x = this.angle.x;
    }

    if (this.heart) {
      this.heart.material.uniforms.uTime.value = elapsed * 1.5; 
    }
    
    if (this.snow) {
      this.snow.material.uniforms.uTime.value = elapsed * 1.5;
    }

    this.renderer.render(this.scene, this.camera);
    this.timer = requestAnimationFrame(this.loop);
  }
}
