import { Box, Button, Container, TextField } from "@mui/material";

import './MapControls.css';
import { useResetRecoilState } from "recoil";
import { useState, useMemo } from "react";
import { DatasetSelector } from "../../store/store";
import { Location } from "../../types";

interface MapControlsPropsI {
  addMarker: (location: Location) => void,
  clearMarkerState: () => void
}

export function MapControls(props: Readonly<MapControlsPropsI>) {
  const [newMarkerProps, setNewMarkerProps] = useState<{lng: number | string, lat: number | string}>({ lat: "", lng: "" })
  const [newMarkerErrors, setNewMarkerErrors] = useState<{lng: string, lat: string}>({
    lng: "",
    lat: ""
  })
  const resetDatasets = useResetRecoilState(DatasetSelector);

  const handleClear = () => {
    props.clearMarkerState()
    resetDatasets()
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, 
    fieldName: keyof typeof newMarkerProps
  ) => setNewMarkerProps((prevState) => (
      { ...prevState, [`${fieldName}`]: e.target.value ? Number(e.target.value) : e.target.value }
    ))

  const handleBlur = (
    fieldName: keyof typeof newMarkerProps
  ) => {
    const value = Number(newMarkerProps[fieldName]);
    const extremeValue = fieldName === 'lat' ? 90 : 180;

    if (value === undefined || isNaN(value)) {
      setNewMarkerErrors((prev) => ({ ...prev, [`${fieldName}`]: "Required!" }))
    } else if (value < -extremeValue || value > extremeValue) {
      setNewMarkerErrors((prev) => ({ ...prev, [`${fieldName}`]: `Invalid value. Must be between ${-extremeValue} and ${extremeValue}` }))
    } else {
      setNewMarkerErrors((prev) => ({ ...prev, [`${fieldName}`]: "" }))
    };
  }

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (newMarkerProps.lat && newMarkerProps.lng) {
      props.addMarker(
        { lat: Number(newMarkerProps.lat), lng: Number(newMarkerProps.lng) }
      )

      setNewMarkerErrors({ lng: '', lat: '' });
      setNewMarkerProps({ lng: "", lat: "" });
    }
  }

  const disableStatus = useMemo(() => {
    return !!newMarkerErrors.lng || !!newMarkerErrors.lat || typeof newMarkerProps.lng !== 'number' || typeof newMarkerProps.lat !== 'number';
  }, [newMarkerProps, newMarkerErrors])

  return (
    <Box
      sx={{ marginTop: '1rem' }}
    >
      <form
        className="markerFormContainer"
      >
        <TextField
          label="Широта"
          type="number"
          onChange={(e) => handleChange(e, 'lat')}
          onBlur={() => handleBlur('lat')}
          value={newMarkerProps.lat}
          className="markerTextInput"
          error={Boolean(newMarkerErrors.lat)}
          helperText={newMarkerErrors.lat}
        />
        <TextField
          label="Довгота"
          type="number"
          onChange={(e) => handleChange(e, 'lng')}
          onBlur={() => handleBlur('lng')}
          value={newMarkerProps.lng}
          className="markerTextInput"
          error={Boolean(newMarkerErrors.lng)}
          helperText={newMarkerErrors.lng}
        />
        <Button
          type="submit"
          variant="contained"
          className="markerBtn"
          onClick={handleSubmit}
          disabled={disableStatus}
        >
          Додати
        </Button>
      </form>
      <Container disableGutters className="settingsContainer">
        <div className="line" />
        <Container disableGutters className="settingsButtons">
          <Button 
            className="settingsBtn" 
            variant="text"
            onClick={handleClear}
          >
            Очистити
          </Button>
        </Container>
      </Container>
    </Box>
  )
};