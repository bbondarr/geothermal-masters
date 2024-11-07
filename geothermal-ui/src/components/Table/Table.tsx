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
import { useMemo } from "react";

import { DatasetSelector } from "../../store/store";
import { TableContentRow } from "./components/TableContentRow";
import { TableContentCell } from "./components/TableContentCell";
import { CostsMarker } from "../../types";

import './Table.css';

type TableCellContentT = Omit<CostsMarker, 'lowestPoint'>;

export interface TableRowI {
  color: string,
  content: TableCellContentT,
}

export function Table() {
  const datasets = useRecoilValue(DatasetSelector);

  const pointSets: TableRowI[] = useMemo(() => {
    const results: TableRowI[] = [];

    for (let set of datasets) {
      const lowestSet = set.data.find((point) => point.lowestPoint);

      if (lowestSet) {
        results.push({
          color: set.tableColor,
          content: {
            lcoe: lowestSet.lcoe,
            gradient: lowestSet.gradient,
            temperature: lowestSet.temperature,
            depth: lowestSet.depth,
            depthToBasement: lowestSet.depthToBasement,
          }
        })
      };
    }

    return results
  }, [datasets])

  const emptyRows = useMemo(() => {
    const result: JSX.Element[] = [];
    const lengthOfArr = 3 - datasets.length;

    for (let item = 0; item < lengthOfArr ;item++) {
      result.push(
        <TableContentRow key={`empty:${item}`}>
          <TableContentCell isEmptyCell={true} content={0}/>
          <TableContentCell isEmptyCell={true} content={0}/>
          <TableContentCell isEmptyCell={true} content={0}/>
          <TableContentCell isEmptyCell={true} content={0}/>
          <TableContentCell isEmptyCell={true} content={0}/>
        </TableContentRow>
      )
    }

    return result
  }, [datasets.length])

  return <Paper sx={{ boxShadow: 'none' }} className="tableContainer">
    <Typography className="tableHeader">Деталі</Typography>
    <TableContainer className="tableContentContainer">
      <MUITable className="tableContent" stickyHeader>
        <TableHead className="tableHeaderContainer">
          <TableContentRow sx={{ width: "100%" }}>
            <TableCell className="headerCell" key={"LCOE"}>LCOE - $/MWh</TableCell>
            <TableCell className="headerCell" key={"Gradient"}>Геотермічний градієнт - °C/km</TableCell>
            <TableCell className="headerCell" key={"Temperature"}>Температура на глибині - °C</TableCell>
            <TableCell className="headerCell" key={"Depth"}>Глибина - km</TableCell>
            <TableCell className="headerCell" key={"DepthToBasement"}>Глибина до фундаменту - km</TableCell>
          </TableContentRow>
        </TableHead>
        <TableBody className="tableBodyContainer">
          {
            pointSets.map((set, index) => (
              <TableContentRow
                key={index}
                sx={{ backgroundColor: set.color }}
              >
                {Object.keys(set.content).map((contentKey) => (
                  <TableContentCell key={contentKey} content={set.content[contentKey as keyof TableCellContentT]!} />
                ))}
              </TableContentRow>
            ))
          }
          { emptyRows }
        </TableBody>
      </MUITable>
    </TableContainer>
  </Paper>
  
}