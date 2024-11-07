function getColor(d: number): string {
  return d > 70
    ? "#800026"
    : d > 60
    ? "#BD0026"
    : d > 50
    ? "#E31A1C"
    : d > 40
    ? "#FC4E2A"
    : d > 30
    ? "#FD8D3C"
    : d > 20
    ? "#FEB24C"
    : d > 10
    ? "#FED976"
    : "#FFEDA0";
}

export function style(feature: any) {
  return {
    fillColor: getColor(feature.properties.GRADIENT),
    weight: 2,
    opacity: 1,
    color: "transparent",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}
