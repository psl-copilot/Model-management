import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { useMemo } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { ROUTES } from './routes';
import theme from './utils/Theme';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layout/MainLayout';
import { Toaster } from "react-hot-toast";
import PrivateRoute from './routes/PrivateRoute';
import { ModalProvider } from './contexts/ModalContext';

function App() {

  const themeMode = useMemo(() => createTheme(theme()), []);

  const privateWithLayoutRoutes = ROUTES.filter(route => route.private === true && route.layout === true);

  const publicNoLayoutRoutes = ROUTES.filter(route => route.private === false && route.layout === false);

  const privateWithoutLayoutRoutes = ROUTES.filter(route => route.private === true && route.layout === false);
  return (
    <ThemeProvider theme={themeMode}>
      <ModalProvider>
        <BrowserRouter>
          <Toaster position="top-right" reverseOrder={false} />
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route >
                {
                  publicNoLayoutRoutes.map((item, index) => (
                    <Route key={index} path={item.path} element={item.element} />
                  ))
                }
              </Route>
            </Route>
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                {
                  privateWithLayoutRoutes.map((item, index) => (
                    <Route key={index} path={item.path} element={item.element} />
                  ))
                }
              </Route>
              <Route>
                {
                  privateWithoutLayoutRoutes.map((item, index) => (
                    <Route key={index} path={item.path} element={item.element} />
                  ))
                }
              </Route>
            </Route>
            

          </Routes>
        </BrowserRouter>
      </ModalProvider>
    </ThemeProvider>
  )
}

export default App
