import { Container, Typography } from "@mui/material";

import './Title.css';

export function Title() {
  return (
    <Container className="titleContainer">
      <Typography
        sx={{ marginBottom: "1.5rem" }} 
        className="titleHeader"
        variant="h1"
      >LCOE Calculator</Typography>
      <Typography>
        Instructions: Click on the map or pick you latitude and longitude to see the calculated LCOE. Loc it calculated for different temperatures….  (3 lines of text) Based on assumptions of 20 year exploitation. (i) More information on the site
      </Typography>
    </Container>
  )
}