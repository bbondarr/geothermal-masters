import { useCallback, useEffect, useMemo, useState } from "react"
import { CircularProgress } from "@mui/material";
import { useRecoilValue } from "recoil";
import L from 'leaflet';

import { useMarker } from "../../hooks/useMarker";
import { ColorState } from "../../store/store";
import { Location } from "../../types";
import { style } from "./utils";
import { usePolygons } from "../../hooks/usePolygons";

import 'leaflet/dist/leaflet.css';
import './LeafletContainer.css';
import { MapControls } from "../MapControls/MapControls";

export function LeafletMap() {
  // const { data, isPending } = usePolygons();
  const { chartColor } = useRecoilValue(ColorState);
  const [loading, setLoading] = useState<boolean>(false);
  const [mapState, setMapState] = useState<L.Map>();
  const [_, setMarkersState] = useState<L.Marker[]>([]);
  const { mutateAsync } = useMarker();

  // const polygons = useMemo(() => {
  //   if (data) return data
  //   return {}
  // },[data]);

  const addMarker = useCallback((location: Location, callback: () => void) => {
    setLoading(true);
    mutateAsync({ location })
      .then(callback)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [mutateAsync])
  
  const clearMarkers = () => {
    setMarkersState((prevState) => {
      prevState.map((item) => item.remove());
      return []
    })
  }

  const handleAdd = useCallback((map: L.Map ,locations: Location) => {
    if (loading) return

    addMarker(locations, () => {
      setMarkersState((prevState) => {
        const newState = [...prevState];
        
        if (newState.length === 3) {
          newState.shift()?.remove();
        };
  
        const marker = L.marker(
          [locations.lat, locations.lng],
          { 
            icon: L.divIcon({
              html: `
                <?xml version="1.0" encoding="UTF-8"?>
                <svg width="38px" height="38px" viewBox="-4 0 36 36" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g id="Vivid.JS" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="Vivid-Icons" transform="translate(-125.000000, -643.000000)">
                            <g id="Icons" transform="translate(37.000000, 169.000000)">
                                <g id="map-marker" transform="translate(78.000000, 468.000000)">
                                    <g transform="translate(10.000000, 6.000000)">
                                        <path d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z" id="Shape" fill="${chartColor}"></path>
                                        <circle id="Oval" fill="#0C0058" fill-rule="nonzero" cx="14" cy="14" r="7"></circle>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                </svg>
              `,
              className: 'iconContainer',
              iconSize: [38, 38],
              iconAnchor: [19, 35],
            })
          }
        )
        marker.addTo(map)

        return [...newState, marker];
      })
    })
  }, [addMarker, chartColor, loading]);

  const initializeMap = useCallback(() => {
    if (
      document.getElementById('map')?.childNodes.length === 0
    ) {
      const map = L.map("map").setView([37.0902, -95.7129], 5);
      setMapState(map);

      L.tileLayer('https://www.google.com/maps/vt?hl=uk&lyrs=m@189&x={x}&y={y}&z={z}',{ maxZoom: 20 }).addTo(map);
      
      // L.geoJson(polygons as any,{ 
      //   style: style
      // }).addTo(map);
    }
  }, []) 

  useEffect(() => {
    initializeMap()
  }, [initializeMap])

  useEffect(() => {
    if (mapState) {
      // remove the listener to prevent duplication
      if (mapState.hasEventListeners('click')) {
        mapState.removeEventListener('click');
      };
      mapState.addEventListener('click', ({ latlng }) => handleAdd(mapState, latlng));
    }
  }, [handleAdd, mapState])

  return (
    <div className="mapContainer">
      <MapControls
        addMarker={(location) => {
          if (mapState) {
            handleAdd(mapState, location)
          }
        }}
        clearMarkerState={clearMarkers}
      />
      {loading && <CircularProgress size={100} className="loadingStatus" color="primary"/>}
      <div
        style={loading ? {pointerEvents: 'none', opacity: 0.8} : {}}
        id="map"
      ></div>
    </div>
  )
}