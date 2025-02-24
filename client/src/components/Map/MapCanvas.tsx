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
  const [isDragging, setIsDragging] = useState(false);
  const [pressedKeys, setPressedKeys] = useState(new Set<string>());

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
            const newScale = Math.pow(2, zoom - 18); // Adjust base zoom level as needed
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

  // Update the wheel handler to sync grid with map zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    if (mapRef.current) {
      const map = mapRef.current;
      const zoom = map.getZoom();

      if (zoom !== undefined) {
        const zoomDelta = e.evt.deltaY > 0 ? -0.5 : 0.5;
        const newZoom = zoom + zoomDelta;
        const clampedZoom = Math.min(Math.max(newZoom, 15), 20);
        
        // Update map zoom
        map.setZoom(clampedZoom);
      }
    }
  };

  // Add map zoom change listener to keep grid in sync
  useEffect(() => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    const zoomListener = () => {
      const zoom = map.getZoom();
      if (zoom !== undefined) {
        // Calculate scale based on map's world coordinates
        const TILE_SIZE = 256;
        const scale = TILE_SIZE * Math.pow(2, zoom - 18);
        setScale(scale);
      }
    };

    const centerListener = () => {
      const center = map.getCenter();
      const projection = map.getProjection();
      if (!center || !projection) return;

      const initialLatLng = new google.maps.LatLng(CAPE_MAY_COORDS);
      const point = projection.fromLatLngToPoint(center);
      const initialPoint = projection.fromLatLngToPoint(initialLatLng);

      if (point && initialPoint) {
        const zoom = map.getZoom() || 18;
        const TILE_SIZE = 256;
        const worldScale = Math.pow(2, zoom);
        
        // Calculate position in world coordinates
        setPosition({
          x: (point.x - initialPoint.x) * TILE_SIZE * worldScale,
          y: (point.y - initialPoint.y) * TILE_SIZE * worldScale
        });
      }
    };

    map.addListener('zoom_changed', zoomListener);
    map.addListener('center_changed', centerListener);

    // Initial sync
    zoomListener();
    centerListener();

    return () => {
      google.maps.event.clearListeners(map, 'zoom_changed');
      google.maps.event.clearListeners(map, 'center_changed');
    };
  }, []);

  // Handle continuous key movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.add(e.key);
        return next;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(e.key);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update the continuous movement effect for keyboard
  useEffect(() => {
    if (!mapRef.current || pressedKeys.size === 0) return;

    const map = mapRef.current;
    const step = 150; // Increased from 50 to 150 for faster keyboard movement
    
    const moveMap = () => {
      const center = map.getCenter();
      const projection = map.getProjection();
      if (!center || !projection) return;

      const point = projection.fromLatLngToPoint(center);
      if (!point) return;

      const scale = Math.pow(2, map.getZoom() || 0);
      
      // Increase movement speed significantly
      if (pressedKeys.has('ArrowUp')) point.y -= step / (128 * scale);
      if (pressedKeys.has('ArrowDown')) point.y += step / (128 * scale);
      if (pressedKeys.has('ArrowLeft')) point.x -= step / (128 * scale);
      if (pressedKeys.has('ArrowRight')) point.x += step / (128 * scale);

      const newCenter = projection.fromPointToLatLng(point);
      if (newCenter) {
        map.setCenter(newCenter);
      }
    };

    const intervalId = setInterval(moveMap, 16);
    return () => clearInterval(intervalId);
  }, [pressedKeys]);

  // Update drag handlers for better sensitivity
  const handleDragStart = (e: any) => {
    if (e.evt.button !== 0) return;
    e.evt.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Update the drag handler to properly move the grid
  const handleDragMove = (e: any) => {
    if (!isDragging || !mapRef.current) return;

    const map = mapRef.current;
    const projection = map.getProjection();
    const center = map.getCenter();
    
    if (!projection || !center) return;

    const point = projection.fromLatLngToPoint(center);
    if (!point) return;

    const zoom = map.getZoom() || 18;
    const TILE_SIZE = 256;
    const worldScale = Math.pow(2, zoom);
    
    // Calculate movement in world coordinates
    const movementX = e.evt.movementX || e.evt.deltaX || 0;
    const movementY = e.evt.movementY || e.evt.deltaY || 0;

    point.x -= movementX / (TILE_SIZE * worldScale);
    point.y -= movementY / (TILE_SIZE * worldScale);

    const newCenter = projection.fromPointToLatLng(point);
    if (newCenter) {
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
      tabIndex={0} // Make div focusable for keyboard events
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
        pointerEvents: 'all',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}>
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          onWheel={handleWheel}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onMouseMove={handleDragMove}
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
        mapRef={mapRef}
      />
    </div>
  );
}