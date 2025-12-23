import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { useMemo } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { ROUTES } from './routes';
import theme from './utils/Theme';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {

  const themeMode = useMemo(() => createTheme(theme()), []);

  return (
    <ThemeProvider theme={themeMode}>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            {
              ROUTES.filter(item => !item.layout).map((item, index) => (
                <Route key={index} path={item.path} element={item.element} />
              ))
            }
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
