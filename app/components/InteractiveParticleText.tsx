'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

interface InteractiveParticleTextProps {
  text: string;
  isDarkMode: boolean;
}

const vertexShader = `
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;

  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * ( 300.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 color;
  uniform sampler2D pointTexture;
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4( color * vColor, 1.0 );
    gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
  }
`;

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
  isDarkMode: boolean;

  constructor(container: HTMLElement, text: string, isDarkMode: boolean) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 1, 10000);
    this.camera.position.set(0, 0, 100);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-200, 200);
    this.colorChange = new THREE.Color();
    this.buttom = false;
    this.isDarkMode = isDarkMode;

    this.data = {
      text,
      amount: 1000,
      particleSize: 1,
      particleColor: isDarkMode ? 0xffffff : 0xff0000,
      textSize: 16,
      area: 250,
      ease: 0.05,
    };

    this.init();
  }

  async init() {
    const fontLoader = new FontLoader();
    const textureLoader = new THREE.TextureLoader();

    try {
      this.font = await new Promise((resolve, reject) => {
        fontLoader.load(
          'https://res.cloudinary.com/dydre7amr/raw/upload/v1612950355/font_zsd4dr.json',
          resolve,
          undefined,
          reject
        );
      });

      this.particle = await new Promise((resolve) => {
        textureLoader.load('https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png', resolve);
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

    const geometry = new THREE.PlaneGeometry(
      this.visibleWidthAtZDepth(100, this.camera),
      this.visibleHeightAtZDepth(100, this.camera)
    );
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true });
    const planeArea = new THREE.Mesh(geometry, material);
    planeArea.visible = false;
    this.scene.add(planeArea);

    this.createText();
  }

  bindEvents() {
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  onMouseDown() {
    this.buttom = true;
    this.data.ease = 0.01;
  }

  onMouseUp() {
    this.buttom = false;
    this.data.ease = 0.05;
  }

  onMouseMove(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
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

    const time = (0.001 * performance.now()) % 12 / 12;
    const zigzagTime = (1 + Math.sin(time * 2 * Math.PI)) / 6;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObject(this.scene.children[0]);

    if (intersects.length > 0) {
      const pos = this.particles.geometry.attributes.position;
      const copy = this.geometryCopy.attributes.position;
      const colors = this.particles.geometry.attributes.customColor;
      const size = this.particles.geometry.attributes.size;

      const mx = intersects[0].point.x;
      const my = intersects[0].point.y;
      const mz = intersects[0].point.z;

      for (let i = 0, l = pos.count; i < l; i++) {
        const initX = copy.getX(i);
        const initY = copy.getY(i);
        const initZ = copy.getZ(i);

        let px = pos.getX(i);
        let py = pos.getY(i);
        let pz = pos.getZ(i);

        this.colorChange.setHSL(this.isDarkMode ? 0 : 0, 1, this.isDarkMode ? 1 : 0.5);
        colors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
        colors.needsUpdate = true;

        size.array[i] = this.data.particleSize;
        size.needsUpdate = true;

        let dx = mx - px;
        let dy = my - py;
        const dz = mz - pz;

        const mouseDistance = this.distance(mx, my, px, py);
        let d = (dx = mx - px) * dx + (dy = my - py) * dy;
        const f = -this.data.area / d;

        if (this.buttom) {
          const t = Math.atan2(dy, dx);
          px -= f * Math.cos(t);
          py -= f * Math.sin(t);

          this.colorChange.setHSL(.5 + zigzagTime, 1.0, .5);
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
              px -= 0.03 * Math.cos(t);
              py -= 0.03 * Math.sin(t);

              this.colorChange.setHSL(.15, 1.0, .5);
              colors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
              colors.needsUpdate = true;

              size.array[i] = this.data.particleSize / 1.2;
              size.needsUpdate = true;
            } else {
              const t = Math.atan2(dy, dx);
              px += f * Math.cos(t);
              py += f * Math.sin(t);

              pos.setXYZ(i, px, py, pz);
              pos.needsUpdate = true;

              size.array[i] = this.data.particleSize * 1.3;
              size.needsUpdate = true;
            }

            if ((px > (initX + 10)) || (px < (initX - 10)) || (py > (initY + 10) || (py < (initY - 10)))) {
              this.colorChange.setHSL(.15, 1.0, .5);
              colors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
              colors.needsUpdate = true;

              size.array[i] = this.data.particleSize / 1.8;
              size.needsUpdate = true;
            }
          }
        }

        px += (initX - px) * this.data.ease;
        py += (initY - py) * this.data.ease;
        pz += (initZ - pz) * this.data.ease;

        pos.setXYZ(i, px, py, pz);
        pos.needsUpdate = true;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  createText() {
    if (!this.font) return;

    let thePoints: THREE.Vector3[] = [];

    let shapes = this.font.generateShapes(this.data.text, this.data.textSize);
    let geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();

    const xMid = -0.5 * (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x);
    const yMid = (geometry.boundingBox!.max.y - geometry.boundingBox!.min.y) / 2.85;

    geometry.center();

    let holeShapes: THREE.Path[] = [];

    for (let q = 0; q < shapes.length; q++) {
      let shape = shapes[q];

      if (shape.holes && shape.holes.length > 0) {
        for (let j = 0; j < shape.holes.length; j++) {
          let hole = shape.holes[j];
          holeShapes.push(hole);
        }
      }
    }
    shapes.push.apply(shapes, holeShapes);

    let colors: number[] = [];
    this.colorChange.setHSL(this.isDarkMode ? 0 : 0, 1, this.isDarkMode ? 1 : 0.5);
    let sizes: number[] = [];

    for (let x = 0; x < shapes.length; x++) {
      let shape = shapes[x];

      const amountPoints = (shape.type == 'Path') ? this.data.amount / 2 : this.data.amount;

      let points = shape.getSpacedPoints(amountPoints);

      points.forEach((element: THREE.Vector2) => {
        const a = new THREE.Vector3(element.x, element.y, 0);
        thePoints.push(a);
        colors.push(this.colorChange.r, this.colorChange.g, this.colorChange.b);
        sizes.push(1);
      });
    }

    let geoParticles = new THREE.BufferGeometry().setFromPoints(thePoints);
    geoParticles.translate(xMid, yMid, 0);

    geoParticles.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
    geoParticles.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        pointTexture: { value: this.particle }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    this.particles = new THREE.Points(geoParticles, material);
    this.scene.add(this.particles);

    this.geometryCopy = new THREE.BufferGeometry();
    this.geometryCopy.copy(this.particles.geometry);
  }

  visibleHeightAtZDepth(depth: number, camera: THREE.PerspectiveCamera) {
    const cameraOffset = camera.position.z;
    if (depth < cameraOffset) depth -= cameraOffset;
    else depth += cameraOffset;

    const vFOV = camera.fov * Math.PI / 180;

    return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
  }

  visibleWidthAtZDepth(depth: number, camera: THREE.PerspectiveCamera) {
    const height = this.visibleHeightAtZDepth(depth, camera);
    return height * camera.aspect;
  }

  distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
  }

  updateParticleColors() {
    if (!this.particles) return;

    const colors = this.particles.geometry.attributes.customColor;
    this.colorChange.setHSL(this.isDarkMode ? 0 : 0, 1, this.isDarkMode ? 1 : 0.5);

    for (let i = 0; i < colors.count; i++) {
      colors.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
    }

    colors.needsUpdate = true;
  }

  dispose() {
    this.particles?.geometry.dispose();
    (this.particles?.material as THREE.Material)?.dispose();
    this.geometryCopy?.dispose();
    this.renderer.dispose();
  }
}

const InteractiveParticleText: React.FC<InteractiveParticleTextProps> = ({ text, isDarkMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const environmentRef = useRef<ParticleTextEnvironment | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!environmentRef.current) {
      environmentRef.current = new ParticleTextEnvironment(containerRef.current, text, isDarkMode);
    } else {
      environmentRef.current.isDarkMode = isDarkMode;
      environmentRef.current.updateParticleColors();
    }

    return () => {
      environmentRef.current?.dispose();
    };
  }, [text, isDarkMode]);

  return (
    <div className="particle-text-container">
      <div id="magic" ref={containerRef} />
    </div>
  );
};

export default InteractiveParticleText;

