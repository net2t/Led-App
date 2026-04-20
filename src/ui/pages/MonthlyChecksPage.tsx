import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';

import { db } from '../../db/db';
import { confirmMonthlyCheck, reassignMonthlyCheck } from '../../services/monthlyChecks';
import { ym } from '../../db/utils';

export default function MonthlyChecksPage() {
  const [month, setMonth] = useState(ym());
  const checks = useLiveQuery(() => db.monthlyChecks.where('month').equals(month).toArray(), [month]);
  const consultants = useLiveQuery(() => db.consultants.toArray(), []);
  const cases = useLiveQuery(() => db.cases.toArray(), []);

  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [action, setAction] = useState<'confirm' | 'reassign'>('confirm');
  const [notes, setNotes] = useState('');
  const [newConsultantId, setNewConsultantId] = useState<number | ''>('');

  const rows = useMemo(() => {
    const all = checks ?? [];
    const sorted = all.slice().sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    return sorted.map((ch) => {
      const cons = (consultants ?? []).find((c) => c.id === ch.consultantId);
      const c = (cases ?? []).find((x) => x.id === ch.caseId);
      return {
        ...ch,
        consultantName: cons?.name ?? `#${ch.consultantId}`,
        folderNo: c?.folderNo ?? '',
        application: c?.nameOfApplication ?? '',
      };
    });
  }, [checks, consultants, cases]);

  const cols = useMemo<GridColDef<any>[]>(
    () => [
      { field: 'month', headerName: 'Month', width: 100 },
      { field: 'folderNo', headerName: 'Folder No', width: 150 },
      { field: 'application', headerName: 'Application', flex: 1, minWidth: 200 },
      { field: 'consultantName', headerName: 'Consultant', width: 180 },
      {
        field: 'stage',
        headerName: 'Stage',
        width: 110,
        renderCell: (p) => <Chip size="small" label={`Stage ${p.row.stage}`} variant="outlined" color="primary" />,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: (p) => {
          const color = p.row.status === 'confirmed' ? 'success' : p.row.status === 'reassigned' ? 'warning' : 'default';
          return <Chip size="small" label={p.row.status} color={color as any} />;
        },
      },
      { field: 'timestamp', headerName: 'Updated', width: 200 },
      {
        field: 'actions',
        headerName: '',
        width: 160,
        sortable: false,
        filterable: false,
        renderCell: (p) => (
          <Button
            size="small"
            onClick={() => {
              setSelectedId(p.row.id);
              setAction('confirm');
              setNotes('');
              setNewConsultantId('');
              setOpen(true);
            }}
          >
            Review
          </Button>
        ),
      },
    ],
    []
  );

  async function submit() {
    setError('');
    if (selectedId == null) return;

    try {
      if (action === 'confirm') {
        await confirmMonthlyCheck(selectedId, notes);
      } else {
        if (newConsultantId === '') throw new Error('Select a new consultant');
        await reassignMonthlyCheck(selectedId, newConsultantId, notes);
      }
      setOpen(false);
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Monthly Checks
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Review progress monthly; confirm or reassign.
              </Typography>
            </Box>
            <TextField label="Month (YYYY-MM)" size="small" value={month} onChange={(e) => setMonth(e.target.value)} />
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ overflow: 'hidden' }}>
        <DataGrid
          autoHeight
          rows={rows}
          columns={cols}
          getRowId={(r) => r.id}
          initialState={{
            pagination: { paginationModel: { pageSize: 100 } },
          }}
          pageSizeOptions={[25, 50, 100, 200]}
          disableRowSelectionOnClick
        />
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Monthly Check</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Action"
                select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                fullWidth
              >
                <MenuItem value="confirm">Confirm</MenuItem>
                <MenuItem value="reassign">Reassign</MenuItem>
              </TextField>
            </Grid>
            {action === 'reassign' && (
              <Grid item xs={12}>
                <TextField
                  label="New Consultant"
                  select
                  value={newConsultantId}
                  onChange={(e) => setNewConsultantId(Number(e.target.value) as any)}
                  fullWidth
                >
                  <MenuItem value="">Select consultant</MenuItem>
                  {(consultants ?? [])
                    .filter((c) => c.active)
                    .map((c) => (
                      <MenuItem key={c.id} value={c.id!}>
                        {c.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline minRows={3} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
