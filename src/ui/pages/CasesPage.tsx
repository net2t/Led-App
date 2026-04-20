import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { db } from '../../db/db';
import type { CaseRecord } from '../../db/schema';
import CaseFormDialog from '../components/CaseFormDialog';
import { downloadCsv } from '../../services/exportCsv';

export default function CasesPage() {
  const cases = useLiveQuery(() => db.cases.toArray(), []);
  const consultants = useLiveQuery(() => db.consultants.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get('singleton'), []);

  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState('');

  const pageSize = settings?.pageSize ?? 100;

  const rows = useMemo(() => {
    const arr = (cases ?? []).slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    const q = query.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter((c) => {
      return (
        c.id.toLowerCase().includes(q) ||
        c.folderNo.toLowerCase().includes(q) ||
        (c.trademarkNo ?? '').toLowerCase().includes(q) ||
        c.nameOfApplication.toLowerCase().includes(q)
      );
    });
  }, [cases, query]);

  const cols = useMemo<GridColDef<CaseRecord>[]>(
    () => [
      {
        field: 'actions',
        headerName: '',
        width: 70,
        sortable: false,
        filterable: false,
        renderCell: (p) => (
          <Button
            component={RouterLink}
            to={`/cases/${p.row.id}`}
            size="small"
            endIcon={<OpenInNewIcon />}
          >
            Open
          </Button>
        ),
      },
      { field: 'id', headerName: 'Case ID', width: 160 },
      { field: 'folderNo', headerName: 'Folder No', width: 160 },
      { field: 'type', headerName: 'Type', width: 140 },
      { field: 'trademarkNo', headerName: 'Trademark No', width: 160 },
      { field: 'classNo', headerName: 'Class', width: 90 },
      { field: 'nameOfApplication', headerName: 'Application Name', flex: 1, minWidth: 240 },
      {
        field: 'stage',
        headerName: 'Stage',
        width: 120,
        renderCell: (p) => <Chip size="small" label={`Stage ${p.row.stage}`} color="primary" variant="outlined" />,
      },
      { field: 'subStage', headerName: 'Sub Stage', width: 180 },
      { field: 'updatedAt', headerName: 'Updated', width: 200 },
    ],
    []
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Application Record
              </Typography>
              <TextField
                size="small"
                placeholder="Search by Case ID, Folder No, Trademark No, Application Name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ minWidth: 320, flex: 1 }}
              />
              <Button variant="contained" onClick={() => setCreateOpen(true)}>
                New Record
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  const headers = [
                    'id',
                    'clientType',
                    'caseNo',
                    'folderNo',
                    'type',
                    'trademarkNo',
                    'classNo',
                    'nameOfApplication',
                    'stage',
                    'subStage',
                    'updatedAt',
                  ];
                  downloadCsv('application-record.csv', headers, rows as any);
                }}
              >
                Export CSV
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  View
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  {rows.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Most recent first. Per-page: {pageSize}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ overflow: 'hidden' }}>
        <DataGrid
          autoHeight
          rows={rows}
          columns={cols}
          getRowId={(r) => r.id}
          initialState={{
            pagination: { paginationModel: { pageSize } },
          }}
          pageSizeOptions={[25, 50, 100, 200]}
          disableRowSelectionOnClick
        />
      </Card>

      <CaseFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        consultants={consultants ?? []}
        onCreated={() => {
          setCreateOpen(false);
        }}
      />
    </Box>
  );
}
