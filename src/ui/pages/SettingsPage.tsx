import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import { db } from '../../db/db';

export default function SettingsPage() {
  const settings = useLiveQuery(() => db.settings.get('singleton'), []);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const [routineX, setRoutineX] = useState('0');
  const [urgentY, setUrgentY] = useState('0');
  const [premiumZ, setPremiumZ] = useState('0');
  const [pageSize, setPageSize] = useState('100');

  if (settings && routineX === '0' && urgentY === '0' && premiumZ === '0' && pageSize === '100') {
    // Initialize once
    queueMicrotask(() => {
      setRoutineX(String(settings.rates.routineX));
      setUrgentY(String(settings.rates.urgentY));
      setPremiumZ(String(settings.rates.premiumZ));
      setPageSize(String(settings.pageSize));
    });
  }

  async function save() {
    setError('');
    setOk('');
    try {
      await db.settings.put({
        id: 'singleton',
        rates: {
          routineX: Number(routineX) || 0,
          urgentY: Number(urgentY) || 0,
          premiumZ: Number(premiumZ) || 0,
        },
        pageSize: Number(pageSize) || 100,
      });
      setOk('Saved');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save');
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {ok && <Alert severity="success">{ok}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Settings
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Default rates (X/Y/Z) and table settings.
          </Typography>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <TextField label="Routine (X) Rate" value={routineX} onChange={(e) => setRoutineX(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Urgent (Y) Rate" value={urgentY} onChange={(e) => setUrgentY(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Premium (Z) Rate" value={premiumZ} onChange={(e) => setPremiumZ(e.target.value)} fullWidth />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField label="Default Per-Page" value={pageSize} onChange={(e) => setPageSize(e.target.value)} fullWidth />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" onClick={save}>
                Save
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
