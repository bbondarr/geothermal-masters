import { PropsWithChildren } from "react";
import { Container } from "@mui/material";

export default function Layout(
  props: PropsWithChildren<
    {isProtectedPage?: boolean, hideHeader?: boolean}
  >) {
  return <Container sx={{ overflow: 'hidden' }}>
      {props.children}
    </Container>
}