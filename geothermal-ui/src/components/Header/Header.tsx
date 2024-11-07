import { Container, Link } from "@mui/material";

import './Header.css'

export function Header(props: Readonly<{ isProtected?: boolean }>) {
  return (
    <Container disableGutters className="headerContainer">
      <img src="/logo.png" alt="logo" />
      {!props.isProtected
        && (
          <Container disableGutters className="linksContainer">
            <Link color="#576965" underline="none" className="link">Company</Link>
            <Link color="#576965" underline="none" className="link">News</Link>
            <Link color="#576965" underline="none" className="link">Back to main site</Link>
          </Container>
        )
      }
    </Container>
  )
}