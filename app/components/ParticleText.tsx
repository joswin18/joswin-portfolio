'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParticleTextProps {
  text: string;
}

const ParticleText: React.FC<ParticleTextProps> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Store ref value in a variable to use in cleanup
    const container = containerRef.current;

    // Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particles
    const createParticles = () => {
      const geometry = new THREE.BufferGeometry();
      const count = 5000;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      // Create a canvas to draw text
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Draw text
      context.fillStyle = '#000000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = 'bold 60px Arial';
      context.fillStyle = '#ffffff';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      // Sample pixels
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      let particleIndex = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] > 128 && particleIndex < count) {
          const x = ((i / 4) % canvas.width) / canvas.width - 0.5;
          const y = -((Math.floor((i / 4) / canvas.width)) / canvas.height - 0.5);

          positions[particleIndex * 3] = x * 4;
          positions[particleIndex * 3 + 1] = y * 2;
          positions[particleIndex * 3 + 2] = 0;

          const color = new THREE.Color('#3B82F6');
          colors[particleIndex * 3] = color.r;
          colors[particleIndex * 3 + 1] = color.g;
          colors[particleIndex * 3 + 2] = color.b;

          particleIndex++;
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.01,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
      });

      if (particlesRef.current) {
        scene.remove(particlesRef.current);
      }

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);
      particlesRef.current = particles;
    };

    createParticles();

    // Animation
    const animate = () => {
      if (!particlesRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + positions[i]) * 0.001;
        positions[i + 1] += Math.cos(time + positions[i + 1]) * 0.001;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    // Cleanup
    return () => {
      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
      }
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        (particlesRef.current.material as THREE.PointsMaterial).dispose();
      }
    };
  }, [text]);

  return <div ref={containerRef} className="w-full h-[200px]" />;
};

export default ParticleText;

