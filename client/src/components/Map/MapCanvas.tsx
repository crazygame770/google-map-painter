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
  const [isDragging, setIsDragging] = useState(false);
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
        mapDiv.style.zIndex = '1'; // Set map to lowest z-index
        containerRef.current.appendChild(mapDiv);

        const map = new window.google.maps.Map(mapDiv, {
          center: CAPE_MAY_COORDS,
          zoom: 18,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          gestureHandling: 'none', // Disable Google Maps gestures
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
            if (projection) {
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

  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleDragMove({ evt: e });
    };

    const handleWindowMouseUp = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    if (mapRef.current) {
      const map = mapRef.current;
      const zoom = map.getZoom();

      if (zoom !== undefined) {
        const newZoom = e.evt.deltaY > 0 ? zoom - 1 : zoom + 1;
        map.setZoom(newZoom);
      }
    }
  };

  // Update the drag handlers
  const handleDragStart = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    // Enable dragging and store initial position
    stage.draggable(true);
    setIsDragging(true);
    const pos = stage.getPosition();
    console.log('Drag start:', pos);
  };

  const handleDragEnd = () => {
    const stage = stageRef.current;
    if (!stage) return;

    // Disable dragging
    stage.draggable(false);
    setIsDragging(false);
    console.log('Drag end');
  };

  const handleDragMove = (e: any) => {
    if (!mapRef.current || !isDragging) return;

    const map = mapRef.current;
    const projection = map.getProjection();
    if (!projection) return;

    const center = map.getCenter();
    if (!center) return;

    // Calculate movement delta
    const delta = {
      x: e.evt.movementX,
      y: e.evt.movementY
    };

    console.log('Drag move delta:', delta);

    // Convert screen movement to lat/lng
    const point = projection.fromLatLngToPoint(center);
    const scale = Math.pow(2, map.getZoom() || 0);

    point.x -= delta.x / scale;
    point.y -= delta.y / scale;

    const newCenter = projection.fromPointToLatLng(point);
    if (newCenter) {
      console.log('New center:', newCenter.toJSON());
      map.setCenter(newCenter);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const objectData = e.dataTransfer.getData('object');
    if (!objectData || !stageRef.current) return;

    const stage = stageRef.current;
    stage.setPointersPositions(e);
    const pointerPosition = stage.getPointerPosition();

    if (!pointerPosition) return;

    const stagePosition = {
      x: stage.x(),
      y: stage.y()
    };

    // Convert screen coordinates to stage coordinates
    const x = (pointerPosition.x - stagePosition.x) / scale;
    const y = (pointerPosition.y - stagePosition.y) / scale;

    const object: BaseMapObject = JSON.parse(objectData);
    setObjects([...objects, { ...object, x, y, rotation: 0 }]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (stageRef.current) {
      stageRef.current.setPointersPositions(e);
    }
  };

  // Update the Stage container div styling
  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Map container - lowest z-index */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }} />

      {/* Konva stage container - middle z-index */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        pointerEvents: 'all'
      }}>
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          onWheel={handleWheel}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
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
      </div>

      {/* Controls - highest z-index */}
      <MapControls
        scale={scale}
        setScale={setScale}
        rotation={rotation}
        setRotation={setRotation}
      />
    </div>
  );
}