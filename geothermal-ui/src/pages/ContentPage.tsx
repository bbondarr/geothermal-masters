import { useEffect, useMemo, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader"
import { Box, CircularProgress, Container } from "@mui/material";

import Layout from "../components/Layout/Layout";
import { Chart } from "../components/Chart/Chart";
import { LeafletMap } from "../components/Leaflet/Leaflet";
import { MapContainer } from "../components/Map/Map";
import { Table } from "../components/Table/Table";
import { useLocations } from "../hooks/useLocations";

import './ContentPage.css';
import { useLocation } from "react-router-dom";

export function ContentPage() {
  const [googleKeyValidationStatus, setGoogleKeyValidationStatus] = useState<boolean>(false);
  const [validationLoadingStatus, setValidationLoadingStatus] = useState<boolean>(false);
  const { locations } = useLocations();
  const location = useLocation();

  const loader = useMemo(() => {
    return new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_KEY!,
      version: "weekly",
      libraries: ['visualization']
    });
  }, [])

  useEffect(() => {
    setValidationLoadingStatus(true)
    loader.load()
      .then(() => setGoogleKeyValidationStatus(true))
      .catch((e) => console.error(e))
      .finally(() => setValidationLoadingStatus(false))
  }, [loader]) 

  return (
    <Layout hideHeader={true}>
      {validationLoadingStatus && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress
              size={100}
              color="inherit"
              sx={{ textAlign: 'center' }}
            />
          </Box>
        )
      }
      { googleKeyValidationStatus ? location.pathname === '/googleMap'
          ? <MapContainer locations={locations} />
          : <LeafletMap />
        : null
      }
      <Container
        disableGutters
        className="lowestPointInfoContainer"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.5rem'
        }}
      >
        <Chart />
        <Table />
      </Container>
    </Layout>
  )
};
