import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SurfaceData {
  x: number[];
  y: number[];
  z: number[][];
  colorScale?: string;
}

@Component({
  selector: 'app-three-scene',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="three-canvas"></canvas>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .three-canvas {
      width: 100% !important;
      height: 100% !important;
      display: block;
      border-radius: 8px;
    }
  `]
})
export class ThreeSceneComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() data!: SurfaceData;
  @Input() wireframe = false;
  @Input() autoRotate = true;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private surfaceMesh?: THREE.Mesh;
  private animationId?: number;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initScene();
    if (this.data) {
      this.createSurface();
    }
    this.ngZone.runOutsideAngular(() => this.animate());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.scene && this.data) {
      this.updateSurface();
    }
    if (changes['wireframe'] && this.surfaceMesh) {
      (this.surfaceMesh.material as THREE.MeshStandardMaterial).wireframe = this.wireframe;
    }
    if (changes['autoRotate'] && this.controls) {
      this.controls.autoRotate = this.autoRotate;
    }
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.controls?.dispose();
    this.renderer?.dispose();
    this.scene?.clear();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 400;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x1f2937);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(3, 3, 3);

    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0x6366f1, 0.3);
    directionalLight2.position.set(-5, -5, -5);
    this.scene.add(directionalLight2);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(2);
    this.scene.add(axesHelper);

    // Handle resize
    window.addEventListener('resize', this.onResize);
  }

  private createSurface(): void {
    if (this.surfaceMesh) {
      this.scene.remove(this.surfaceMesh);
      this.surfaceMesh.geometry.dispose();
      (this.surfaceMesh.material as THREE.Material).dispose();
    }

    const { x, y, z } = this.data;
    const nx = x.length;
    const ny = y.length;

    // Normalize data ranges
    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    const yMin = Math.min(...y);
    const yMax = Math.max(...y);
    const zFlat = z.flat();
    const zMin = Math.min(...zFlat);
    const zMax = Math.max(...zFlat);

    const geometry = new THREE.PlaneGeometry(2, 2, nx - 1, ny - 1);
    const positions = geometry.attributes['position'];
    const colors: number[] = [];

    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const idx = j * nx + i;

        // Normalize x and y to [-1, 1]
        const normalizedX = ((x[i] - xMin) / (xMax - xMin)) * 2 - 1;
        const normalizedY = ((y[j] - yMin) / (yMax - yMin)) * 2 - 1;

        // Normalize z to [0, 1] for height
        const normalizedZ = (z[j][i] - zMin) / (zMax - zMin || 1);

        positions.setXYZ(idx, normalizedX, normalizedZ, normalizedY);

        // Color based on z value (viridis-like colormap)
        const color = this.getViridisColor(normalizedZ);
        colors.push(color.r, color.g, color.b);
      }
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      wireframe: this.wireframe,
      side: THREE.DoubleSide,
      flatShading: false,
    });

    this.surfaceMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.surfaceMesh);
  }

  private updateSurface(): void {
    this.createSurface();
  }

  private getViridisColor(t: number): THREE.Color {
    // Simplified viridis colormap
    const r = Math.max(0, Math.min(1, 0.267 + t * 0.329 + t * t * 0.134));
    const g = Math.max(0, Math.min(1, 0.004 + t * 0.873 - t * t * 0.377));
    const b = Math.max(0, Math.min(1, 0.329 + t * 0.421 - t * t * 0.450));
    return new THREE.Color(r, g, b);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private onResize = (): void => {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  resetView(): void {
    this.camera.position.set(3, 3, 3);
    this.controls.reset();
  }
}
