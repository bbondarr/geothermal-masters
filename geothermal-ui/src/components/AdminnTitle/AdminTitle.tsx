import { Container, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { FiberManualRecord } from "@mui/icons-material";

import "./AdminTitle.css";


export function AdminTitle() {
  return (
    <Container disableGutters className="adminTitleContainer">
      <Typography
        variant="h1"
        fontSize={"60px"}
        fontWeight={500}
        paddingBottom={'60px'}
      >
        LCOE Calculator Administration
      </Typography>
      <Container disableGutters className="adminTextContainer">
        <Typography fontWeight="bold">
          This page allows to publish a completed and tested set of files and metadata to the main site. The files are:
        </Typography>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemIcon
              className="redCycle"
            >
              <FiberManualRecord sx={{ fontSize: '0.5rem' }} />
            </ListItemIcon>
            <ListItemText>
              GIS information file with definitions of 4 bands: Depth to basement, 300, 400, 500 isotherms
            </ListItemText>
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon
              className="redCycle"
            >
              <FiberManualRecord sx={{ fontSize: '0.5rem' }} />
            </ListItemIcon>
            <ListItemText>
              Excel Financial Model with metadata that defines the locations of the input fields and output fields
            </ListItemText>
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon
              className="redCycle"
            >
              <FiberManualRecord sx={{ fontSize: '0.5rem' }} />
            </ListItemIcon>
            <ListItemText>
              Test files that contain a set of inputs, intermediate outputs, such as depth to basement, and gradient, and outputs, such as LCOE and Capex.
            </ListItemText>
          </ListItem>
        </List>
      </Container>
      <Container disableGutters className="adminTextContainer">
        <Typography fontWeight="bold">
          The following rules are used to edit and publish the files:        </Typography>
          <List disablePadding>
          <ListItem disablePadding>
            <ListItemIcon
              className="redCycle"
            >
              <FiberManualRecord sx={{ fontSize: '0.5rem' }} />
            </ListItemIcon>
            <ListItemText>
              Any existing version can be published
            </ListItemText>
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon
              className="redCycle"
            >
              <FiberManualRecord sx={{ fontSize: '0.5rem' }} />
            </ListItemIcon>
            <ListItemText>
              Edit always modifies the latest version if it is not published
            </ListItemText>
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon
              className="redCycle"
            >
              <FiberManualRecord sx={{ fontSize: '0.5rem' }} />
            </ListItemIcon>
            <ListItemText>
              If the latest version is published, editing results in creating a new version.
            </ListItemText>
          </ListItem>
        </List>
      </Container>
    </Container>
  )
}