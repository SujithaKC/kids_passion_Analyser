import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ForestGameProps {
  onGameComplete: (score: number, timeSpent: number) => void;
}

export const ForestGame = ({ onGameComplete }: ForestGameProps) => {
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(50);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [plantedSeeds, setPlantedSeeds] = useState([]);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [startTime] = useState(Date.now());
  const { toast } = useToast();
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const plotsRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const growingPlantsRef = useRef(new Map());

  const plants = {
    carrot: {
      stages: [
        { geometry: new THREE.SphereGeometry(0.1, 16, 16), height: 0.2, scale: 1, color: 0x228b22, name: "Seed" },
        { geometry: new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16), height: 0.4, scale: 1, color: 0xffa500, name: "Carrot" },
      ],
      cost: 10,
      reward: 20,
      growthDuration: 2000,
    },
    sunflower: {
      stages: [
        { geometry: new THREE.SphereGeometry(0.1, 16, 16), height: 0.2, scale: 1, color: 0x228b22, name: "Seed" },
        { geometry: new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16), height: 0.7, scale: 1, color: 0xffff00, name: "Sunflower" },
      ],
      cost: 20,
      reward: 50,
      growthDuration: 3000,
    },
    tomato: {
      stages: [
        { geometry: new THREE.SphereGeometry(0.1, 16, 16), height: 0.2, scale: 1, color: 0x228b22, name: "Seed" },
        { geometry: new THREE.SphereGeometry(0.15, 16, 16), height: 0.3, scale: 1, color: 0xff0000, name: "Tomato" },
      ],
      cost: 30,
      reward: 80,
      growthDuration: 4000,
    },
  };

  const levels = [
    { id: 1, name: "Green Pastures", plots: 4, availablePlants: ["carrot"], unlockCost: 0 },
    { id: 2, name: "Golden Fields", plots: 6, availablePlants: ["carrot", "sunflower"], unlockCost: 150 },
    { id: 3, name: "Harvest Valley", plots: 8, availablePlants: ["carrot", "sunflower", "tomato"], unlockCost: 300 },
  ];

  const currentLevelData = levels.find((level) => level.id === currentLevel);

  useEffect(() => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 10, 20);

    const camera = new THREE.PerspectiveCamera(60, 800 / 400, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 400);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const container = document.getElementById("canvas-container");
    if (container) {
      container.appendChild(renderer.domElement);
      console.log("Renderer appended to canvas-container");
    } else {
      console.error("Canvas container not found");
      return;
    }

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xfff8e1, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // Add ground
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const groundGeometry = new THREE.PlaneGeometry(12, 12);
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add fences
    const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
    const fenceGeometry = new THREE.BoxGeometry(0.2, 0.5, 12);
    const fence1 = new THREE.Mesh(fenceGeometry, fenceMaterial);
    const fence2 = new THREE.Mesh(fenceGeometry, fenceMaterial);
    fence1.position.set(6, 0.25, 0);
    fence2.position.set(-6, 0.25, 0);
    fence1.castShadow = fence2.castShadow = true;
    scene.add(fence1, fence2);

    // Add plots
    plotsRef.current = [];
    for (let i = 0; i < currentLevelData.plots; i++) {
      const plotGeometry = new THREE.BoxGeometry(1, 0.1, 1);
      const plotMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
      const plot = new THREE.Mesh(plotGeometry, plotMaterial);
      plot.position.set((i % 4) * 2 - 3, 0.05, Math.floor(i / 4) * 2 - 2);
      plot.name = `plot${i}`;
      plot.userData = { plant: null, stage: 0, plantType: null };
      plot.receiveShadow = true;
      scene.add(plot);
      plotsRef.current.push(plot);
    }

    // Animation loop
    const animate = (time) => {
      requestAnimationFrame(animate);
      growingPlantsRef.current.forEach(({ plant, startTime, duration, targetStage, plantType }, plantId) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const { height: startHeight, scale: startScale } = plants[plantType].stages[targetStage - 1];
        const { height: endHeight, scale: endScale } = plants[plantType].stages[targetStage];
        plant.position.y = startHeight + (endHeight - startHeight) * progress;
        plant.scale.set(
          startScale + (endScale - startScale) * progress,
          startScale + (endScale - startScale) * progress,
          startScale + (endScale - startScale) * progress
        );
        plant.rotation.y += 0.005;
        if (progress === 1) {
          growingPlantsRef.current.delete(plantId);
          setPlantedSeeds((prev) =>
            prev.map((seed) => (seed.id === plantId ? { ...seed, stage: targetStage } : seed))
          );
        }
      });
      controls.update();
      renderer.render(scene, camera);
    };
    requestAnimationFrame(animate);

    // Click handler for planting
    const handleClick = (event) => {
      if (!selectedSeed || coins < plants[selectedSeed].cost) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(plotsRef.current);

      if (intersects.length > 0) {
        const plot = intersects[0].object;
        if (!plot.userData.plant) {
          plantSeed(plot, selectedSeed);
        }
      }
    };

    renderer.domElement.addEventListener("click", handleClick);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = 800 / 400;
      camera.updateProjectionMatrix();
      renderer.setSize(800, 400);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      renderer.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
        console.log("Renderer removed from canvas-container");
      } else {
        console.warn("Renderer DOM element not removed; not a child of container or container not found");
      }
      renderer.dispose();
    };
  }, [currentLevel, selectedSeed]);

  const selectSeed = (plantType) => {
    setSelectedSeed(plantType);
    toast({
      title: `🌱 ${plantType.charAt(0).toUpperCase() + plantType.slice(1)} Selected`,
      description: `Click a plot to plant the seed!`,
      duration: 2000,
    });
    console.log(`Selected seed: ${plantType}`);
  };

  const plantSeed = (plot, plantType) => {
    if (plantedSeeds.length >= currentLevelData.plots) {
      toast({ title: "🚫 Plot Limit Reached", description: "All plots are occupied!", duration: 2000 });
      return;
    }

    setCoins((prev) => prev - plants[plantType].cost);
    const plantId = `plant${plantedSeeds.length + 1}`;
    setPlantedSeeds((prev) => [...prev, { id: plantId, plot: plot.name, type: plantType, stage: 0 }]);
    setScore((prev) => prev + 10);

    toast({
      title: "🌱 Seed Planted!",
      description: `You planted a ${plantType} in ${currentLevelData.name}!`,
      duration: 2000,
    });

    const { geometry, height, color } = plants[plantType].stages[0];
    const material = new THREE.MeshStandardMaterial({ color });
    const plant = new THREE.Mesh(geometry, material);
    plant.position.set(plot.position.x, height, plot.position.z);
    plant.castShadow = true;
    plant.name = plantId;
    sceneRef.current.add(plant);

    plot.userData = { plant, stage: 0, plantType };
    console.log(`Planted ${plantType} on plot ${plot.name}`);
  };

  const waterPlant = () => {
    const plot = plotsRef.current.find(
      (p) => p.userData.plant && p.userData.stage < plants[p.userData.plantType].stages.length - 1
    );
    if (!plot) {
      toast({ title: "🚫 No Plants to Water", description: "Plant seeds or wait for growth!", duration: 2000 });
      return;
    }

    const plantId = plot.userData.plant.name;
    const plantType = plot.userData.plantType;
    const newStage = plot.userData.stage + 1;

    toast({
      title: "💧 Watering Plant!",
      description: `Your ${plantType} is growing!`,
      duration: 2000,
    });

    sceneRef.current.remove(plot.userData.plant);
    const { geometry, height, color } = plants[plantType].stages[newStage];
    const material = new THREE.MeshStandardMaterial({ color });
    const newPlant = new THREE.Mesh(geometry, material);
    newPlant.position.set(plot.position.x, plants[plantType].stages[plot.userData.stage].height, plot.position.z);
    newPlant.castShadow = true;
    newPlant.name = plantId;
    sceneRef.current.add(newPlant);
    plot.userData.plant = newPlant;

    growingPlantsRef.current.set(plantId, {
      plant: newPlant,
      startTime: performance.now(),
      duration: plants[plantType].growthDuration,
      targetStage: newStage,
      plantType,
    });

    plot.userData.stage = newStage;
    setScore((prev) => prev + 20);
    console.log(`Watering ${plantType} on plot ${plot.name} to stage ${newStage}`);
    checkLevelComplete();
  };

  const harvestPlant = () => {
    const plot = plotsRef.current.find(
      (p) => p.userData.plant && p.userData.stage === plants[p.userData.plantType].stages.length - 1
    );
    if (!plot) {
      toast({ title: "🚫 No Plants to Harvest", description: "Wait for plants to fully grow!", duration: 2000 });
      return;
    }

    const plantId = plot.userData.plant.name;
    const plantType = plot.userData.plantType;
    setCoins((prev) => prev + plants[plantType].reward);
    setPlantedSeeds((prev) => prev.filter((seed) => seed.id !== plantId));
    setScore((prev) => prev + 30);

    toast({
      title: "🌾 Plant Harvested!",
      description: `You harvested a ${plantType} for ${plants[plantType].reward} coins!`,
      duration: 2000,
    });

    sceneRef.current.remove(plot.userData.plant);
    plot.userData = { plant: null, stage: 0, plantType: null };
    growingPlantsRef.current.delete(plantId);
    console.log(`Harvested ${plantType} from plot ${plot.name}`);
    checkLevelComplete();
  };

  const unlockNextLevel = () => {
    const nextLevel = levels.find((level) => level.id === currentLevel + 1);
    if (nextLevel && coins >= nextLevel.unlockCost) {
      setCoins((prev) => prev - nextLevel.unlockCost);
      setCurrentLevel(currentLevel + 1);
      setPlantedSeeds([]);
      setSelectedSeed(null);
      plotsRef.current.forEach((plot) => {
        if (plot.userData.plant) {
          sceneRef.current.remove(plot.userData.plant);
          plot.userData = { plant: null, stage: 0, plantType: null };
        }
      });
      growingPlantsRef.current.clear();
      toast({
        title: `🌟 Level Unlocked!`,
        description: `Welcome to ${nextLevel.name}!`,
        duration: 2000,
      });
      console.log(`Unlocked level ${nextLevel.id}: ${nextLevel.name}`);
    } else {
      toast({
        title: "🔒 Not Enough Coins!",
        description: `You need ${nextLevel.unlockCost} coins to unlock ${nextLevel.name}.`,
        duration: 2000,
      });
    }
  };

  const checkLevelComplete = () => {
    const allGrownAndHarvested =
      plantedSeeds.length === 0 && plotsRef.current.every((plot) => !plot.userData.plant);
    if (allGrownAndHarvested && currentLevel < levels.length) {
      toast({
        title: `🌾 Level ${currentLevel} Cleared!`,
        description: `Unlock ${levels.find((l) => l.id === currentLevel + 1).name} for ${levels.find((l) => l.id === currentLevel + 1).unlockCost} coins!`,
        duration: 2000,
      });
    } else if (allGrownAndHarvested && currentLevel === levels.length) {
      endGame();
    }
  };

  const endGame = () => {
    const timeSpent = (Date.now() - startTime) / 1000;
    onGameComplete(score, timeSpent);
    toast({
      title: "🚜 Harvest Haven Complete!",
      description: `You scored ${score} points and earned ${coins} coins!`,
      duration: 3000,
    });
    console.log(`Game ended with score ${score} and coins ${coins}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="text-6xl animate-pulse">🌾</div>
        <h1 className="text-4xl font-bold text-green-800">Harvest Haven</h1>
        <p className="text-lg text-green-600">
          Select a seed, click plots to plant, water to grow, and harvest crops!
        </p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-green-100/50 to-emerald-100/50">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-bold text-green-800">Score: {score} | Coins: {coins}</div>
          <div className="text-lg text-green-800">
            Plots: {plantedSeeds.length}/{currentLevelData.plots} | Level: {currentLevel}
          </div>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          {currentLevelData.availablePlants.map((plantType) => (
            <Button
              key={plantType}
              onClick={() => selectSeed(plantType)}
              disabled={coins < plants[plantType].cost}
              className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-lg ${coins < plants[plantType].cost ? "opacity-50 cursor-not-allowed" : ""} ${selectedSeed === plantType ? "ring-2 ring-green-800" : ""}`}
            >
              {plantType.charAt(0).toUpperCase() + plantType.slice(1)} ({plants[plantType].cost} coins)
            </Button>
          ))}
          <Button
            onClick={waterPlant}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-lg"
          >
            💧 Water Crop
          </Button>
          <Button
            onClick={harvestPlant}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-lg"
          >
            🌾 Harvest
          </Button>
          {currentLevel < levels.length && (
            <Button
              onClick={unlockNextLevel}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 text-lg"
            >
              🔓 Unlock Next Level ({levels[currentLevel].unlockCost} coins)
            </Button>
          )}
        </div>

        <div className="relative">
          <div id="canvas-container" className="w-full h-[400px] rounded-lg" />
          <div className="absolute bottom-4 left-4 bg-green-800/80 text-white px-4 py-2 rounded">
            {currentLevelData.name}
          </div>
          <div className="absolute top-4 left-4 bg-green-800/80 text-white px-4 py-2 rounded">
            Rotate: Drag | Plant: Select Seed & Click Plot | Water/Harvest: Click Buttons
          </div>
        </div>

        {plantedSeeds.length > 0 && (
          <div className="bg-green-100/50 rounded-lg p-4 mt-6">
            <h4 className="font-bold text-green-800 mb-2">Your Farm:</h4>
            <div className="flex flex-wrap gap-2">
              {plantedSeeds.map((seed, index) => (
                <span key={index} className="text-lg text-green-700">
                  {seed.type.charAt(0).toUpperCase() + seed.type.slice(1)} ({plants[seed.type].stages[seed.stage].name})
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <Button
            onClick={endGame}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
          >
            <Sprout className="w-5 h-5 mr-2" />
            End Farming
          </Button>
        </div>
      </Card>
    </div>
  );
};