import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosProvider, useAxios } from './context/axios';
import { ContentPage } from './pages/ContentPage';
import Login from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { Admin } from './pages/Admin';
import { IFramePage } from './pages/IFrame';
import { ThemeProvider, createTheme } from '@mui/material';
import { SnackbarAlert } from './components/SnackbarAlert/SnackbarAlert';

const queryClient = new QueryClient();

const theme = createTheme({
  typography: {
    fontFamily: 'Neue Haas Grotesk Text'
  },
})

function App() {
  const axios = useAxios();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API}/health`)
      .then(response => console.log("Health status: ", response.data))
      .catch(error => console.error('There was an error!', error));
  }, [axios]);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AxiosProvider>
          <ThemeProvider theme={theme}>
            <div className="App">
              <Routes>
                <Route path='/' element={<ContentPage />} />
                <Route path='/googleMap' element={<ContentPage />} />
                <Route path='/iframe' element={<IFramePage />} />
                <Route path='/googleMap/iframe' element={<IFramePage url={`${window.location.origin}/googleMap`} />} />
                <Route path='/login' element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  <Route path='/admin' element={<Admin />} />
                </Route>
              </Routes>
              <SnackbarAlert />
            </div>
          </ThemeProvider>
        </AxiosProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
