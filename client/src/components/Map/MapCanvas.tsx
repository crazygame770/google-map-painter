import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { GridOverlay } from './GridOverlay';
import { MapControls } from './MapControls';
import { ObjectShape } from './ObjectShape';
import { Loader } from '@googlemaps/js-api-loader';
import { useToast } from '@/hooks/use-toast';
import { BaseMapObject } from '@/lib/objects';

const CAPE_MAY_COORDS = {
  lat: 38.9351,
  lng: -74.9060
};

interface PlacedObject extends BaseMapObject {
  x: number;
  y: number;
  rotation: number;
}

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const stageRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [objects, setObjects] = useState<PlacedObject[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    // Initialize Google Maps
    const initMap = async () => {
      if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        toast({
          title: "Error",
          description: "Google Maps API key is not configured",
          variant: "destructive"
        });
        return;
      }

      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["maps"]
        });

        await loader.load();

        if (!containerRef.current) return;

        // Create a container for the map
        const mapDiv = document.createElement('div');
        mapDiv.style.width = '100%';
        mapDiv.style.height = '100%';
        mapDiv.style.position = 'absolute';
        mapDiv.style.top = '0';
        mapDiv.style.left = '0';
        containerRef.current.appendChild(mapDiv);

        const map = new window.google.maps.Map(mapDiv, {
          center: CAPE_MAY_COORDS,
          zoom: 18,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          gestureHandling: 'cooperative',
          tilt: 0
        });

        mapRef.current = map;
        setMapLoaded(true);

        // Sync map zoom with canvas scale
        map.addListener('zoom_changed', () => {
          const zoom = map.getZoom();
          if (zoom !== undefined) {
            const newScale = Math.pow(2, zoom - 18);
            setScale(newScale);
          }
        });

        // Sync map center with canvas position
        map.addListener('center_changed', () => {
          const center = map.getCenter();
          if (center && map.getProjection()) {
            const projection = map.getProjection();
            const centerPoint = projection.fromLatLngToPoint(center);
            const initialPoint = projection.fromLatLngToPoint(
              new google.maps.LatLng(CAPE_MAY_COORDS)
            );

            if (centerPoint && initialPoint) {
              setPosition({
                x: (centerPoint.x - initialPoint.x) * scale,
                y: (centerPoint.y - initialPoint.y) * scale
              });
            }
          }
        });

      } catch (error) {
        console.error('Error loading Google Maps:', error);
        toast({
          title: "Error",
          description: "Failed to load Google Maps",
          variant: "destructive"
        });
      }
    };

    updateDimensions();
    initMap();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    if (mapRef.current) {
      const map = mapRef.current;
      const zoom = map.getZoom();

      if (zoom !== undefined) {
        map.setZoom(e.evt.deltaY > 0 ? zoom - 1 : zoom + 1);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const objectData = e.dataTransfer.getData('object');
    if (!objectData || !stageRef.current) return;

    const object: BaseMapObject = JSON.parse(objectData);
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    const stagePosition = stage.position();

    // Convert screen coordinates to stage coordinates
    const x = (pointerPosition.x - stagePosition.x) / scale;
    const y = (pointerPosition.y - stagePosition.y) / scale;

    setObjects([...objects, { ...object, x, y, rotation: 0 }]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        rotation={rotation}
      >
        <Layer>
          <GridOverlay 
            width={dimensions.width} 
            height={dimensions.height} 
            scale={scale} 
          />
          {objects.map((object, index) => (
            <ObjectShape
              key={`${object.id}-${index}`}
              object={object}
              x={object.x}
              y={object.y}
              rotation={object.rotation}
            />
          ))}
        </Layer>
      </Stage>
      <MapControls
        scale={scale}
        setScale={setScale}
        rotation={rotation}
        setRotation={setRotation}
      />
    </div>
  );
}