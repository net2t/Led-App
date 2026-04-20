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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';

import { db } from '../../db/db';
import type { ConsultantRecord } from '../../db/schema';
import { createConsultant, updateConsultant } from '../../services/consultants';

export default function ConsultantsPage() {
  const consultants = useLiveQuery(() => db.consultants.toArray(), []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ConsultantRecord | null>(null);
  const [error, setError] = useState('');

  const rows = useMemo(
    () => (consultants ?? []).slice().sort((a, b) => (a.name > b.name ? 1 : -1)),
    [consultants]
  );

  const cols = useMemo<GridColDef<ConsultantRecord>[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
      { field: 'city', headerName: 'City', width: 140 },
      { field: 'contact', headerName: 'Contact', width: 200 },
      {
        field: 'active',
        headerName: 'Active',
        width: 120,
        renderCell: (p) => (p.row.active ? 'Yes' : 'No'),
      },
      {
        field: 'actions',
        headerName: '',
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (p) => (
          <Button
            size="small"
            onClick={() => {
              setEditing(p.row);
              setOpen(true);
            }}
          >
            Edit
          </Button>
        ),
      },
    ],
    []
  );

  async function save() {
    setError('');
    try {
      if (!editing) return;
      if (editing.id == null) {
        await createConsultant({
          name: editing.name,
          contact: editing.contact,
          city: editing.city,
          active: editing.active ?? true,
        });
      } else {
        await updateConsultant(editing.id, {
          name: editing.name,
          contact: editing.contact,
          city: editing.city,
          active: editing.active,
        });
      }
      setOpen(false);
      setEditing(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save');
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, flex: 1 }}>
            Consultants
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditing({ name: '', contact: '', city: '', active: true });
              setOpen(true);
            }}
          >
            New Consultant
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ overflow: 'hidden' }}>
        <DataGrid
          autoHeight
          rows={rows}
          columns={cols}
          getRowId={(r) => r.id!}
          initialState={{
            pagination: { paginationModel: { pageSize: 100 } },
          }}
          pageSizeOptions={[25, 50, 100, 200]}
          disableRowSelectionOnClick
        />
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing?.id ? 'Edit Consultant' : 'New Consultant'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                value={editing?.name ?? ''}
                onChange={(e) => setEditing((x) => ({ ...(x ?? ({} as any)), name: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="City"
                value={editing?.city ?? ''}
                onChange={(e) => setEditing((x) => ({ ...(x ?? ({} as any)), city: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Contact"
                value={editing?.contact ?? ''}
                onChange={(e) => setEditing((x) => ({ ...(x ?? ({} as any)), contact: e.target.value }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editing?.active ?? true}
                    onChange={(e) => setEditing((x) => ({ ...(x ?? ({} as any)), active: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
