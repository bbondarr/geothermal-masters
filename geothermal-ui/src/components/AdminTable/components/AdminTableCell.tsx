import { TableCell } from "@mui/material";
import { PropsWithChildren } from "react";

export function AdminTableCell(props: PropsWithChildren) {
  return <TableCell 
    sx={{ borderBottom: 'unset', border: '1px solid rgba(224, 224, 224, 1)' }}
    width={"16.5%"}
  >
    { props.children }
  </TableCell>
}