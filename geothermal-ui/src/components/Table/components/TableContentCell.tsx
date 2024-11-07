import { TableCell } from "@mui/material";

import './TableContentCell.css';

interface TableContentCellProp {
  content: number,
  isEmptyCell?: boolean
}

export function TableContentCell({ content, isEmptyCell }: TableContentCellProp) {
  return <TableCell
    className="tableContentCell"
  >
    {isEmptyCell
      ? <></>
      : content
    }
  </TableCell>;
}
