import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';

import { db } from '../../db/db';
import type { PaymentRecord } from '../../db/schema';
import PaymentFormDialog from '../components/PaymentFormDialog';
import { downloadCsv } from '../../services/exportCsv';

export default function PaymentsPage() {
  const payments = useLiveQuery(() => db.payments.toArray(), []);
  const cases = useLiveQuery(() => db.cases.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get('singleton'), []);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const pageSize = settings?.pageSize ?? 100;

  const rows = useMemo(() => {
    const arr = (payments ?? []).slice().sort((a, b) => (a.dateTime < b.dateTime ? 1 : -1));
    const q = query.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter((p) => {
      return (
        p.caseId.toLowerCase().includes(q) ||
        (p.trademarkNo ?? '').toLowerCase().includes(q) ||
        (p.applicationName ?? '').toLowerCase().includes(q)
      );
    });
  }, [payments, query]);

  const caseMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const c of cases ?? []) m.set(c.id, c);
    return m;
  }, [cases]);

  const cols = useMemo<GridColDef<PaymentRecord>[]>(
    () => [
      { field: 'dateTime', headerName: 'Date/Time', width: 200 },
      {
        field: 'caseId',
        headerName: 'Case',
        width: 220,
        renderCell: (p) => {
          const c = caseMap.get(p.row.caseId);
          return c ? `${c.folderNo}` : p.row.caseId;
        },
      },
      { field: 'trademarkNo', headerName: 'Trademark No', width: 160 },
      {
        field: 'classNo',
        headerName: 'Class',
        width: 90,
        valueGetter: (params) => {
          const c = caseMap.get(params.row.caseId);
          return c?.classNo ?? '';
        },
      },
      {
        field: 'stage',
        headerName: 'Stage',
        width: 110,
        renderCell: (p) => (p.row.stage ? <Chip size="small" label={`Stage ${p.row.stage}`} variant="outlined" /> : ''),
      },
      { field: 'applicationName', headerName: 'Application', flex: 1, minWidth: 220 },
      { field: 'due', headerName: 'Due', width: 120 },
      { field: 'received', headerName: 'Received', width: 120 },
      {
        field: 'balance',
        headerName: 'Balance',
        width: 120,
        valueGetter: (params) => (Number(params.row.due) || 0) - (Number(params.row.received) || 0),
      },
      { field: 'notes', headerName: 'Notes', flex: 1, minWidth: 200 },
    ],
    [caseMap]
  );

  const totals = useMemo(() => {
    const due = rows.reduce((s, r) => s + (Number(r.due) || 0), 0);
    const received = rows.reduce((s, r) => s + (Number(r.received) || 0), 0);
    return { due, received, balance: due - received };
  }, [rows]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Ledger System
              </Typography>
              <TextField
                size="small"
                placeholder="Search by Case, Trademark No, Application"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ minWidth: 320, flex: 1 }}
              />
              <Button variant="contained" onClick={() => setOpen(true)}>
                New Ledger Entry
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  const headers = [
                    'dateTime',
                    'folderNo',
                    'trademarkNo',
                    'classNo',
                    'stage',
                    'applicationName',
                    'due',
                    'received',
                    'balance',
                    'notes',
                  ];

                  const exportRows = rows.map((p: any) => {
                    const c = caseMap.get(p.caseId);
                    const due = Number(p.due) || 0;
                    const received = Number(p.received) || 0;
                    return {
                      dateTime: p.dateTime,
                      folderNo: c?.folderNo ?? p.caseId,
                      trademarkNo: p.trademarkNo ?? '',
                      classNo: c?.classNo ?? '',
                      stage: p.stage ?? c?.stage ?? '',
                      applicationName: p.applicationName ?? c?.nameOfApplication ?? '',
                      due,
                      received,
                      balance: due - received,
                      notes: p.notes ?? '',
                    };
                  });

                  downloadCsv('ledger-system.csv', headers, exportRows);
                }}
              >
                Export CSV
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Totals (filtered)
                </Typography>
                <Typography variant="body2">Due: {totals.due}</Typography>
                <Typography variant="body2">Received: {totals.received}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  Balance: {totals.balance}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Per-page: {pageSize}
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
          getRowId={(r) => r.id!}
          initialState={{
            pagination: { paginationModel: { pageSize } },
          }}
          pageSizeOptions={[25, 50, 100, 200]}
          disableRowSelectionOnClick
        />
      </Card>

      <PaymentFormDialog
        open={open}
        onClose={() => setOpen(false)}
        cases={cases ?? []}
        onCreated={() => {
          setOpen(false);
        }}
      />
    </Box>
  );
}
