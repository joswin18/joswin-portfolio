'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

interface InteractiveParticleTextProps {
  text: string;
}

class ParticleTextEnvironment {
  font: THREE.Font | null = null;
  particle: THREE.Texture | null = null;
  container: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  particles: THREE.Points | null = null;
  geometryCopy: THREE.BufferGeometry | null = null;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  colorChange: THREE.Color;
  buttom: boolean;
  data: {
    text: string;
    amount: number;
    particleSize: number;
    particleColor: number;
    textSize: number;
    area: number;
    ease: number;
  };

  constructor(container: HTMLElement, text: string) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 10000);
    this.camera.position.set(0, 0, 100);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(0, 0);
    this.colorChange = new THREE.Color();
    this.buttom = false;

    this.data = {
      text,
      amount: 1500,
      particleSize: 1,
      particleColor: 0xffffff,
      textSize: 18, // Reduced text size
      area: 250,
      ease: 0.05,
    };

    this.init();
  }

  async init() {
    const textureLoader = new THREE.TextureLoader();
    const fontLoader = new FontLoader();

    try {
      this.font = await new Promise((resolve, reject) => {
        fontLoader.load(
          'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_bold.typeface.json',
          resolve,
          undefined,
          reject
        );
      });

      this.particle = await new Promise((resolve) => {
        textureLoader.load('/particle.png', resolve);
      });

      this.setup();
      this.bindEvents();
      this.animate();
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  }

  setup() {
    if (!this.font || !this.particle) return;

    const geometry = new TextGeometry(this.data.text, {
      font: this.font,
      size: this.data.textSize,
      height: 0,
      curveSegments: 12,
      bevelEnabled: false,
    });

    geometry.computeBoundingBox();

    const centerOffset = -0.5 * (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x);
    const yOffset = -0.5 * (geometry.boundingBox!.max.y - geometry.boundingBox!.min.y);

    const points = this.createPointsFromGeometry(geometry, centerOffset, yOffset);
    this.particles = points;
    this.scene.add(points);

    this.geometryCopy = points.geometry.clone();
  }

  createPointsFromGeometry(geometry: THREE.BufferGeometry, xMid: number, yMid: number) {
    const vertices = geometry.attributes.position.array;
    const points: THREE.Vector3[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];

    for (let i = 0; i < vertices.length; i += 3) {
      points.push(new THREE.Vector3(vertices[i] + xMid, vertices[i + 1] + yMid, vertices[i + 2]));
      colors.push(1, 1, 1);
      sizes.push(1);
    }

    const pointsGeometry = new THREE.BufferGeometry().setFromPoints(points);
    pointsGeometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
    pointsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        pointTexture: { value: this.particle }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        void main() {
          vColor = customColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(color * vColor, 1.0);
          gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    return new THREE.Points(pointsGeometry, material);
  }

  bindEvents() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('touchmove', this.onTouchMove.bind(this));
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('touchstart', this.onTouchStart.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    document.addEventListener('touchend', this.onTouchEnd.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  onMouseMove(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onTouchMove(event: TouchEvent) {
    if (event.touches.length > 0) {
      this.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }

  onMouseDown() {
    this.buttom = true;
  }

  onTouchStart() {
    this.buttom = true;
  }

  onMouseUp() {
    this.buttom = false;
  }

  onTouchEnd() {
    this.buttom = false;
  }

  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  render() {
    if (!this.particles || !this.geometryCopy) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const pos = this.particles.geometry.attributes.position;
    const copy = this.geometryCopy.attributes.position;
    const colors = this.particles.geometry.attributes.customColor;
    const sizes = this.particles.geometry.attributes.size;

    const mouseVector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0);
    mouseVector.unproject(this.camera);
    const dir = mouseVector.sub(this.camera.position).normalize();
    const distance = -this.camera.position.z / dir.z;
    const pos3D = this.camera.position.clone().add(dir.multiplyScalar(distance));

    for (let i = 0; i < pos.count; i++) {
      const initX = copy.getX(i);
      const initY = copy.getY(i);
      const initZ = copy.getZ(i);

      let px = pos.getX(i);
      let py = pos.getY(i);
      let pz = pos.getZ(i);

      this.colorChange.setHSL(.5, 1, 1);
      colors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
      colors.needsUpdate = true;

      sizes.array[i] = this.data.particleSize;
      sizes.needsUpdate = true;

      let dx = pos3D.x - px;
      let dy = pos3D.y - py;
      const dz = pos3D.z - pz;

      const mouseDistance = this.distance(pos3D.x, pos3D.y, px, py);
      const d = (dx = pos3D.x - px) * dx + (dy = pos3D.y - py) * dy;
      const f = -this.data.area / d;

      if (this.buttom) {
        const t = Math.atan2(dy, dx);
        px -= f * Math.cos(t);
        py -= f * Math.sin(t);

        this.colorChange.setHSL(.5 + this.zigzagTime(), 1.0, .5);
        colors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
        colors.needsUpdate = true;

        if ((px > (initX + 70)) || (px < (initX - 70)) || (py > (initY + 70) || (py < (initY - 70)))) {
          this.colorChange.setHSL(.15, 1.0, .5);
          colors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
          colors.needsUpdate = true;
        }
      } else {
        if (mouseDistance < this.data.area) {
          if (i % 5 == 0) {
            const t = Math.atan2(dy, dx);
            px -= .03 * Math.cos(t);
            py -= .03 * Math.sin(t);

            this.colorChange.setHSL(.15, 1.0, .5);
            colors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
            colors.needsUpdate = true;

            sizes.array[i] = this.data.particleSize / 1.2;
            sizes.needsUpdate = true;
          } else {
            const t = Math.atan2(dy, dx);
            px += f * Math.cos(t);
            py += f * Math.sin(t);

            pos.setXYZ(i, px, py, pz);
            pos.needsUpdate = true;

            sizes.array[i] = this.data.particleSize * 1.3;
            sizes.needsUpdate = true;
          }

          if ((px > (initX + 10)) || (px < (initX - 10)) || (py > (initY + 10) || (py < (initY - 10)))) {
            this.colorChange.setHSL(.15, 1.0, .5);
            colors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
            colors.needsUpdate = true;

            sizes.array[i] = this.data.particleSize / 1.8;
            sizes.needsUpdate = true;
          }
        }
      }

      px += (initX - px) * this.data.ease;
      py += (initY - py) * this.data.ease;
      pz += (initZ - pz) * this.data.ease;

      pos.setXYZ(i, px, py, pz);
      pos.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  zigzagTime() {
    const time = ((.001 * performance.now()) % 12) / 12;
    return (1 + (Math.sin(time * 2 * Math.PI))) / 6;
  }

  distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
  }

  dispose() {
    this.particles?.geometry.dispose();
    (this.particles?.material as THREE.Material)?.dispose();
    this.geometryCopy?.dispose();
    this.renderer.dispose();
  }
}

const InteractiveParticleText: React.FC<InteractiveParticleTextProps> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const environmentRef = useRef<ParticleTextEnvironment | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    environmentRef.current = new ParticleTextEnvironment(containerRef.current, text);

    return () => {
      environmentRef.current?.dispose();
    };
  }, [text]);

  return (
    <div className="particle-text-container">
      <div id="magic" ref={containerRef} />
    </div>
  );
};

export default InteractiveParticleText;

