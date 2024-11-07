import { TableRow, TableRowProps } from "@mui/material";

import './TableContentRow.css';
import { PropsWithChildren } from "react";

export const TableContentRow = (
  props: PropsWithChildren<TableRowProps>,
) => {
  return <TableRow 
    className="tableContentRow"
    { ...props }
  >
    {props.children}
  </TableRow>
}

