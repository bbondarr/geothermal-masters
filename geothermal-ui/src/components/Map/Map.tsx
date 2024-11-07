import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { Location } from "../../types";
import { useMarker } from "../../hooks/useMarker";
import { ColorState } from "../../store/store";
import { CircularProgress } from "@mui/material";

import './Map.css';
import { MapControls } from "../MapControls/MapControls";

interface MapProps {
  locations: Location[],
}

export function MapContainer({ locations }: Readonly<MapProps>) {
  const addMarker = useMarker();
  const { chartColor } = useRecoilValue(ColorState);
  const [loading, setLoading] = useState(false);
  const googleMapRef = useRef(null);
  const [mapState, setMapState] = useState<google.maps.Map>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setMarkersList] = 
    useState<google.maps.marker.AdvancedMarkerElement[]>([]);
    
  const [clickedLatLng, setClickedLatLng] = useState({ lat: 0, lng: 0 });

  const handleAddMarker = useCallback(async () => {
    if (mapState) {
      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
      const pinBackground = new PinElement({
        background: chartColor
      })

      const marker = new AdvancedMarkerElement({
        position: new google.maps.LatLng(clickedLatLng.lat, clickedLatLng.lng),
        map: mapState,
        content: pinBackground.element
      })

      setMarkersList((prevState) => {
        const newState = [...prevState];

        // markers max length === 3
        if (newState.length === 3) {
          // delete marker from map and state
          newState[0].map = null;
          newState.shift();
        };

        newState.push(marker);
        return newState
      })
    }
  }, [mapState, clickedLatLng, chartColor])

  const clearMarkers = () => {
    setMarkersList((prevState) => {
      prevState.forEach((marker) => marker.map = null);
      return []
    })
  }

  const handleAdd = () => {
    setLoading(true)
    addMarker.mutateAsync({location: clickedLatLng})
      .then(() => handleAddMarker())
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  }

  const initializeMap = useCallback(async () => {
    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const { Marker } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
    const googleMap = new Map(
      googleMapRef.current as any,
      {
        zoom: 5,
        center: { lat: 37.0902, lng: -95.7129 },
        mapId: 'mapId'
      },
    );
    
    setMapState(googleMap);

    locations.forEach(location => {
      return new Marker({
        position: new google.maps.LatLng(location.lat, location.lng),
        map: googleMap,
        icon: {
          url: '/building-icon.png',
          scaledSize: new google.maps.Size(25, 25),
        },
      });
    });
    
    googleMap.addListener('click', (mapsMouseEvent: any) => setClickedLatLng(mapsMouseEvent.latLng.toJSON()));
  }, [locations])

  useEffect(() => {
    if (clickedLatLng.lat && clickedLatLng.lng) {
      handleAdd();
    }
  }, [clickedLatLng])

  useEffect(() => {
    initializeMap()
  }, [initializeMap])

  return (
    <div className="googleMap">
      <MapControls
        addMarker={(location) => setClickedLatLng(location)}
        clearMarkerState={clearMarkers}
      />
      {loading && <CircularProgress size={100} className='googleLoadingStatus' color='primary' />}
      <div 
        ref={googleMapRef} 
        style={{ width: '100%', height: '500px' }}
        className={loading ? 'isLoading' : ''}
      ></div>
    </div>
  );
}