import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  RotateCcw, 
  Camera, 
  Sparkles, 
  Award,
  Heart,
  Save,
  Trash2,
  Star,
  Palette,
  Shirt,
  ShoppingBag,
  Crown,
  Footprints
} from "lucide-react";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { useGame } from '@/context/GameContext';

interface FashionGameProps {
  onBack: () => void;
  onGameComplete: (score: number, timeSpent: number) => void;
}

interface ClothingPiece {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'dress' | 'accessory' | 'shoes';
  color: string;
  texture?: string;
  price: number;
  style: string;
  mesh?: THREE.Mesh;
  position: THREE.Vector3;
  scale: THREE.Vector3;
  rotation?: THREE.Euler;
}

const FashionGame: React.FC<FashionGameProps> = ({ onBack, onGameComplete }) => {
  const { recordGameSession } = useGame();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [selectedCategory, setSelectedCategory] = useState<string>('top');
  const [equippedItems, setEquippedItems] = useState<Map<string, ClothingPiece>>(new Map());
  const [availableItems, setAvailableItems] = useState<ClothingPiece[]>([]);
  const [outfitScore, setOutfitScore] = useState({
    style: 0,
    color: 0,
    completeness: 0,
    creativity: 0,
    total: 0
  });
  const [favorites, setFavorites] = useState<string[]>([]);

  // Initialize clothing collection with 3D meshes
  useEffect(() => {
    const items: ClothingPiece[] = [
      // Tops
      {
        id: 'top1',
        name: 'Casual T-Shirt',
        category: 'top',
        color: '#ff69b4',
        price: 50,
        style: 'casual',
        position: new THREE.Vector3(0, 1.2, 0.1),
        scale: new THREE.Vector3(1.2, 0.8, 0.6),
        rotation: new THREE.Euler(0, 0, 0)
      },
      {
        id: 'top2',
        name: 'Elegant Blouse',
        category: 'top',
        color: '#ffffff',
        price: 80,
        style: 'formal',
        position: new THREE.Vector3(0, 1.2, 0.1),
        scale: new THREE.Vector3(1.2, 0.9, 0.5),
        rotation: new THREE.Euler(0, 0, 0)
      },
      {
        id: 'top3',
        name: 'Party Top',
        category: 'top',
        color: '#ffd700',
        price: 120,
        style: 'party',
        position: new THREE.Vector3(0, 1.2, 0.1),
        scale: new THREE.Vector3(1.2, 0.7, 0.7),
        rotation: new THREE.Euler(0, 0, 0)
      },
      
      // Bottoms
      {
        id: 'bottom1',
        name: 'Denim Jeans',
        category: 'bottom',
        color: '#0000ff',
        price: 60,
        style: 'casual',
        position: new THREE.Vector3(0, 0.6, 0.1),
        scale: new THREE.Vector3(0.9, 1.0, 0.6),
        rotation: new THREE.Euler(0, 0, 0)
      },
      {
        id: 'bottom2',
        name: 'Flowing Skirt',
        category: 'bottom',
        color: '#ff69b4',
        price: 70,
        style: 'bohemian',
        position: new THREE.Vector3(0, 0.6, 0.1),
        scale: new THREE.Vector3(1.1, 0.8, 0.8),
        rotation: new THREE.Euler(0, 0, 0)
      },
      {
        id: 'bottom3',
        name: 'Formal Trousers',
        category: 'bottom',
        color: '#000000',
        price: 90,
        style: 'formal',
        position: new THREE.Vector3(0, 0.6, 0.1),
        scale: new THREE.Vector3(0.8, 1.0, 0.5),
        rotation: new THREE.Euler(0, 0, 0)
      },
      
      // Dresses
      {
        id: 'dress1',
        name: 'Elegant Gown',
        category: 'dress',
        color: '#800080',
        price: 200,
        style: 'formal',
        position: new THREE.Vector3(0, 1.0, 0.1),
        scale: new THREE.Vector3(1.3, 1.8, 0.8),
        rotation: new THREE.Euler(0, 0, 0)
      },
      {
        id: 'dress2',
        name: 'Summer Dress',
        category: 'dress',
        color: '#ffff00',
        price: 85,
        style: 'casual',
        position: new THREE.Vector3(0, 1.0, 0.1),
        scale: new THREE.Vector3(1.2, 1.6, 0.7),
        rotation: new THREE.Euler(0, 0, 0)
      },
      
      // Accessories
      {
        id: 'acc1',
        name: 'Sun Hat',
        category: 'accessory',
        color: '#ffff00',
        price: 30,
        style: 'casual',
        position: new THREE.Vector3(0, 2.2, 0.2),
        scale: new THREE.Vector3(0.8, 0.3, 0.8),
        rotation: new THREE.Euler(0, 0, 0)
      },
      {
        id: 'acc2',
        name: 'Sunglasses',
        category: 'accessory',
        color: '#000000',
        price: 40,
        style: 'cool',
        position: new THREE.Vector3(0, 2.0, 0.35),
        scale: new THREE.Vector3(0.8, 0.2, 0.2),
        rotation: new THREE.Euler(0, 0, 0)
      },
      {
        id: 'acc3',
        name: 'Necklace',
        category: 'accessory',
        color: '#ffd700',
        price: 60,
        style: 'formal',
        position: new THREE.Vector3(0, 1.5, 0.25),
        scale: new THREE.Vector3(0.5, 0.1, 0.1),
        rotation: new THREE.Euler(0, 0, 0)
      },
      
      // Shoes
      {
        id: 'shoe1',
        name: 'Sneakers',
        category: 'shoes',
        color: '#ffffff',
        price: 50,
        style: 'sporty',
        position: new THREE.Vector3(0.3, 0.1, 0.1),
        scale: new THREE.Vector3(0.4, 0.3, 0.8),
        rotation: new THREE.Euler(0, 0, 0)
      },
      {
        id: 'shoe2',
        name: 'High Heels',
        category: 'shoes',
        color: '#ff0000',
        price: 80,
        style: 'formal',
        position: new THREE.Vector3(0.3, 0.1, 0.1),
        scale: new THREE.Vector3(0.3, 0.4, 0.7),
        rotation: new THREE.Euler(0, 0, 0)
      },
      {
        id: 'shoe3',
        name: 'Boots',
        category: 'shoes',
        color: '#8b4513',
        price: 100,
        style: 'edgy',
        position: new THREE.Vector3(0.3, 0.1, 0.1),
        scale: new THREE.Vector3(0.4, 0.5, 0.8),
        rotation: new THREE.Euler(0, 0, 0)
      }
    ];
    
    setAvailableItems(items);
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 20);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(4, 2, 6);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.enableZoom = true;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.receiveShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    const d = 10;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 15;
    scene.add(directionalLight);

    // Fill lights
    const fillLight1 = new THREE.PointLight(0xffaaff, 0.5);
    fillLight1.position.set(-3, 2, 3);
    scene.add(fillLight1);

    const fillLight2 = new THREE.PointLight(0xaaffff, 0.5);
    fillLight2.position.set(3, 1, -2);
    scene.add(fillLight2);

    // Decorative lights
    const pointLight1 = new THREE.PointLight(0xff00ff, 0.3);
    pointLight1.position.set(2, 3, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 0.3);
    pointLight2.position.set(-2, 3, -2);
    scene.add(pointLight2);

    // Floor with pattern
    const floorGeometry = new THREE.CircleGeometry(8, 32);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a4a,
      emissive: 0x0a0a1a,
      roughness: 0.4,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Decorative rings
    const ringGeometry = new THREE.TorusGeometry(2, 0.05, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4, emissive: 0x330033 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring2.rotation.x = Math.PI / 2;
    ring2.scale.set(0.7, 0.7, 0.7);
    ring2.position.y = 0.02;
    scene.add(ring2);

    // Create base model
    createFashionModel(scene);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Animate floating accessories
      if (modelRef.current) {
        modelRef.current.children.forEach(child => {
          if (child.userData?.isFloating) {
            child.position.y += Math.sin(Date.now() * 0.002) * 0.002;
          }
        });
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Mouse click handler for selecting items
    const handleClick = (event: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;

      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);
      
      for (const intersect of intersects) {
        if (intersect.object.userData?.isClothing) {
          handleItemClick(intersect.object.userData.itemId);
          break;
        }
      }
    };

    mountRef.current.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  // Create fashionable 3D model
  const createFashionModel = (scene: THREE.Scene) => {
    const group = new THREE.Group();

    // Body with better proportions
    const bodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.4, 32);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0xffdbac,
      roughness: 0.3,
      emissive: 0x221100
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.3;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Head with details
    const headGeo = new THREE.SphereGeometry(0.45, 32);
    const headMat = new THREE.MeshStandardMaterial({ 
      color: 0xffdbac,
      roughness: 0.2,
      emissive: 0x221100
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.1;
    head.castShadow = true;
    head.receiveShadow = true;
    group.add(head);

    // Eyes with sparkle
    const eyeGeo = new THREE.SphereGeometry(0.08, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x4a2e1e });
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.15, 2.2, 0.4);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.15, 2.2, 0.4);
    group.add(rightEye);

    // Eye sparkles
    const sparkleGeo = new THREE.SphereGeometry(0.02, 8);
    const sparkleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaaaaa });
    
    const leftSparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
    leftSparkle.position.set(-0.17, 2.22, 0.45);
    group.add(leftSparkle);
    
    const rightSparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
    rightSparkle.position.set(0.13, 2.22, 0.45);
    group.add(rightSparkle);

    // Blush
    const blushGeo = new THREE.SphereGeometry(0.05, 8);
    const blushMat = new THREE.MeshStandardMaterial({ color: 0xffa5a5, emissive: 0x330000 });
    
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.25, 2.05, 0.4);
    group.add(leftBlush);
    
    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.25, 2.05, 0.4);
    group.add(rightBlush);

    // Smile
    const smileGeo = new THREE.TorusGeometry(0.1, 0.02, 8, 24, Math.PI);
    const smileMat = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
    const smile = new THREE.Mesh(smileGeo, smileMat);
    smile.position.set(0, 2.0, 0.4);
    smile.rotation.x = Math.PI / 2;
    smile.rotation.z = Math.PI;
    group.add(smile);

    // Arms with style
    const armGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.0, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.85, 1.6, 0);
    leftArm.rotation.z = 0.2;
    leftArm.rotation.x = 0.1;
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.85, 1.6, 0);
    rightArm.rotation.z = -0.2;
    rightArm.rotation.x = -0.1;
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;
    group.add(rightArm);

    // Hands
    const handGeo = new THREE.SphereGeometry(0.12, 8);
    const handMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });

    const leftHand = new THREE.Mesh(handGeo, handMat);
    leftHand.position.set(-1.2, 1.2, 0.1);
    leftHand.castShadow = true;
    leftHand.receiveShadow = true;
    group.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, handMat);
    rightHand.position.set(1.2, 1.2, 0.1);
    rightHand.castShadow = true;
    rightHand.receiveShadow = true;
    group.add(rightHand);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });

    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.3, 0.5, 0);
    leftLeg.castShadow = true;
    leftLeg.receiveShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.3, 0.5, 0);
    rightLeg.castShadow = true;
    rightLeg.receiveShadow = true;
    group.add(rightLeg);

    // Feet
    const footGeo = new THREE.BoxGeometry(0.25, 0.1, 0.4);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    const leftFoot = new THREE.Mesh(footGeo, footMat);
    leftFoot.position.set(-0.3, 0.0, 0.1);
    leftFoot.castShadow = true;
    leftFoot.receiveShadow = true;
    group.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, footMat);
    rightFoot.position.set(0.3, 0.0, 0.1);
    rightFoot.castShadow = true;
    rightFoot.receiveShadow = true;
    group.add(rightFoot);

    group.position.y = 0;
    modelRef.current = group;
    scene.add(group);
  };

  // Add clothing item to model
  const addClothingItem = (item: ClothingPiece) => {
    if (!modelRef.current) return;

    // Remove existing item of same category
    const itemsToRemove: THREE.Object3D[] = [];
    modelRef.current.children.forEach(child => {
      if (child.userData?.category === item.category) {
        itemsToRemove.push(child);
      }
    });
    
    itemsToRemove.forEach(child => modelRef.current?.remove(child));

    // Create new clothing mesh
    const geometry = new THREE.BoxGeometry(item.scale.x, item.scale.y, item.scale.z);
    
    // Create material with some texture
    const material = new THREE.MeshStandardMaterial({ 
      color: item.color,
      roughness: 0.3,
      metalness: 0.1,
      emissive: new THREE.Color(item.color).multiplyScalar(0.2)
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(item.position);
    mesh.rotation.copy(item.rotation || new THREE.Euler(0, 0, 0));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add some details based on category
    if (item.category === 'dress') {
      // Add decorative belt
      const beltGeo = new THREE.TorusGeometry(0.7, 0.05, 8, 32);
      const beltMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.position.set(0, 1.0, 0.1);
      belt.rotation.x = Math.PI / 2;
      belt.scale.set(1, 1, 0.3);
      mesh.add(belt);
    }
    
    if (item.category === 'accessory' && item.name === 'Sunglasses') {
      // Add lenses
      const lensGeo = new THREE.SphereGeometry(0.15, 8);
      const lensMat = new THREE.MeshStandardMaterial({ color: 0x333333, emissive: 0x111111 });
      
      const leftLens = new THREE.Mesh(lensGeo, lensMat);
      leftLens.position.set(-0.2, 0, -0.1);
      mesh.add(leftLens);
      
      const rightLens = new THREE.Mesh(lensGeo, lensMat);
      rightLens.position.set(0.2, 0, -0.1);
      mesh.add(rightLens);
    }

    mesh.userData = {
      isClothing: true,
      itemId: item.id,
      category: item.category,
      isFloating: item.category === 'accessory'
    };

    modelRef.current.add(mesh);
    
    // Update equipped items
    setEquippedItems(prev => {
      const newMap = new Map(prev);
      newMap.set(item.category, item);
      return newMap;
    });

    // Calculate and update score
    calculateOutfitScore();
    
    // Add points for styling
    setScore(prev => prev + item.price);
  };

  const calculateOutfitScore = () => {
    const items = Array.from(equippedItems.values());
    
    let styleScore = 0;
    let colorScore = 0;
    let completenessScore = 0;
    let creativityScore = 0;

    if (items.length === 0) {
      setOutfitScore({ style: 0, color: 0, completeness: 0, creativity: 0, total: 0 });
      return;
    }

    // Style cohesion
    const styles = items.map(i => i.style);
    const uniqueStyles = new Set(styles);
    if (uniqueStyles.size === 1 && styles.length > 0) {
      styleScore = 100; // All items match style
    } else if (uniqueStyles.size === 2) {
      styleScore = 70; // Mix of two styles
    } else {
      styleScore = 40; // Eclectic mix
    }

    // Color harmony
    if (items.length >= 2) {
      const colors = items.map(i => i.color);
      // Simple color matching logic
      if (new Set(colors).size === 1) {
        colorScore = 100; // Monochromatic
      } else {
        colorScore = 60; // Mixed
      }
    }

    // Completeness
    const requiredCategories = ['top', 'bottom', 'shoes'];
    const hasRequired = requiredCategories.every(cat => 
      items.some(i => i.category === cat)
    );
    completenessScore = hasRequired ? 100 : 50;

    // Creativity (based on unique combinations)
    const uniqueCombos = new Set(items.map(i => `${i.category}-${i.id}`)).size;
    creativityScore = Math.min(uniqueCombos * 20, 100);

    const total = Math.round((styleScore + colorScore + completenessScore + creativityScore) / 4);

    setOutfitScore({
      style: styleScore,
      color: colorScore,
      completeness: completenessScore,
      creativity: creativityScore,
      total
    });
  };

  const handleItemClick = (itemId: string) => {
    const item = availableItems.find(i => i.id === itemId);
    if (item) {
      addClothingItem(item);
    }
  };

  const saveOutfit = async () => {
    if (!auth.currentUser) return;

    try {
      const outfitData = {
        userId: auth.currentUser.uid,
        items: Array.from(equippedItems.values()),
        score: outfitScore.total,
        totalValue: score,
        timestamp: serverTimestamp(),
        favorites: favorites.length
      };

      await addDoc(collection(db, 'fashion_outfits'), outfitData);
      
      // Show success message
      alert('✨ Outfit saved to your collection!');
    } catch (error) {
      console.error('Error saving outfit:', error);
    }
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const clearOutfit = () => {
    if (!modelRef.current) return;

    // Remove all clothing items
    const itemsToRemove: THREE.Object3D[] = [];
    modelRef.current.children.forEach(child => {
      if (child.userData?.isClothing) {
        itemsToRemove.push(child);
      }
    });
    
    itemsToRemove.forEach(child => modelRef.current?.remove(child));
    setEquippedItems(new Map());
    setOutfitScore({ style: 0, color: 0, completeness: 0, creativity: 0, total: 0 });
  };

  const endGame = async () => {
    const timeSpent = (Date.now() - startTime) / 1000;
    
    // Record game session
    recordGameSession({
      gameType: 'Fashion Design',
      score: score,
      timeSpent: timeSpent,
      timestamp: Date.now()
    });

    // Save final outfit to Firebase
    if (auth.currentUser && equippedItems.size > 0) {
      await saveOutfit();
    }

    onGameComplete(score, timeSpent);
    onBack();
  };

  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
    }
  };

  const filteredItems = availableItems.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="ghost" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Games
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur px-6 py-2 rounded-full border border-white/20">
              <span className="text-lg font-bold text-white">Score: {score}</span>
            </div>
            
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2 rounded-full">
              <span className="text-lg font-bold text-white">Style: {outfitScore.total}%</span>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D Viewer */}
          <Card className="lg:col-span-3 p-4 bg-black/30 backdrop-blur border-white/10">
            <div 
              ref={mountRef} 
              className="w-full h-[600px] rounded-lg overflow-hidden"
            />
            
            {/* Controls */}
            <div className="flex justify-center gap-4 mt-4">
              <Button 
                onClick={toggleAutoRotate}
                variant="outline"
                className="bg-white/10 text-white border-white/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> 
                {controlsRef.current?.autoRotate ? 'Stop' : 'Auto'} Rotate
              </Button>
              
              <Button 
                onClick={saveOutfit}
                variant="outline"
                className="bg-white/10 text-white border-white/20"
                disabled={equippedItems.size === 0}
              >
                <Save className="w-4 h-4 mr-2" /> Save Outfit
              </Button>
              
              <Button 
                onClick={clearOutfit}
                variant="outline"
                className="bg-white/10 text-white border-white/20"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>
          </Card>

          {/* Wardrobe Panel */}
          <Card className="p-4 bg-black/40 backdrop-blur border-white/10 overflow-y-auto max-h-[700px]">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-pink-400" />
              Fashion Studio
            </h2>

            {/* Style Stats */}
            <div className="mb-6 p-3 bg-white/5 rounded-lg">
              <h3 className="text-sm font-semibold text-pink-300 mb-2">Style Score</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Style Cohesion</span>
                    <span>{outfitScore.style}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className="bg-pink-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${outfitScore.style}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Color Harmony</span>
                    <span>{outfitScore.color}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${outfitScore.color}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-white/70">
                    <span>Completeness</span>
                    <span>{outfitScore.completeness}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${outfitScore.completeness}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['all', 'top', 'bottom', 'dress', 'accessory', 'shoes'].map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  size="sm"
                  className={selectedCategory === cat 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500' 
                    : 'bg-white/10 text-white border-white/20'
                  }
                >
                  {cat === 'top' && <Shirt className="w-3 h-3 mr-1" />}
                  {cat === 'shoes' && <Footprints className="w-3 h-3 mr-1" />}
                  {cat === 'accessory' && <Crown className="w-3 h-3 mr-1" />}
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>

            {/* Clothing Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {filteredItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  variant="outline"
                  className="h-auto py-3 px-2 flex flex-col items-center gap-1 bg-white/5 border-white/10 hover:bg-white/20"
                  style={{
                    borderColor: equippedItems.has(item.category) && 
                               equippedItems.get(item.category)?.id === item.id 
                               ? item.color 
                               : undefined,
                    boxShadow: equippedItems.has(item.category) && 
                              equippedItems.get(item.category)?.id === item.id
                              ? `0 0 10px ${item.color}`
                              : undefined
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full mb-1"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium text-white">{item.name}</span>
                  <span className="text-xs text-yellow-400">{item.price} ⭐</span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-6 w-6 mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                  >
                    <Heart 
                      className={`w-3 h-3 ${
                        favorites.includes(item.id) ? 'fill-pink-500 text-pink-500' : 'text-white/50'
                      }`}
                    />
                  </Button>
                </Button>
              ))}
            </div>

            {/* Current Outfit Summary */}
            <Card className="p-3 bg-white/5 border-white/10">
              <h3 className="font-semibold text-white mb-2 text-sm">Current Look</h3>
              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                <div className="p-1 bg-white/10 rounded">
                  <Shirt className="w-3 h-3 mx-auto mb-1 text-pink-400" />
                  <span className="text-white/70">Top</span>
                </div>
                <div className="p-1 bg-white/10 rounded">
                  <ShoppingBag className="w-3 h-3 mx-auto mb-1 text-purple-400" />
                  <span className="text-white/70">Bottom</span>
                </div>
                <div className="p-1 bg-white/10 rounded">
                  <Crown className="w-3 h-3 mx-auto mb-1 text-blue-400" />
                  <span className="text-white/70">Accessory</span>
                </div>
                <div className="p-1 bg-white/10 rounded">
                  <Footprints className="w-3 h-3 mx-auto mb-1 text-green-400" />
                  <span className="text-white/70">Shoes</span>
                </div>
              </div>
            </Card>

            {/* Finish Button */}
            <Button 
              onClick={endGame}
              className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              <Award className="w-4 h-4 mr-2" /> Finish & Save Collection
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FashionGame;