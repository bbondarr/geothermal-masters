import {
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { FiberManualRecord } from "@mui/icons-material";

import "./AdminTitle.css";

export function AdminTitle() {
  return (
    <Container disableGutters className="adminTitleContainer">
      <Typography
        variant="h1"
        fontSize={"60px"}
        fontWeight={500}
        paddingBottom={"60px"}
      >
        Калькулятор LCOE. Адміністративна сторінка
      </Typography>
      <Container disableGutters className="adminTextContainer">
        <Typography fontWeight="bold">
          На цій сторінці можна змінювати геологічні файли програми та задавати
          інженерні та геологічні константи, такі як:
        </Typography>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemIcon className="redCycle">
              <FiberManualRecord sx={{ fontSize: "0.5rem" }} />
            </ListItemIcon>
            <ListItemText>
              GIS-файл з чотирма шарами: Глибина до фундаменту, 300, 400 та 500
              ізотерми
            </ListItemText>
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon className="redCycle">
              <FiberManualRecord sx={{ fontSize: "0.5rem" }} />
            </ListItemIcon>
            <ListItemText>
              Інженерні параметри геотермального генератора та резервуара
            </ListItemText>
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon className="redCycle">
              <FiberManualRecord sx={{ fontSize: "0.5rem" }} />
            </ListItemIcon>
            <ListItemText>
              Цінові параметри капітальних вкладень (без урахування податків)
            </ListItemText>
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon className="redCycle">
              <FiberManualRecord sx={{ fontSize: "0.5rem" }} />
            </ListItemIcon>
            <ListItemText>
              Цінові параметри операційних витрат (без урахування податків)
            </ListItemText>
          </ListItem>
        </List>
      </Container>
      {/* Image Gallery Section */}
      <div style={{ marginTop: "30px" }}>
        <img
          src="/plant3.jpeg"
          alt="Description 1"
          style={{
            display: 'block',
            width: "100%",
            marginBottom: "15px",
          }}
        />
        <img
          src="/plant2.webp"
          alt="Description 1"
          style={{
            display: 'block',
            width: "100%", 
            marginBottom: "15px",
          }}
        />
        {/* Add more images as needed */}
      </div>
    </Container>
  );
}
