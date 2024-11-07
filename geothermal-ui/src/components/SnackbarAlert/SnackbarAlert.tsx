import { Close } from '@mui/icons-material';
import {
  Alert as MuiAlert,
  AlertProps,
  AlertTitle,
  IconButton,
  Snackbar,
} from '@mui/material';
import React from 'react';
import { useRecoilState } from 'recoil';
import { SnackbarState } from '../../store/store';

export type SnackbarAlertSeverity = AlertProps['severity'];

export const Alert = React.forwardRef(function SnackbarAlert(
  props: AlertProps,
  ref: React.Ref<HTMLDivElement>
) {
  return <MuiAlert {...props} elevation={6} ref={ref} />;
});

export function SnackbarAlert() {
  const [{ severity, ...snackbarProps }, setSnackbar] =
    useRecoilState(SnackbarState);

  const clearSnackbar = () =>
    setSnackbar((snackBar) => ({ ...snackBar, open: false }));

  const handleClose = (
    _: React.SyntheticEvent<Event> | Event,
    reason: string
  ) => {
    if (reason !== 'clickaway') clearSnackbar();
  };

  return (
    <Snackbar
      anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
      {...snackbarProps}
      onClose={handleClose}
    >
      <Alert
        sx={{ maxHeight: '450px' }}
        severity={severity}
        action={
          !snackbarProps.autoHideDuration && (
            <IconButton onClick={clearSnackbar}>
              <Close />
            </IconButton>
          )
        }
      >
        <AlertTitle>{snackbarProps.title ?? snackbarProps.message}</AlertTitle>
        {snackbarProps.title && snackbarProps.message
          ? snackbarProps.message
          : null}
      </Alert>
    </Snackbar>
  );
}