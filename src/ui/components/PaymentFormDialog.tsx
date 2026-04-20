import { useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import type { CaseRecord, PaymentRecord, Stage } from '../../db/schema';
import { createPayment } from '../../services/payments';
import FilePicker, { type PickedFile } from './FilePicker';

const stageOptions: Array<{ label: string; value: Stage }> = [
  { label: 'Stage 1', value: 1 },
  { label: 'Stage 2', value: 2 },
  { label: 'Stage 3', value: 3 },
  { label: 'Stage 4', value: 4 },
];

export default function PaymentFormDialog({
  open,
  onClose,
  cases,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  cases: CaseRecord[];
  onCreated: (p: PaymentRecord) => void;
}) {
  const options = useMemo(
    () =>
      [...cases]
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .map((c) => ({ id: c.id, label: `${c.folderNo} — ${c.nameOfApplication}` })),
    [cases]
  );

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [caseId, setCaseId] = useState<string>('');
  const [trademarkNo, setTrademarkNo] = useState('');
  const [stage, setStage] = useState<Stage | ''>('');
  const [applicationName, setApplicationName] = useState('');
  const [due, setDue] = useState('0');
  const [received, setReceived] = useState('0');
  const [notes, setNotes] = useState('');
  const [receiptImages, setReceiptImages] = useState<PickedFile[]>([]);

  async function onSubmit() {
    setError('');
    setLoading(true);
    try {
      const created = await createPayment({
        caseId,
        trademarkNo: trademarkNo || undefined,
        stage: stage === '' ? undefined : stage,
        applicationName: applicationName || undefined,
        due: Number(due) || 0,
        received: Number(received) || 0,
        notes: notes || undefined,
        receiptImages,
      });

      if (!created) throw new Error('Failed to create payment');
      onCreated(created);
      onClose();

      setCaseId('');
      setTrademarkNo('');
      setStage('');
      setApplicationName('');
      setDue('0');
      setReceived('0');
      setNotes('');
      setReceiptImages([]);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Record Payment</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              options={options}
              value={options.find((c) => c.id === caseId) ?? null}
              onChange={(_, v) => setCaseId(v?.id ?? '')}
              renderInput={(params) => <TextField {...params} label="Case" />}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField label="Trademark No" value={trademarkNo} onChange={(e) => setTrademarkNo(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Stage"
              select
              value={stage}
              onChange={(e) => setStage(Number(e.target.value) as any)}
              fullWidth
            >
              <MenuItem value="">(auto)</MenuItem>
              {stageOptions.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Application Name"
              value={applicationName}
              onChange={(e) => setApplicationName(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Due"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Received"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Balance" value={(Number(due) || 0) - (Number(received) || 0)} fullWidth disabled />
          </Grid>

          <Grid item xs={12}>
            <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline minRows={3} />
          </Grid>

          <Grid item xs={12}>
            <FilePicker label="Upload Receipt Image(s)" multiple onPicked={(f) => setReceiptImages(f)} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
