import { PropsWithChildren } from "react";
import { Container } from "@mui/material";
import { Header } from "../Header/Header";

export default function Layout(
  props: PropsWithChildren<
    {isProtectedPage?: boolean, hideHeader?: boolean}
  >) {
  return <Container
    sx={{ overflow: 'hidden' }}
  >
      {!props.hideHeader && <Header isProtected={props.isProtectedPage} />}
      {props.children}
    </Container>
}