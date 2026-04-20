import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    h6: { fontWeight: 800 },
    button: { fontWeight: 700 },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#f25c2a',
      dark: '#d84a1f',
    },
    secondary: {
      main: '#2d2aa5',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f1f1f',
      secondary: '#5f6368',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f5f5f5',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 700,
          paddingLeft: 16,
          paddingRight: 16,
        },
        contained: {
          color: '#ffffff',
          boxShadow: '0 10px 24px rgba(242,92,42,0.18)',
          '&:hover': {
            boxShadow: '0 12px 28px rgba(242,92,42,0.24)',
          },
        },
        outlined: {
          borderColor: 'rgba(0,0,0,0.22)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 8px 18px rgba(0,0,0,0.04)',
          backgroundColor: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.18)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0,0,0,0.28)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#f25c2a',
            borderWidth: 2,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1f1f1f',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0,0,0,0.08)',
        },
      },
    },
  },
});
