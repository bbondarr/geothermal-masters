import { Dot } from "recharts"

export function CustomDot(props: any) {
  if (props.payload && props.payload.lowestPoint) {
    return <Dot {...props} />
  }
  return <></>
}