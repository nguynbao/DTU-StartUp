'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BraceletConfig, CustomMaterial, Placement3D } from '@/types';
import { AppIcon } from '@/components/ui/AppIcon';
import { THREE_COLORS } from '@/config/theme';
import { useI18n } from '@/i18n/I18nContext';

export interface ThreeCanvasViewerProps {
  mode: 'preview' | 'studio' | 'inspector';
  productPreset: string;
  productGlbUrl?: string;
  baseColor: string;
  strapColor: string;
  placements: Placement3D[];
  braceletConfig?: BraceletConfig;
  selectedPlacementId?: string | null;
  activeMaterialToPlace?: CustomMaterial | null;
  onSurfacePlace?: (
    position: [number, number, number],
    normal: [number, number, number],
    slotIndex?: number
  ) => void;
  onSelectPlacement?: (placementId: string | null) => void;
  onUpdatePlacement?: (placementId: string, patch: Partial<Placement3D>) => void;
  onRemovePlacement?: (placementId: string) => void;
  autoRotate?: boolean;
  className?: string;
}

// ============================================================================
// PROCEDURAL CANVAS WOVEN TEXTURE GENERATOR (NO WIREFRAME Z-FIGHTING)
// ============================================================================

let cachedNetBumpMap: THREE.CanvasTexture | null = null;

function getWovenNetTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedNetBumpMap) return cachedNetBumpMap;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = THREE_COLORS.canvasBumpBase;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = THREE_COLORS.canvasBumpCord;
    ctx.lineWidth = 5;
    const step = 32;
    for (let i = -256; i <= 512; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 256, 256);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i, 256);
      ctx.lineTo(i + 256, 0);
      ctx.stroke();
    }

    ctx.fillStyle = THREE_COLORS.canvasBumpKnot;
    for (let y = 0; y <= 256; y += step / 2) {
      for (let x = 0; x <= 256; x += step / 2) {
        if (((x + y) / (step / 2)) % 2 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, 4.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  cachedNetBumpMap = texture;
  return texture;
}

// ============================================================================
// SCULPTED PARAMETRIC GEOMETRIES FOR MARINE ACCESSORIES (SHELLS, SNAILS, CHARMS)
// ============================================================================

function buildProceduralAccessoryMesh(
  meshPreset: string,
  colorHex: string,
  isSelected: boolean,
  isGhost = false
): THREE.Group {
  const wrapper = new THREE.Group();
  const baseColor = new THREE.Color(colorHex || THREE_COLORS.shellDefault);

  const nacreMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.28,
    metalness: 0.14,
    transparent: isGhost,
    opacity: isGhost ? 0.65 : 1,
    emissive: isSelected
      ? new THREE.Color(THREE_COLORS.selectionRust)
      : isGhost
      ? new THREE.Color(THREE_COLORS.ghostKelp)
      : new THREE.Color(THREE_COLORS.emissiveNone),
    emissiveIntensity: isSelected ? 0.35 : isGhost ? 0.22 : 0,
  });

  const ridgeAccentMat = new THREE.MeshStandardMaterial({
    color: baseColor.clone().multiplyScalar(0.84),
    roughness: 0.38,
    metalness: 0.1,
    transparent: isGhost,
    opacity: isGhost ? 0.65 : 1,
  });

  const preset = (meshPreset || 'scallop_shell').toLowerCase();

  // 1. VỎ SÒ ĐIỆP (scallop_shell)
  if (preset.includes('scallop') || preset === 'shell') {
    const shellGroup = new THREE.Group();
    const ribCount = 13;
    const fanSpread = Math.PI * 0.68;

    const domeGeo = new THREE.SphereGeometry(0.155, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55);
    domeGeo.scale(1.18, 0.38, 1.08);
    const dome = new THREE.Mesh(domeGeo, nacreMat);
    dome.position.set(0, 0.008, 0.01);
    shellGroup.add(dome);

    for (let i = 0; i < ribCount; i++) {
      const t = i / (ribCount - 1) - 0.5;
      const angle = t * fanSpread;
      const ribLen = 0.25 * (1 - 0.22 * Math.abs(t * 2));
      const ribGeo = new THREE.CylinderGeometry(0.006, 0.018, ribLen, 10);
      ribGeo.scale(1.15, 1, 0.55);
      const rib = new THREE.Mesh(ribGeo, i % 2 === 0 ? nacreMat : ridgeAccentMat);
      rib.position.set(
        Math.sin(angle) * (ribLen * 0.45),
        0.032 - Math.abs(t) * 0.012,
        -0.09 + Math.cos(angle) * (ribLen * 0.45)
      );
      rib.rotation.x = Math.PI / 2 - 0.08;
      rib.rotation.z = -angle;
      shellGroup.add(rib);
    }

    const earGeo = new THREE.BoxGeometry(0.14, 0.025, 0.045);
    const ear = new THREE.Mesh(earGeo, ridgeAccentMat);
    ear.position.set(0, 0.018, -0.11);
    shellGroup.add(ear);

    wrapper.add(shellGroup);
  }
  // 2. VỎ ỐC SỨ (cowrie_shell / clam_shell)
  else if (preset.includes('cowrie') || preset.includes('clam')) {
    const cowrieGroup = new THREE.Group();

    [-1, 1].forEach((side) => {
      const lobeGeo = new THREE.SphereGeometry(0.115, 24, 18);
      lobeGeo.scale(0.68, 0.52, 1.48);
      const lobe = new THREE.Mesh(lobeGeo, nacreMat);
      lobe.position.set(side * 0.036, 0.045, 0);
      cowrieGroup.add(lobe);
    });

    const grooveGeo = new THREE.BoxGeometry(0.018, 0.055, 0.27);
    const groove = new THREE.Mesh(grooveGeo, ridgeAccentMat);
    groove.position.set(0, 0.048, 0);
    cowrieGroup.add(groove);

    for (let z = -0.1; z <= 0.1; z += 0.033) {
      const toothGeo = new THREE.BoxGeometry(0.052, 0.014, 0.01);
      const tooth = new THREE.Mesh(toothGeo, nacreMat);
      tooth.position.set(0, 0.082, z);
      cowrieGroup.add(tooth);
    }

    wrapper.add(cowrieGroup);
  }
  // 3. ỐC XOẮN BIỂN (spiral_snail / conch_snail)
  else if (preset.includes('snail') || preset.includes('conch')) {
    const snailGroup = new THREE.Group();
    const totalTurns = 5.5;
    const segments = 54;

    for (let s = 0; s < segments; s++) {
      const frac = s / segments;
      const theta = frac * totalTurns * Math.PI * 2;
      const whorlRadius = 0.008 + Math.pow(frac, 1.35) * 0.085;
      const tubeRadius = 0.006 + Math.pow(frac, 1.25) * 0.058;
      const zPos = -0.16 + frac * 0.31;

      const beadGeo = new THREE.SphereGeometry(tubeRadius, 14, 12);
      beadGeo.scale(1.08, 0.88, 1.25);
      const bead = new THREE.Mesh(beadGeo, s % 4 === 0 ? ridgeAccentMat : nacreMat);
      bead.position.set(
        Math.cos(theta) * (whorlRadius * 0.38),
        0.048 + Math.sin(theta) * (whorlRadius * 0.28),
        zPos
      );
      snailGroup.add(bead);
    }

    const lipGeo = new THREE.TorusGeometry(0.056, 0.015, 12, 24, Math.PI * 1.4);
    const lip = new THREE.Mesh(lipGeo, ridgeAccentMat);
    lip.position.set(0.02, 0.05, 0.13);
    lip.rotation.y = Math.PI * 0.25;
    snailGroup.add(lip);

    wrapper.add(snailGroup);
  }
  // 4. SAO BIỂN 5 CÁNH HỮU CƠ (starfish_charm)
  else if (preset.includes('starfish') || preset.includes('star')) {
    const starGroup = new THREE.Group();
    const shape = new THREE.Shape();
    const numArms = 5;
    const outerR = 0.175;
    const innerR = 0.068;

    for (let i = 0; i < numArms * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / numArms - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.quadraticCurveTo(Math.cos(a - 0.15) * (r * 0.92), Math.sin(a - 0.15) * (r * 0.92), x, y);
    }
    shape.closePath();

    const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.024,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.016,
      bevelThickness: 0.018,
    });
    extrudeGeo.rotateX(-Math.PI / 2);
    const body = new THREE.Mesh(extrudeGeo, nacreMat);
    body.position.y = 0.016;
    starGroup.add(body);

    for (let arm = 0; arm < 5; arm++) {
      const angle = (arm * Math.PI * 2) / 5 - Math.PI / 2;
      for (let d = 1; d <= 3; d++) {
        const dist = d * 0.044;
        const dotGeo = new THREE.SphereGeometry(0.014 - d * 0.002, 10, 8);
        const dot = new THREE.Mesh(dotGeo, ridgeAccentMat);
        dot.position.set(Math.cos(angle) * dist, 0.048, -Math.sin(angle) * dist);
        starGroup.add(dot);
      }
    }

    wrapper.add(starGroup);
  }
  // 5. CHARM RÙA BIỂN (turtle_charm)
  else if (preset.includes('turtle')) {
    const turtleGroup = new THREE.Group();
    const carapaceGeo = new THREE.SphereGeometry(0.115, 24, 18);
    carapaceGeo.scale(0.92, 0.42, 1.22);
    const carapace = new THREE.Mesh(carapaceGeo, nacreMat);
    carapace.position.y = 0.04;
    turtleGroup.add(carapace);

    const rimGeo = new THREE.TorusGeometry(0.105, 0.012, 10, 28);
    rimGeo.rotateX(Math.PI / 2);
    rimGeo.scale(0.92, 1.22, 1);
    const rim = new THREE.Mesh(rimGeo, ridgeAccentMat);
    rim.position.y = 0.025;
    turtleGroup.add(rim);

    const headGeo = new THREE.SphereGeometry(0.042, 14, 14);
    headGeo.scale(0.85, 0.65, 1.15);
    const head = new THREE.Mesh(headGeo, nacreMat);
    head.position.set(0, 0.03, 0.155);
    turtleGroup.add(head);

    [
      { x: -0.115, z: 0.055, rz: 0.45, sx: 0.095 },
      { x: 0.115, z: 0.055, rz: -0.45, sx: 0.095 },
      { x: -0.085, z: -0.095, rz: -0.55, sx: 0.065 },
      { x: 0.085, z: -0.095, rz: 0.55, sx: 0.065 },
    ].forEach((f) => {
      const flipGeo = new THREE.SphereGeometry(f.sx, 12, 10);
      flipGeo.scale(1, 0.22, 0.42);
      const flip = new THREE.Mesh(flipGeo, ridgeAccentMat);
      flip.position.set(f.x, 0.022, f.z);
      flip.rotation.y = f.rz;
      turtleGroup.add(flip);
    });

    wrapper.add(turtleGroup);
  }
  // 6. HẠT NGỌC TRAI & HẠT THỦY TINH BIỂN MỜ (pearl_bead / sea_glass_bead)
  else if (preset.includes('pearl') || preset.includes('bead') || preset.includes('glass')) {
    const isSeaGlass = preset.includes('glass');
    const beadMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: isSeaGlass ? 0.48 : 0.12,
      metalness: isSeaGlass ? 0.05 : 0.32,
      transparent: isGhost || isSeaGlass,
      opacity: isGhost ? 0.65 : isSeaGlass ? 0.88 : 1,
      emissive: isSelected
        ? new THREE.Color(THREE_COLORS.selectionRust)
        : new THREE.Color(THREE_COLORS.emissiveNone),
      emissiveIntensity: isSelected ? 0.35 : 0,
    });

    const beadGeo = isSeaGlass
      ? new THREE.DodecahedronGeometry(0.11, 2)
      : new THREE.SphereGeometry(0.105, 28, 28);
    if (isSeaGlass) {
      beadGeo.scale(1.18, 0.52, 0.96);
    } else {
      beadGeo.scale(1, 0.86, 1);
    }
    const bead = new THREE.Mesh(beadGeo, beadMat);
    bead.position.y = isSeaGlass ? 0.045 : 0.075;
    wrapper.add(bead);
  }
  // 7. NÚT THẮT DÂY LƯỚI THỦY THỦ (fishing_cord)
  else {
    const knotGeo = new THREE.TorusKnotGeometry(0.078, 0.024, 64, 12, 2, 3);
    knotGeo.rotateX(Math.PI / 2);
    knotGeo.scale(1, 1, 0.55);
    const knot = new THREE.Mesh(knotGeo, nacreMat);
    knot.position.y = 0.036;
    wrapper.add(knot);
  }

  // Editorial Hairline Selection Ring when selected in Studio or Inspector
  if (isSelected) {
    const ringGeo = new THREE.RingGeometry(0.185, 0.215, 36);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(THREE_COLORS.selectionRust),
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.006;
    wrapper.add(ring);
  }

  return wrapper;
}

// ============================================================================
// NATURAL PROCEDURAL PRODUCT GEOMETRIES
// ============================================================================

function buildProceduralProductGroup(
  preset: string,
  baseColorHex: string,
  strapColorHex: string,
  braceletConfig?: BraceletConfig
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'productRootGroup';

  const baseColor = new THREE.Color(baseColorHex || THREE_COLORS.defaultBaseKelp);
  const strapColor = new THREE.Color(strapColorHex || THREE_COLORS.defaultStrapRust);
  const netTexture = getWovenNetTexture();

  const netPrimaryMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.68,
    metalness: 0.06,
    bumpMap: netTexture || undefined,
    bumpScale: 0.035,
    side: THREE.DoubleSide,
  });

  const strapMat = new THREE.MeshStandardMaterial({
    color: strapColor,
    roughness: 0.58,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });

  const hempLinerMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(THREE_COLORS.hempLiner),
    roughness: 0.88,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  const antiqueBrassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(THREE_COLORS.antiqueBrass),
    roughness: 0.32,
    metalness: 0.78,
  });

  const key = (preset || 'tote_bag').toLowerCase();

  // 1. GIỎ ĐỰNG ĐỒ ĐAN LƯỚI (market_basket)
  if (key.includes('basket')) {
    const outerPts: THREE.Vector2[] = [
      new THREE.Vector2(0.0, -0.82),
      new THREE.Vector2(0.84, -0.82),
      new THREE.Vector2(0.96, -0.62),
      new THREE.Vector2(1.12, -0.15),
      new THREE.Vector2(1.22, 0.42),
      new THREE.Vector2(1.18, 0.78),
    ];
    const outerLatheGeo = new THREE.LatheGeometry(outerPts, 48);
    outerLatheGeo.computeVertexNormals();
    const outerShell = new THREE.Mesh(outerLatheGeo, netPrimaryMat);
    outerShell.userData.isPlaceableSurface = true;
    outerShell.castShadow = true;
    outerShell.receiveShadow = true;
    group.add(outerShell);

    const innerPts: THREE.Vector2[] = [
      new THREE.Vector2(1.11, 0.77),
      new THREE.Vector2(1.14, 0.4),
      new THREE.Vector2(1.04, -0.15),
      new THREE.Vector2(0.88, -0.6),
      new THREE.Vector2(0.78, -0.74),
      new THREE.Vector2(0.0, -0.74),
    ];
    const innerLatheGeo = new THREE.LatheGeometry(innerPts, 40);
    innerLatheGeo.computeVertexNormals();
    const innerWall = new THREE.Mesh(innerLatheGeo, hempLinerMat);
    innerWall.userData.isPlaceableSurface = false;
    group.add(innerWall);

    const topRimGeo = new THREE.TorusGeometry(1.15, 0.068, 18, 56);
    topRimGeo.rotateX(Math.PI / 2);
    const topRim = new THREE.Mesh(topRimGeo, strapMat);
    topRim.position.y = 0.78;
    topRim.userData.isPlaceableSurface = false;
    group.add(topRim);

    const ringHeights = [-0.55, -0.25, 0.08, 0.42];
    const ringRadii = [0.98, 1.09, 1.17, 1.22];
    ringHeights.forEach((yPos, idx) => {
      const hoopGeo = new THREE.TorusGeometry(ringRadii[idx], 0.022, 12, 52);
      hoopGeo.rotateX(Math.PI / 2);
      const hoop = new THREE.Mesh(
        hoopGeo,
        idx % 2 === 0 ? strapMat : netPrimaryMat
      );
      hoop.position.y = yPos;
      hoop.userData.isPlaceableSurface = false;
      group.add(hoop);
    });

    [-1, 1].forEach((dir) => {
      const handleCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(dir * 1.12, 0.74, -0.32),
        new THREE.Vector3(dir * 1.32, 1.06, -0.16),
        new THREE.Vector3(dir * 1.36, 1.14, 0),
        new THREE.Vector3(dir * 1.32, 1.06, 0.16),
        new THREE.Vector3(dir * 1.12, 0.74, 0.32),
      ]);
      const handleGeo = new THREE.TubeGeometry(handleCurve, 28, 0.048, 14, false);
      const handle = new THREE.Mesh(handleGeo, strapMat);
      handle.userData.isPlaceableSurface = false;
      group.add(handle);
    });
  }
  // 2. VÍ TIỀN LƯỚI TÁI CHẾ (zip_wallet)
  else if (key.includes('wallet') || key.includes('clutch')) {
    const w = 1.02;
    const h = 0.58;
    const r = 0.14;
    const walletShape = new THREE.Shape();
    walletShape.moveTo(-w + r, -h);
    walletShape.lineTo(w - r, -h);
    walletShape.quadraticCurveTo(w, -h, w, -h + r);
    walletShape.lineTo(w, h - r);
    walletShape.quadraticCurveTo(w, h, w - r, h);
    walletShape.lineTo(-w + r, h);
    walletShape.quadraticCurveTo(-w, h, -w, h - r);
    walletShape.lineTo(-w, -h + r);
    walletShape.quadraticCurveTo(-w, -h, -w + r, -h);

    const extrudeGeo = new THREE.ExtrudeGeometry(walletShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 2,
      bevelSize: 0.06,
      bevelThickness: 0.07,
    });
    extrudeGeo.center();
    extrudeGeo.computeVertexNormals();

    const bodyMesh = new THREE.Mesh(extrudeGeo, netPrimaryMat);
    bodyMesh.userData.isPlaceableSurface = true;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    const trimGeo = new THREE.BoxGeometry(2.12, 0.36, 0.35);
    const trimMesh = new THREE.Mesh(trimGeo, strapMat);
    trimMesh.position.set(0, -0.44, 0);
    trimMesh.userData.isPlaceableSurface = true;
    group.add(trimMesh);

    const zipTrackGeo = new THREE.BoxGeometry(1.92, 0.04, 0.08);
    const zipTrack = new THREE.Mesh(zipTrackGeo, antiqueBrassMat);
    zipTrack.position.set(0, 0.64, 0);
    zipTrack.userData.isPlaceableSurface = false;
    group.add(zipTrack);

    const pullerGeo = new THREE.BoxGeometry(0.14, 0.06, 0.12);
    const puller = new THREE.Mesh(pullerGeo, antiqueBrassMat);
    puller.position.set(0.68, 0.66, 0);
    puller.userData.isPlaceableSurface = false;
    group.add(puller);

    const wristCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.05, 0.48, 0),
      new THREE.Vector3(-1.42, 0.32, 0.08),
      new THREE.Vector3(-1.55, 0.05, 0),
      new THREE.Vector3(-1.38, 0.18, -0.08),
      new THREE.Vector3(-1.05, 0.44, 0),
    ]);
    const wristGeo = new THREE.TubeGeometry(wristCurve, 28, 0.032, 12, false);
    const wristMesh = new THREE.Mesh(wristGeo, strapMat);
    wristMesh.userData.isPlaceableSurface = false;
    group.add(wristMesh);
  }
  // 3. ÁO KHOÁC GILE TÁI CHẾ (ocean_vest / apparel)
  else if (key.includes('vest') || key.includes('apparel') || key.includes('jacket')) {
    const vestShape = new THREE.Shape();
    vestShape.moveTo(-0.88, -1.02);
    vestShape.lineTo(0.88, -1.02);
    vestShape.quadraticCurveTo(0.84, -0.35, 0.92, 0.18);
    vestShape.quadraticCurveTo(0.66, 0.45, 0.74, 0.96);
    vestShape.lineTo(0.38, 1.04);
    vestShape.lineTo(0.0, 0.38);
    vestShape.lineTo(-0.38, 1.04);
    vestShape.lineTo(-0.74, 0.96);
    vestShape.quadraticCurveTo(-0.66, 0.45, -0.92, 0.18);
    vestShape.quadraticCurveTo(-0.84, -0.35, -0.88, -1.02);

    const vestGeo = new THREE.ExtrudeGeometry(vestShape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 2,
      bevelSize: 0.06,
      bevelThickness: 0.07,
    });
    vestGeo.center();
    vestGeo.computeVertexNormals();

    const vestBody = new THREE.Mesh(vestGeo, netPrimaryMat);
    vestBody.userData.isPlaceableSurface = true;
    vestBody.castShadow = true;
    vestBody.receiveShadow = true;
    group.add(vestBody);

    const placketGeo = new THREE.BoxGeometry(0.11, 1.38, 0.52);
    const placket = new THREE.Mesh(placketGeo, strapMat);
    placket.position.set(0, -0.32, 0);
    placket.userData.isPlaceableSurface = false;
    group.add(placket);

    [-0.1, -0.38, -0.66, -0.92].forEach((by) => {
      const btnGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.025, 16);
      btnGeo.rotateX(Math.PI / 2);
      const btn = new THREE.Mesh(btnGeo, antiqueBrassMat);
      btn.position.set(0, by, 0.27);
      btn.userData.isPlaceableSurface = false;
      group.add(btn);
    });

    [-0.46, 0.46].forEach((px) => {
      const pocketGeo = new THREE.BoxGeometry(0.46, 0.48, 0.08);
      const pocket = new THREE.Mesh(pocketGeo, strapMat);
      pocket.position.set(px, -0.45, 0.25);
      pocket.userData.isPlaceableSurface = true;
      group.add(pocket);

      const flapGeo = new THREE.BoxGeometry(0.48, 0.12, 0.1);
      const flap = new THREE.Mesh(flapGeo, netPrimaryMat);
      flap.position.set(px, -0.22, 0.26);
      flap.userData.isPlaceableSurface = false;
      group.add(flap);
    });
  }
  // 4. VÒNG TAY NỐI CHUỖI 3D (braided_bracelet)
  else if (key.includes('bracelet')) {
    const wristCm = braceletConfig?.wristSizeCm || 16;
    const slotCount = braceletConfig?.slotCount || 12;
    const radius = 0.95 * (wristCm / 16);

    [-0.032, 0.032].forEach((zOff) => {
      const cordGeo = new THREE.TorusGeometry(radius, 0.036, 20, 84);
      const cordMesh = new THREE.Mesh(cordGeo, netPrimaryMat);
      cordMesh.position.z = zOff;
      cordMesh.userData.isPlaceableSurface = true;
      cordMesh.castShadow = true;
      group.add(cordMesh);
    });

    const claspAngle = -Math.PI / 2;
    const cx = Math.cos(claspAngle) * radius;
    const cy = Math.sin(claspAngle) * radius;

    const macrameGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.24, 18);
    macrameGeo.rotateZ(Math.PI / 2);
    const macrame = new THREE.Mesh(macrameGeo, strapMat);
    macrame.position.set(cx, cy, 0);
    macrame.userData.isPlaceableSurface = false;
    group.add(macrame);

    [-1, 1].forEach((side) => {
      const tasselCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(cx + side * 0.08, cy, 0),
        new THREE.Vector3(cx + side * 0.16, cy - 0.18, 0.02),
        new THREE.Vector3(cx + side * 0.22, cy - 0.36, 0),
      ]);
      const tasselGeo = new THREE.TubeGeometry(tasselCurve, 16, 0.018, 8, false);
      const tassel = new THREE.Mesh(tasselGeo, strapMat);
      tassel.userData.isPlaceableSurface = false;
      group.add(tassel);

      const endBeadGeo = new THREE.SphereGeometry(0.038, 12, 12);
      const endBead = new THREE.Mesh(endBeadGeo, antiqueBrassMat);
      endBead.position.set(cx + side * 0.22, cy - 0.36, 0);
      endBead.userData.isPlaceableSurface = false;
      group.add(endBead);
    });

    const slotGuideMat = new THREE.MeshStandardMaterial({
      color: strapColor,
      roughness: 0.45,
      metalness: 0.2,
      transparent: true,
      opacity: 0.55,
    });

    for (let i = 0; i < slotCount; i++) {
      const arcSpan = Math.PI * 1.76;
      const startAngle = Math.PI / 2 + arcSpan / 2;
      const theta =
        slotCount > 1
          ? startAngle - (i / (slotCount - 1)) * arcSpan
          : Math.PI / 2;

      const sx = Math.cos(theta) * radius;
      const sy = Math.sin(theta) * radius;
      const nx = Math.cos(theta);
      const ny = Math.sin(theta);

      const slotNodeGeo = new THREE.CylinderGeometry(0.072, 0.072, 0.09, 16);
      const slotNode = new THREE.Mesh(slotNodeGeo, slotGuideMat);
      slotNode.position.set(sx, sy, 0);
      slotNode.rotation.z = theta;
      slotNode.userData.isPlaceableSurface = true;
      slotNode.userData.slotIndex = i;
      slotNode.userData.slotPosition = [
        Number(sx.toFixed(4)),
        Number(sy.toFixed(4)),
        0,
      ];
      slotNode.userData.slotNormal = [
        Number(nx.toFixed(4)),
        Number(ny.toFixed(4)),
        0.22,
      ];
      group.add(slotNode);
    }
  }
  // 5. PHỤ KIỆN MÓC TREO / CHUÔNG GIÓ VỎ SÒ (accessory / shell_charm_holder)
  else if (key.includes('accessory') || key.includes('holder') || key.includes('charm')) {
    const buoyGeo = new THREE.SphereGeometry(0.88, 36, 36);
    buoyGeo.scale(1, 1.12, 1);
    const buoy = new THREE.Mesh(buoyGeo, netPrimaryMat);
    buoy.userData.isPlaceableSurface = true;
    buoy.castShadow = true;
    group.add(buoy);

    [0, Math.PI / 3, (Math.PI * 2) / 3].forEach((rotY) => {
      const meridianGeo = new THREE.TorusGeometry(0.92, 0.028, 12, 48);
      meridianGeo.scale(0.96, 1.08, 1);
      const meridian = new THREE.Mesh(meridianGeo, strapMat);
      meridian.rotation.y = rotY;
      meridian.userData.isPlaceableSurface = false;
      group.add(meridian);
    });

    const eqRingGeo = new THREE.TorusGeometry(0.91, 0.035, 14, 48);
    eqRingGeo.rotateX(Math.PI / 2);
    const eqRing = new THREE.Mesh(eqRingGeo, strapMat);
    eqRing.userData.isPlaceableSurface = false;
    group.add(eqRing);

    const topLoopGeo = new THREE.TorusGeometry(0.24, 0.04, 14, 32);
    const topLoop = new THREE.Mesh(topLoopGeo, antiqueBrassMat);
    topLoop.position.set(0, 1.15, 0);
    topLoop.userData.isPlaceableSurface = false;
    group.add(topLoop);
  }
  // 6. TÚI XÁCH LƯỚI ĐẠI DƯƠNG (tote_bag — Default)
  else {
    const toteGeo = new THREE.CylinderGeometry(1.14, 0.94, 1.72, 48, 20, true);
    toteGeo.scale(1.16, 1, 0.48);
    toteGeo.computeVertexNormals();
    const toteBody = new THREE.Mesh(toteGeo, netPrimaryMat);
    toteBody.userData.isPlaceableSurface = true;
    toteBody.castShadow = true;
    toteBody.receiveShadow = true;
    group.add(toteBody);

    const linerGeo = new THREE.CylinderGeometry(1.06, 0.89, 1.64, 36, 1, false);
    linerGeo.scale(1.13, 1, 0.44);
    const liner = new THREE.Mesh(linerGeo, hempLinerMat);
    liner.position.y = -0.03;
    liner.userData.isPlaceableSurface = false;
    group.add(liner);

    const bootGeo = new THREE.CylinderGeometry(0.97, 0.93, 0.34, 44, 1, false);
    bootGeo.scale(1.17, 1, 0.49);
    const boot = new THREE.Mesh(bootGeo, strapMat);
    boot.position.y = -0.71;
    boot.userData.isPlaceableSurface = true;
    group.add(boot);

    const rimGeo = new THREE.TorusGeometry(1.13, 0.048, 16, 56);
    rimGeo.rotateX(Math.PI / 2);
    rimGeo.scale(1.16, 0.48, 1);
    const rim = new THREE.Mesh(rimGeo, strapMat);
    rim.position.y = 0.86;
    rim.userData.isPlaceableSurface = false;
    group.add(rim);

    [-1, 1].forEach((side) => {
      const zAnchor = side * 0.51;
      const strapCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.48, 0.72, zAnchor),
        new THREE.Vector3(-0.44, 1.25, zAnchor * 0.85),
        new THREE.Vector3(0, 1.56, zAnchor * 0.65),
        new THREE.Vector3(0.44, 1.25, zAnchor * 0.85),
        new THREE.Vector3(0.48, 0.72, zAnchor),
      ]);
      const strapTubeGeo = new THREE.TubeGeometry(strapCurve, 36, 0.042, 14, false);
      const strapMesh = new THREE.Mesh(strapTubeGeo, strapMat);
      strapMesh.userData.isPlaceableSurface = false;
      group.add(strapMesh);

      [-0.48, 0.48].forEach((rx) => {
        const rivetGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16);
        rivetGeo.rotateX(Math.PI / 2);
        const rivet = new THREE.Mesh(rivetGeo, antiqueBrassMat);
        rivet.position.set(rx, 0.72, zAnchor + side * 0.03);
        rivet.userData.isPlaceableSurface = false;
        group.add(rivet);
      });
    });
  }

  return group;
}

// ============================================================================
// SURFACE ALIGNMENT WITH NORMAL OFFSET
// ============================================================================

function alignGroupToSurface(
  obj: THREE.Object3D,
  position: [number, number, number],
  normal: [number, number, number],
  rotationDeg: number,
  scaleVal: number,
  surfaceOffset = 0.018
) {
  const normVec = new THREE.Vector3(normal[0], normal[1], normal[2]).normalize();
  if (normVec.lengthSq() < 0.0001) {
    normVec.set(0, 1, 0);
  }

  const posVec = new THREE.Vector3(position[0], position[1], position[2]).addScaledVector(
    normVec,
    surfaceOffset
  );
  obj.position.copy(posVec);

  const upVector = new THREE.Vector3(0, 1, 0);
  const alignQuat = new THREE.Quaternion().setFromUnitVectors(upVector, normVec);
  const spinQuat = new THREE.Quaternion().setFromAxisAngle(
    normVec,
    THREE.MathUtils.degToRad(rotationDeg || 0)
  );
  obj.quaternion.copy(spinQuat.multiply(alignQuat));

  const safeScale = Math.min(2.5, Math.max(0.4, scaleVal || 1));
  obj.scale.setScalar(safeScale);
}

// ============================================================================
// MAIN SHARED 3D VIEWER COMPONENT
// ============================================================================

export function ThreeCanvasViewer({
  mode,
  productPreset,
  productGlbUrl,
  baseColor,
  strapColor,
  placements,
  braceletConfig,
  selectedPlacementId,
  activeMaterialToPlace,
  onSurfacePlace,
  onSelectPlacement,
  autoRotate = false,
  className = '',
}: ThreeCanvasViewerProps) {
  const { t } = useI18n();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const productGroupRef = useRef<THREE.Group | null>(null);
  const placementsGroupRef = useRef<THREE.Group | null>(null);
  const ghostMeshRef = useRef<THREE.Group | null>(null);

  const [webglReady, setWebglReady] = useState(true);
  const [projectedLabels, setProjectedLabels] = useState<
    Array<{ id: string; index: number; x: number; y: number; name: string }>
  >([]);

  const isBraceletMode = (productPreset || '').toLowerCase().includes('bracelet');

  const latestPropsRef = useRef({
    mode,
    activeMaterialToPlace,
    onSurfacePlace,
    onSelectPlacement,
    placements,
    isBraceletMode,
  });

  useEffect(() => {
    latestPropsRef.current = {
      mode,
      activeMaterialToPlace,
      onSurfacePlace,
      onSelectPlacement,
      placements,
      isBraceletMode,
    };
  }, [mode, activeMaterialToPlace, onSurfacePlace, onSelectPlacement, placements, isBraceletMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglReady(false);
      return;
    }

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 520;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.15, 4.1);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.9;
    controls.maxDistance = 7.2;
    controls.autoRotate = mode === 'preview' || autoRotate;
    controls.autoRotateSpeed = 1.1;
    controlsRef.current = controls;

    // Warm Natural Coastal Daylight Setup
    const ambientLight = new THREE.AmbientLight(THREE_COLORS.ambientLight, 0.92);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(
      THREE_COLORS.hemisphereSky,
      THREE_COLORS.hemisphereGround,
      0.65
    );
    hemisphereLight.position.set(0, 6, 0);
    scene.add(hemisphereLight);

    const mainDirLight = new THREE.DirectionalLight(THREE_COLORS.directionalMain, 1.35);
    mainDirLight.position.set(4, 6, 5);
    mainDirLight.castShadow = true;
    scene.add(mainDirLight);

    const rimLight = new THREE.DirectionalLight(THREE_COLORS.directionalRim, 0.55);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    // Raw Limestone Studio Plinth Disc
    const pedestalGeo = new THREE.CylinderGeometry(1.68, 1.76, 0.05, 56);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: THREE_COLORS.plinthStone,
      roughness: 0.88,
      metalness: 0.02,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.16;
    pedestal.receiveShadow = true;
    pedestal.userData.isPlaceableSurface = false;
    scene.add(pedestal);

    const productHolder = new THREE.Group();
    scene.add(productHolder);
    productGroupRef.current = productHolder;

    const placementsHolder = new THREE.Group();
    scene.add(placementsHolder);
    placementsGroupRef.current = placementsHolder;

    // Raycaster & Pointer Interaction
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const getPlaceableMeshes = (): THREE.Object3D[] => {
      const list: THREE.Object3D[] = [];
      if (!productGroupRef.current) return list;
      productGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.userData?.isPlaceableSurface === true) {
          list.push(child);
        }
      });
      return list;
    };

    const computeAccurateHitTransform = (hit: THREE.Intersection) => {
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
      const worldNormal = (hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0))
        .applyMatrix3(normalMatrix)
        .normalize();

      if (worldNormal.dot(raycaster.ray.direction) > 0) {
        worldNormal.negate();
      }

      const localPoint = productGroupRef.current
        ? productGroupRef.current.worldToLocal(hit.point.clone())
        : hit.point.clone();

      return { localPoint, worldNormal };
    };

    const updatePointerCoords = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const { mode: curMode, activeMaterialToPlace: curActiveMat } = latestPropsRef.current;
      if (curMode !== 'studio' || !curActiveMat || !productGroupRef.current) {
        if (ghostMeshRef.current) {
          ghostMeshRef.current.visible = false;
        }
        return;
      }

      updatePointerCoords(event);
      raycaster.setFromCamera(pointer, camera);

      const placeableMeshes = getPlaceableMeshes();
      const intersects = raycaster.intersectObjects(placeableMeshes, false);
      const hit = intersects[0];

      if (hit) {
        if (!ghostMeshRef.current) {
          ghostMeshRef.current = buildProceduralAccessoryMesh(
            curActiveMat.model3D?.meshPreset || 'scallop_shell',
            curActiveMat.colorHex,
            false,
            true
          );
          scene.add(ghostMeshRef.current);
        }
        ghostMeshRef.current.visible = true;

        if (
          hit.object.userData?.slotIndex !== undefined &&
          hit.object.userData?.slotPosition &&
          hit.object.userData?.slotNormal
        ) {
          alignGroupToSurface(
            ghostMeshRef.current,
            hit.object.userData.slotPosition,
            hit.object.userData.slotNormal,
            0,
            curActiveMat.model3D?.defaultScale || 1
          );
        } else {
          const { localPoint, worldNormal } = computeAccurateHitTransform(hit);
          alignGroupToSurface(
            ghostMeshRef.current,
            [localPoint.x, localPoint.y, localPoint.z],
            [worldNormal.x, worldNormal.y, worldNormal.z],
            0,
            curActiveMat.model3D?.defaultScale || 1
          );
        }
      } else if (ghostMeshRef.current) {
        ghostMeshRef.current.visible = false;
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      pointerDownPos = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      const moveDist = Math.hypot(
        event.clientX - pointerDownPos.x,
        event.clientY - pointerDownPos.y
      );
      if (moveDist > 6) return;

      const {
        mode: curMode,
        activeMaterialToPlace: curActiveMat,
        onSurfacePlace: placeCb,
        onSelectPlacement: selectCb,
      } = latestPropsRef.current;

      if (curMode === 'preview') return;

      updatePointerCoords(event);
      raycaster.setFromCamera(pointer, camera);

      if (placementsGroupRef.current) {
        const hitPlacements = raycaster.intersectObjects(
          placementsGroupRef.current.children,
          true
        );
        if (hitPlacements.length > 0) {
          let obj: THREE.Object3D | null = hitPlacements[0].object;
          while (obj && !obj.userData?.placementId) {
            obj = obj.parent;
          }
          if (obj?.userData?.placementId) {
            if (
              curMode === 'studio' &&
              curActiveMat &&
              obj.userData?.slotIndex !== undefined &&
              placeCb
            ) {
              placeCb(
                obj.userData.slotPosition || [0, 0, 0],
                obj.userData.slotNormal || [0, 1, 0],
                obj.userData.slotIndex
              );
              return;
            }
            if (selectCb) {
              selectCb(obj.userData.placementId);
              return;
            }
          }
        }
      }

      if (curMode === 'studio' && curActiveMat && placeCb) {
        const placeableMeshes = getPlaceableMeshes();
        const intersects = raycaster.intersectObjects(placeableMeshes, false);
        const hit = intersects[0];
        if (hit) {
          if (
            hit.object.userData?.slotIndex !== undefined &&
            hit.object.userData?.slotPosition &&
            hit.object.userData?.slotNormal
          ) {
            placeCb(
              hit.object.userData.slotPosition,
              hit.object.userData.slotNormal,
              hit.object.userData.slotIndex
            );
            return;
          }

          const { localPoint, worldNormal } = computeAccurateHitTransform(hit);
          const position: [number, number, number] = [
            Number(localPoint.x.toFixed(4)),
            Number(localPoint.y.toFixed(4)),
            Number(localPoint.z.toFixed(4)),
          ];
          const normal: [number, number, number] = [
            Number(worldNormal.x.toFixed(4)),
            Number(worldNormal.y.toFixed(4)),
            Number(worldNormal.z.toFixed(4)),
          ];
          placeCb(position, normal, hit.object.userData?.slotIndex);
        }
      } else if (selectCb) {
        selectCb(null);
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointermove', handlePointerMove);
    domElem.addEventListener('pointerdown', handlePointerDown);
    domElem.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 640;
      const newH = container.clientHeight || 520;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    let frameId: number;
    let tickCount = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);

      tickCount++;
      if (latestPropsRef.current.mode === 'inspector' && tickCount % 6 === 0 && container) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const currentPlacements = latestPropsRef.current.placements || [];
        const nextLabels = currentPlacements.map((p, idx) => {
          const vec = new THREE.Vector3(p.position[0], p.position[1], p.position[2]);
          vec.project(camera);
          return {
            id: p.placementId,
            index: p.slotIndex !== undefined ? p.slotIndex + 1 : idx + 1,
            x: (vec.x * 0.5 + 0.5) * w,
            y: (-(vec.y * 0.5) + 0.5) * h,
            name: p.materialName,
          };
        });
        setProjectedLabels(nextLabels);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('pointermove', handlePointerMove);
      domElem.removeEventListener('pointerdown', handlePointerDown);
      domElem.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      renderer.dispose();
    };
  }, [mode, autoRotate]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (ghostMeshRef.current) {
      scene.remove(ghostMeshRef.current);
      ghostMeshRef.current = null;
    }
    if (mode === 'studio' && activeMaterialToPlace) {
      const ghost = buildProceduralAccessoryMesh(
        activeMaterialToPlace.model3D?.meshPreset || 'scallop_shell',
        activeMaterialToPlace.colorHex,
        false,
        true
      );
      ghost.visible = false;
      scene.add(ghost);
      ghostMeshRef.current = ghost;
    }
  }, [mode, activeMaterialToPlace]);

  useEffect(() => {
    const holder = productGroupRef.current;
    if (!holder) return;

    holder.clear();

    if (productGlbUrl && productGlbUrl.trim().endsWith('.glb')) {
      const loader = new GLTFLoader();
      loader.load(
        productGlbUrl,
        (gltf) => {
          holder.clear();
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.userData.isPlaceableSurface = true;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          holder.add(gltf.scene);
        },
        undefined,
        () => {
          const fallbackGroup = buildProceduralProductGroup(
            productPreset,
            baseColor,
            strapColor,
            braceletConfig
          );
          holder.add(fallbackGroup);
        }
      );
    } else {
      const proceduralGroup = buildProceduralProductGroup(
        productPreset,
        baseColor,
        strapColor,
        braceletConfig
      );
      holder.add(proceduralGroup);
    }
  }, [productPreset, productGlbUrl, baseColor, strapColor, braceletConfig]);

  useEffect(() => {
    const holder = placementsGroupRef.current;
    if (!holder) return;

    holder.clear();

    const wristCm = braceletConfig?.wristSizeCm || 16;
    const slotCount = braceletConfig?.slotCount || 12;
    const radius = 0.95 * (wristCm / 16);
    const knotMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(strapColor || THREE_COLORS.defaultStrapRust),
      roughness: 0.55,
      metalness: 0.1,
    });
    const jumpRingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(THREE_COLORS.antiqueBrass),
      roughness: 0.3,
      metalness: 0.8,
    });

    placements.forEach((p, idx) => {
      const isSelected = p.placementId === selectedPlacementId;
      const itemGroup = buildProceduralAccessoryMesh(
        p.meshPreset || p.materialType || 'scallop_shell',
        p.color || THREE_COLORS.shellDefault,
        isSelected,
        false
      );

      let targetPosition: [number, number, number] = p.position;
      let targetNormal: [number, number, number] = p.normal;
      let targetRotation = p.rotation || 0;

      if (isBraceletMode) {
        const slotIdx = p.slotIndex !== undefined ? p.slotIndex : idx % slotCount;
        const arcSpan = Math.PI * 1.76;
        const startAngle = Math.PI / 2 + arcSpan / 2;
        const theta =
          slotCount > 1
            ? startAngle - (slotIdx / (slotCount - 1)) * arcSpan
            : Math.PI / 2;

        const isCharm =
          p.isDanglingCharm ||
          p.materialType === 'charm' ||
          (p.meshPreset || '').includes('charm') ||
          (p.meshPreset || '').includes('starfish') ||
          (p.meshPreset || '').includes('turtle');

        const radialDist = isCharm ? radius + 0.14 : radius;
        const sx = Number((Math.cos(theta) * radialDist).toFixed(4));
        const sy = Number((Math.sin(theta) * radialDist).toFixed(4));
        const nx = Number(Math.cos(theta).toFixed(4));
        const ny = Number(Math.sin(theta).toFixed(4));

        targetPosition = [sx, sy, 0];
        targetNormal = [nx, ny, 0.25];
        if (!p.rotation) {
          targetRotation = THREE.MathUtils.radToDeg(theta - Math.PI / 2);
        }

        [-0.1, 0.1].forEach((angleOff) => {
          const kTheta = theta + angleOff;
          const knotGeo = new THREE.TorusGeometry(0.048, 0.018, 10, 20);
          const knot = new THREE.Mesh(knotGeo, knotMat);
          knot.position.set(Math.cos(kTheta) * radius, Math.sin(kTheta) * radius, 0);
          knot.rotation.x = Math.PI / 2;
          knot.rotation.y = -kTheta;
          holder.add(knot);
        });

        if (isCharm) {
          const ringGeo = new THREE.TorusGeometry(0.055, 0.012, 12, 24);
          const jumpRing = new THREE.Mesh(ringGeo, jumpRingMat);
          jumpRing.position.set(
            Math.cos(theta) * (radius + 0.065),
            Math.sin(theta) * (radius + 0.065),
            0
          );
          jumpRing.rotation.z = theta;
          holder.add(jumpRing);
        }

        itemGroup.userData.slotIndex = slotIdx;
        itemGroup.userData.slotPosition = targetPosition;
        itemGroup.userData.slotNormal = targetNormal;
      }

      itemGroup.userData.placementId = p.placementId;
      itemGroup.traverse((child) => {
        child.userData.placementId = p.placementId;
        if (isBraceletMode) {
          child.userData.slotIndex = itemGroup.userData.slotIndex;
          child.userData.slotPosition = targetPosition;
          child.userData.slotNormal = targetNormal;
        }
      });

      alignGroupToSurface(
        itemGroup,
        targetPosition,
        targetNormal,
        targetRotation,
        p.scale,
        isBraceletMode ? 0.01 : 0.018
      );
      holder.add(itemGroup);
    });
  }, [placements, selectedPlacementId, isBraceletMode, braceletConfig, strapColor]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1.15, 4.1);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  if (!webglReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[380px] rounded-sm bg-coastal-mist p-6 text-center border border-coastal-line">
        <p className="text-base font-semibold text-coastal-ink">
          {t('three.webglDisabledTitle')}
        </p>
        <p className="text-sm text-coastal-slate mt-1 max-w-md">
          {t('three.webglDisabledDesc')}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden bg-gradient-to-b from-coastal-mist via-coastal-bg to-coastal-card border border-coastal-line shadow-coastal select-none ${className}`}
    >
      {/* WebGL Canvas Mount */}
      <div
        ref={mountRef}
        className={`w-full h-full min-h-[380px] ${
          mode === 'studio' && activeMaterialToPlace
            ? 'cursor-crosshair'
            : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* Top Left Mode Badge */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-coastal-card/90 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-coastal-kelp border border-coastal-line shadow-coastal backdrop-blur-md">
          {mode === 'studio' ? (
            <>
              <AppIcon name="compass" className="w-3.5 h-3.5 text-coastal-rust" />
              {isBraceletMode
                ? t('three.badgeBraceletStudio')
                : t('three.badgeSurfaceStudio')}
            </>
          ) : mode === 'inspector' ? (
            <>
              <AppIcon name="eye" className="w-3.5 h-3.5 text-coastal-kelp" />
              {t('three.badgeInspector')} ({placements.length} {t('common.positions')})
            </>
          ) : (
            <>
              <AppIcon name="compass" className="w-3.5 h-3.5 text-coastal-kelp" />
              {t('three.badgePreview')}
            </>
          )}
        </span>

        {mode === 'studio' && activeMaterialToPlace && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-coastal-rust px-3.5 py-1 text-xs font-semibold text-coastal-card shadow-coastal">
            <AppIcon name="mousePointerClick" className="w-3.5 h-3.5" />
            {isBraceletMode
              ? `${t('three.promptBraceletSlot')} ${activeMaterialToPlace.name}`
              : `${t('three.promptSurfacePlace')} ${activeMaterialToPlace.name}`}
          </span>
        )}
      </div>

      {/* Top Right Reset Camera Control */}
      <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
        <button
          type="button"
          onClick={handleResetCamera}
          title={t('three.resetCamera')}
          className="inline-flex items-center gap-1.5 rounded-full bg-coastal-card/90 hover:bg-coastal-card px-3.5 py-1.5 text-xs font-semibold text-coastal-ink border border-coastal-line shadow-coastal backdrop-blur-md transition-all"
        >
          <AppIcon name="rotateCcw" className="w-3.5 h-3.5 text-coastal-kelp" />
          {t('three.resetCamera')}
        </button>
      </div>

      {/* Inspector Mode: Numbered Callout Pins (#1, #2...) for Artisans */}
      {mode === 'inspector' &&
        projectedLabels.map((lbl) => {
          const isSelected = lbl.id === selectedPlacementId;
          return (
            <button
              key={lbl.id}
              type="button"
              onClick={() => onSelectPlacement?.(lbl.id)}
              style={{
                left: `${Math.min(Math.max(lbl.x, 24), 950)}px`,
                top: `${Math.min(Math.max(lbl.y, 24), 520)}px`,
              }}
              className={`-translate-x-1/2 -translate-y-1/2 absolute z-10 flex items-center justify-center w-6 h-6 rounded-full font-mono text-[11px] font-bold shadow-coastal transition-transform ${
                isSelected
                  ? 'bg-coastal-rust text-coastal-card scale-125 ring-2 ring-coastal-card'
                  : 'bg-coastal-kelp text-coastal-card hover:scale-110'
              }`}
              title={`#${lbl.index}: ${lbl.name}`}
            >
              {lbl.index}
            </button>
          );
        })}

      {/* Bottom Helper Hint */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-coastal-line/60 bg-coastal-card/90 px-4 py-1 text-[11px] font-medium text-coastal-ink shadow-coastal backdrop-blur-md whitespace-nowrap">
        {mode === 'studio'
          ? isBraceletMode
            ? t('three.hintBraceletStudio')
            : t('three.hintSurfaceStudio')
          : t('three.hintPreview')}
      </div>
    </div>
  );
}
