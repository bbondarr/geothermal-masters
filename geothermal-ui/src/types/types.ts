import { AlertProps, SnackbarProps } from "@mui/material";

export type SnackbarAlertSeverity = AlertProps["severity"];

export type SnackbarStateProps = Pick<
  SnackbarProps,
  "open" | "message" | "autoHideDuration"
> & { title?: string; severity: SnackbarAlertSeverity };
