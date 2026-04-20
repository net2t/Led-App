import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { exportBackup, importBackup } from '../../services/backup';

export default function BackupPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [mode, setMode] = useState<'replace' | 'merge'>('replace');

  async function onImport(file: File) {
    setError('');
    setOk('');
    try {
      await importBackup(file, mode);
      setOk('Import complete');
    } catch (e: any) {
      setError(e?.message ?? 'Import failed');
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {ok && <Alert severity="success">{ok}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Backup
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Export/Import your local database as a JSON file.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => exportBackup()}>
              Export Backup
            </Button>

            <TextField label="Import Mode" select value={mode} onChange={(e) => setMode(e.target.value as any)} size="small">
              <MenuItem value="replace">Replace</MenuItem>
              <MenuItem value="merge">Merge</MenuItem>
            </TextField>

            <Button variant="outlined" onClick={() => fileRef.current?.click()}>
              Import Backup
            </Button>
            <input
              ref={fileRef}
              hidden
              type="file"
              accept="application/json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
                e.currentTarget.value = '';
              }}
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
