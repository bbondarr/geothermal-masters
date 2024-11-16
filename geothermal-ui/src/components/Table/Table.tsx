import {
  Table as MUITable,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Typography,
  TableHead,
} from "@mui/material";
import { useRecoilValue } from "recoil";
import { useMemo, useRef, useState } from "react";

import { DatasetSelector } from "../../store/store";
import { TableContentRow } from "./components/TableContentRow";
import { TableContentCell } from "./components/TableContentCell";
import { CostsMarker } from "../../types";

import "./Table.css";

type TableCellContentT = Omit<CostsMarker, "lowestPoint">;
type TableCellSubContentT = { npv10?: number; irr?: number };

export interface TableRowI {
  color: string;
  content: TableCellContentT;
}

export function Table() {
  const datasets = useRecoilValue(DatasetSelector);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const tableRef = useRef<HTMLDivElement | null>(null);

  const handleRowClick = (
    index: number,
    event: React.MouseEvent<HTMLTableRowElement>
  ) => {
    setSelectedRowIndex(index);

    if (event.currentTarget && tableRef.current) {
      const rowRect = event.currentTarget.getBoundingClientRect();
      const tableRect = tableRef.current.getBoundingClientRect();

      setPopupPosition({
        top: rowRect.top - tableRect.top,
        left: rowRect.right - tableRect.left + 10,
      });
    }
  };

  // Function to close the pop-up
  const handleClosePopup = () => {
    setSelectedRowIndex(null);
  };

  const pointSets: TableRowI[] = useMemo(() => {
    const results: TableRowI[] = [];

    for (let set of datasets) {
      const lowestSet = set.data.find((point) => point.lowestPoint);

      if (lowestSet) {
        results.push({
          color: set.tableColor,
          content: {
            lcoe: lowestSet.lcoe,
            npv10: lowestSet.npv10,
            irr: lowestSet.irr,
            gradient: lowestSet.gradient,
            temperature: lowestSet.temperature,
            depth: lowestSet.depth,
            depthToBasement: lowestSet.depthToBasement,
          },
        });
      }
    }

    return results;
  }, [datasets]);

  const emptyRows = useMemo(() => {
    const result: JSX.Element[] = [];
    const lengthOfArr = 3 - datasets.length;

    for (let item = 0; item < lengthOfArr; item++) {
      result.push(
        <TableContentRow key={`empty:${item}`}>
          <TableContentCell isEmptyCell={true} content={0} />
          <TableContentCell isEmptyCell={true} content={0} />
          <TableContentCell isEmptyCell={true} content={0} />
          <TableContentCell isEmptyCell={true} content={0} />
          <TableContentCell isEmptyCell={true} content={0} />
        </TableContentRow>
      );
    }

    return result;
  }, [datasets.length]);

  return (
    <Paper sx={{ boxShadow: "none" }} className="tableContainer">
      <Typography className="tableHeader">Деталі</Typography>
      <TableContainer className="tableContentContainer">
        <MUITable className="tableContent" stickyHeader>
          <TableHead className="tableHeaderContainer">
            <TableContentRow sx={{ width: "100%" }}>
              <TableCell className="headerCell" key={"LCOE"}>
                LCOE - $/MWh
              </TableCell>
              <TableCell className="headerCell" key={"NPV10"}>
                NPV 10 - $MM
              </TableCell>
              <TableCell className="headerCell" key={"IRR"}>
                IRR - %
              </TableCell>
              <TableCell className="headerCell" key={"Gradient"}>
                Геотермічний градієнт - °C/km
              </TableCell>
              <TableCell className="headerCell" key={"Temperature"}>
                Температура на глибині - °C
              </TableCell>
              <TableCell className="headerCell" key={"Depth"}>
                Глибина - km
              </TableCell>
              <TableCell className="headerCell" key={"DepthToBasement"}>
                Глибина до фундаменту - km
              </TableCell>
            </TableContentRow>
          </TableHead>
          <TableBody className="tableBodyContainer">
            {pointSets.map((set, index) => (
              <TableContentRow
                key={index}
                sx={{ backgroundColor: set.color }}
                onClick={(event) => handleRowClick(index, event)}
              >
                {Object.keys(set.content).map((contentKey) => (
                  <TableContentCell
                    key={contentKey}
                    content={
                      set.content[contentKey as keyof TableCellContentT]!
                    }
                  />
                ))}
              </TableContentRow>
            ))}
            {emptyRows}
          </TableBody>
        </MUITable>

        {/* {selectedRowIndex !== null && (
          <div
            style={{
              ...popupStyles.popup,
              top: popupPosition.top,
              left: popupPosition.left,
              backgroundColor: pointSets[selectedRowIndex].color,
            }}
          >
            <button onClick={handleClosePopup} style={popupStyles.closeButton}>
              x
            </button>
            <TableHead className="tableHeaderContainer">
              <TableContentRow sx={{ width: "100%" }}>
                <TableCell className="headerCell" key={"NPV10"}>
                  NPV10 - $MM
                </TableCell>
                <TableCell className="headerCell" key={"IRR"}>
                  IRR - %
                </TableCell>
              </TableContentRow>
            </TableHead>
            <TableBody className="tableBodyContainer">
              {pointSets.map((set, index) => (
                <TableContentRow
                  key={index}
                  sx={{ backgroundColor: set.color }}
                  onClick={(event) => handleRowClick(index, event)}
                >
                  {Object.keys(set.subContent).map((contentKey) => (
                    <TableContentCell
                      key={contentKey}
                      content={
                        set.subContent[contentKey as keyof TableCellSubContentT]!
                      }
                    />
                  ))}
                </TableContentRow>
              ))}
              {emptyRows}
            </TableBody>
            {/* <p>{`NPV10: ${pointSets[selectedRowIndex].subContent.npv10}`}</p>
            <p>{`IRR: ${pointSets[selectedRowIndex].subContent.irr}`}</p> */}
       
      </TableContainer>
    </Paper>
  );
}

const popupStyles: { [k in string]: React.CSSProperties } = {
  popup: {
    fontFamily: "Neue Haas Grotesk Text",
    fontSize: "0.75rem",
    position: "relative",
    width: "400px",
    padding: "10px",
    paddingLeft: "25px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    textAlign: "left",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
  },
};
