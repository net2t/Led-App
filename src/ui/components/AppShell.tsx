import { PropsWithChildren, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PaymentsIcon from '@mui/icons-material/Payments';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 280;

type NavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
};

export default function AppShell({ children }: PropsWithChildren) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const items: NavItem[] = useMemo(
    () => [
      { label: 'Dashboard & Reports', to: '/dashboard', icon: <DashboardIcon /> },
      { label: 'Application Record', to: '/cases', icon: <FolderIcon /> },
      { label: 'Ledger System', to: '/payments', icon: <PaymentsIcon /> },
      { label: 'Consultants', to: '/consultants', icon: <PeopleIcon /> },
      { label: 'Monthly Checks', to: '/monthly-checks', icon: <EventRepeatIcon /> },
      { label: 'Backup', to: '/backup', icon: <CloudUploadIcon /> },
      { label: 'Settings', to: '/settings', icon: <SettingsIcon /> },
    ],
    []
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1 }}>
        <Badge
          variant="dot"
          color="secondary"
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: 'primary.main',
              boxShadow: '0 10px 24px rgba(242,92,42,0.25)',
            }}
          />
        </Badge>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            BRANDEX Ledger
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Local-first • IndexedDB
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 1, flex: 1 }}>
        {items.map((it) => {
          const selected = location.pathname === it.to || location.pathname.startsWith(it.to + '/');
          return (
            <ListItemButton
              key={it.to}
              component={RouterLink}
              to={it.to}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'rgba(242,92,42,0.10)',
                  color: 'text.primary',
                  borderLeft: '4px solid',
                  borderLeftColor: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{it.icon}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ px: 2, pb: 2, color: 'text.secondary' }}>
        <Typography variant="caption">v0.1</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        elevation={0}
        position="fixed"
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {items.find((i) => location.pathname.startsWith(i.to))?.label ?? 'Case Manager'}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Local DB
          </Typography>
        </Toolbar>
      </AppBar>

      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(0,0,0,0.06)',
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
