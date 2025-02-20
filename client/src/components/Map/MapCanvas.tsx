import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { GridOverlay } from './GridOverlay';
import { MapControls } from './MapControls';
import { Loader } from '@googlemaps/js-api-loader';

declare global {
  interface Window {
    google: any;
  }
}

const CAPE_MAY_COORDS = {
  lat: 38.9351,
  lng: -74.9060
};

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);

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
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: "weekly"
        });

        await loader.load();

        if (!containerRef.current) return;

        const mapDiv = document.createElement('div');
        mapDiv.style.width = '100%';
        mapDiv.style.height = '100%';
        mapDiv.style.position = 'absolute';
        containerRef.current.appendChild(mapDiv);

        const map = new window.google.maps.Map(mapDiv, {
          center: CAPE_MAY_COORDS,
          zoom: 18,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          gestureHandling: 'cooperative'
        });

        mapRef.current = map;
        setMapLoaded(true);

        // Sync map zoom with canvas scale
        map.addListener('zoom_changed', () => {
          if (map) {
            const newScale = Math.pow(2, map.getZoom() - 18);
            setScale(newScale);
          }
        });

        // Sync map center with canvas position
        map.addListener('center_changed', () => {
          if (map) {
            const center = map.getCenter();
            if (center) {
              const projection = map.getProjection();
              const centerPoint = projection.fromLatLngToPoint(center);
              const initialPoint = projection.fromLatLngToPoint(new google.maps.LatLng(CAPE_MAY_COORDS));

              setPosition({
                x: (centerPoint.x - initialPoint.x) * scale,
                y: (centerPoint.y - initialPoint.y) * scale
              });
            }
          }
        });

      } catch (error) {
        console.error('Error loading Google Maps:', error);
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
      const scaleBy = 1.1;
      const oldScale = scale;
      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

      // Update map zoom
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(e.evt.deltaY > 0 ? currentZoom - 1 : currentZoom + 1);

      setScale(newScale);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Stage
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
          <GridOverlay width={dimensions.width} height={dimensions.height} scale={scale} />
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