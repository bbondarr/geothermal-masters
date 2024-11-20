import axios, { AxiosError } from 'axios';
import React, { FC, PropsWithChildren, useContext } from 'react';
import { SnackbarState } from '../store/store';
import { Typography } from '@mui/material';
import { useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';

const axiosClient = axios.create();

const AxiosContext = React.createContext(axiosClient);

export function useAxios() {
  return useContext(AxiosContext);
}

export const AxiosProvider: FC<PropsWithChildren> = (props) => {
  const navigate = useNavigate();
  const setSnackBar = useSetRecoilState(SnackbarState);
  
  axiosClient.interceptors.request.use((config) => {
    const keys = Object.keys(localStorage);
    const identifier = keys.filter((key) => key.endsWith('accessToken'))[0];
    config.headers.Authorization = identifier
      ? `Bearer ${localStorage.getItem(identifier)}`
      : ""
    return config
  })

  axiosClient.interceptors.response.use(
    (res) => res,
    (e) => {
      if (e instanceof AxiosError) {
        let errorText;
        const dataObj = e.response?.data.error?.data || {};

        if (e.response && 'error' in e.response.data) {
          errorText = process.env.REACT_APP_ENV === 'DEV'
            ? (<Typography component="p">
                {e.response?.data.error.message}
                <pre>{Object.keys(dataObj).map(key => `${key}: ${dataObj[key]}\n`)}</pre>
              </Typography>)
            : (<Typography component="p">{e.response?.data.error.message}</Typography>)
        } else {
          errorText = (<Typography component="p">{e.response?.data.message}</Typography>)
        }
        
        if (e.response?.status === 400) {
          setSnackBar({
            open: true,
            title: 'Error',
            message: errorText,
            severity: 'error',
          });
          throw e;
        }
        if (e.response?.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (e.response?.status === 403) {
          setSnackBar({
            open: true,
            title: 'Forbidden!',
            message: (
              <Typography component="p">
                You don't have permission to perform the action
              </Typography>
            ),
            severity: 'error',
          });

          // очистити ключі cognito
          localStorage.clear();
          navigate('/');
          throw e;
        }
        if (e.response?.status === 404) {
          window.location.href = '/not-found';
          return;
        }
        setSnackBar({
          open: true,
          title:
            'Oups! Something went wrong...',
          message: (
            <Typography component="p">
              Please, check your internet connection.
            </Typography>
          ),
          severity: 'error',
        });
        throw e;
      }
    }
  )

  return (
    <AxiosContext.Provider value={axiosClient}>
      {props.children}
    </AxiosContext.Provider>
  )
}