import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import { db } from '../../db/db';
import type { Stage } from '../../db/schema';
import { assignConsultant, setCaseStage, updateCase } from '../../services/cases';
import { ensureMonthlyCheck } from '../../services/monthlyChecks';
import { getCasePaymentSummary } from '../../services/payments';

const stageOptions: Array<{ label: string; value: Stage }> = [
  { label: 'Stage 1', value: 1 },
  { label: 'Stage 2', value: 2 },
  { label: 'Stage 3', value: 3 },
  { label: 'Stage 4', value: 4 },
];

export default function CaseDetailPage() {
  const { id = '' } = useParams();
  const c = useLiveQuery(() => db.cases.get(id), [id]);
  const consultants = useLiveQuery(() => db.consultants.toArray(), []);
  const changes = useLiveQuery(() => db.caseChanges.where('caseId').equals(id).reverse().sortBy('at'), [id]);
  const payments = useLiveQuery(() => db.payments.where('caseId').equals(id).toArray(), [id]);

  const [error, setError] = useState('');

  const consultantOptions = useMemo(
    () => (consultants ?? []).filter((x) => x.active).map((x) => ({ id: x.id!, name: x.name })),
    [consultants]
  );

  const assigned = consultantOptions.find((x) => x.id === c?.assignedConsultantId) ?? null;

  const [localNotes, setLocalNotes] = useState('');
  const [localSubStage, setLocalSubStage] = useState('');

  const [dueSummary, setDueSummary] = useState<{ due: number; received: number; balance: number; count: number } | null>(
    null
  );

  useEffect(() => {
    setLocalNotes(c?.notes ?? '');
    setLocalSubStage(c?.subStage ?? '');
  }, [c?.notes, c?.subStage]);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const s = await getCasePaymentSummary(id);
      setDueSummary(s);
    })();
  }, [id, payments?.length]);

  if (!c) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Case not found</Typography>
        </CardContent>
      </Card>
    );
  }

  async function saveNotes() {
    setError('');
    try {
      await updateCase(id, { notes: localNotes, subStage: localSubStage });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save');
    }
  }

  async function changeStage(next: Stage) {
    setError('');
    try {
      const current = await db.cases.get(id);
      if (!current) throw new Error('Case not found');

      await setCaseStage(id, next, current.subStage);
      if (current.assignedConsultantId != null) {
        await ensureMonthlyCheck(id, current.assignedConsultantId, next);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to change stage');
    }
  }

  async function changeConsultant(nextId: number | null) {
    setError('');
    try {
      await assignConsultant(id, nextId ?? undefined);
      if (nextId != null) {
        const current = await db.cases.get(id);
        if (!current) throw new Error('Case not found');
        await ensureMonthlyCheck(id, nextId, current.stage);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to assign');
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {c.folderNo}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Case ID: {c.id} • Type: {c.type}
                    {c.trademarkNo ? ` • Trademark: ${c.trademarkNo}` : ''}
                  </Typography>
                </Box>
                <Chip label={`Stage ${c.stage}`} color="primary" variant="outlined" />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Stage"
                    select
                    value={c.stage}
                    onChange={(e) => changeStage(Number(e.target.value) as any)}
                    fullWidth
                  >
                    {stageOptions.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={8}>
                  <TextField
                    label="Sub Stage"
                    value={localSubStage}
                    onChange={(e) => setLocalSubStage(e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField label="Application Name" value={c.nameOfApplication} fullWidth disabled />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField label="Class" value={c.classNo ?? ''} fullWidth disabled />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField label="Client Type" value={c.clientType} fullWidth disabled />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField label="Notes" value={localNotes} onChange={(e) => setLocalNotes(e.target.value)} fullWidth multiline minRows={3} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Assigned Consultant"
                    select
                    value={assigned?.id ?? ''}
                    onChange={(e) => changeConsultant(e.target.value ? Number(e.target.value) : null)}
                    fullWidth
                  >
                    <MenuItem value="">(unassigned)</MenuItem>
                    {consultantOptions.map((x) => (
                      <MenuItem key={x.id} value={x.id}>
                        {x.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Button variant="contained" onClick={saveNotes}>
                    Save
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Payments
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                Balance: {dueSummary ? dueSummary.balance : 0}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Due: {dueSummary ? dueSummary.due : 0} • Received: {dueSummary ? dueSummary.received : 0} • Entries:{' '}
                {dueSummary ? dueSummary.count : 0}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Files
              </Typography>
              <Stack spacing={1}>
                {(c.logoFiles ?? []).length ? (
                  (c.logoFiles ?? []).map((f, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      href={f.dataUrl}
                      download={f.name}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {f.name}
                    </Button>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No files uploaded.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                Change History
              </Typography>
              <Stack spacing={1}>
                {(changes ?? []).slice().reverse().map((ch: any) => (
                  <Box key={ch.id} sx={{ p: 1.25, borderRadius: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {ch.type}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {ch.at}
                    </Typography>
                    <Typography variant="body2">{ch.message}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                Payments (linked)
              </Typography>
              <Stack spacing={1}>
                {(payments ?? []).length ? (
                  (payments ?? [])
                    .slice()
                    .sort((a, b) => (a.dateTime < b.dateTime ? 1 : -1))
                    .slice(0, 10)
                    .map((p) => (
                      <Box key={p.id} sx={{ p: 1.25, borderRadius: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Received: {p.received} • Due: {p.due}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {p.dateTime}
                        </Typography>
                        {p.notes ? <Typography variant="body2">{p.notes}</Typography> : null}
                      </Box>
                    ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No payments recorded.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
