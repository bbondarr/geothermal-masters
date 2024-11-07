import { useEffect, useState } from "react";
import { Location } from "../types";

const SHOW_COAL_MINES = false;

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    fetch("/Coal-Plants.csv")
      .then((response) => response.text())
      .then((text) => {
        const rows = text.split("\n").slice(1); // Remove the first row (header)
        const parsedLocations = rows.map((row) => {
          const columns = row.split(",");
          return {
            lat: parseFloat(columns[6]), // Assuming column 6 is latitude
            lng: parseFloat(columns[7]), // Assuming column 7 is longitude
          };
        });
        setLocations(parsedLocations);
      });
  }, []);

  return {
    locations: SHOW_COAL_MINES ? locations : [],
  };
}
