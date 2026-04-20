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
import type { CaseRecord, CaseType, ClientTypePrefix, ConsultantRecord, Stage } from '../../db/schema';
import { createCase } from '../../services/cases';
import FilePicker, { type PickedFile } from './FilePicker';

const caseTypes: CaseType[] = ['Trademark', 'Copyright', 'NTN', 'Company'];

const stageOptions: Array<{ label: string; value: Stage }> = [
  { label: 'Stage 1', value: 1 },
  { label: 'Stage 2', value: 2 },
  { label: 'Stage 3', value: 3 },
  { label: 'Stage 4', value: 4 },
];

const clientTypes: ClientTypePrefix[] = ['X', 'A', 'B'];

export default function CaseFormDialog({
  open,
  onClose,
  consultants,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  consultants: ConsultantRecord[];
  onCreated: (c: CaseRecord) => void;
}) {
  const consultantOptions = useMemo(
    () => consultants.filter((c) => c.active).map((c) => ({ id: c.id!, label: c.name })),
    [consultants]
  );

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [id, setId] = useState('');
  const [clientType, setClientType] = useState<ClientTypePrefix>('X');
  const [caseNo, setCaseNo] = useState('');
  const [type, setType] = useState<CaseType>('Trademark');
  const [trademarkNo, setTrademarkNo] = useState('');
  const [classNo, setClassNo] = useState<string>('');
  const [nameOfApplication, setNameOfApplication] = useState('');
  const [stage, setStage] = useState<Stage>(1);
  const [subStage, setSubStage] = useState('');
  const [notes, setNotes] = useState('');
  const [logoFiles, setLogoFiles] = useState<PickedFile[]>([]);
  const [assignedConsultantId, setAssignedConsultantId] = useState<number | undefined>(undefined);

  async function onSubmit() {
    setError('');
    setLoading(true);
    try {
      const c = await createCase({
        id,
        clientType,
        caseNo,
        type,
        trademarkNo: trademarkNo || undefined,
        classNo: classNo ? Number(classNo) : undefined,
        nameOfApplication,
        stage,
        subStage: subStage || undefined,
        notes: notes || undefined,
        logoFiles,
        assignedConsultantId,
      });
      onCreated(c);
      onClose();
      setId('');
      setClientType('X');
      setCaseNo('');
      setType('Trademark');
      setTrademarkNo('');
      setClassNo('');
      setNameOfApplication('');
      setStage(1);
      setSubStage('');
      setNotes('');
      setLogoFiles([]);
      setAssignedConsultantId(undefined);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create case');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Case</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField label="Case ID" value={id} onChange={(e) => setId(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Client Type (Prefix)"
              select
              value={clientType}
              onChange={(e) => setClientType(e.target.value as ClientTypePrefix)}
              fullWidth
            >
              {clientTypes.map((ct) => (
                <MenuItem key={ct} value={ct}>
                  {ct}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Case No"
              value={caseNo}
              onChange={(e) => setCaseNo(e.target.value)}
              placeholder="700-001"
              helperText="Format: 700-001"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Type"
              select
              value={type}
              onChange={(e) => setType(e.target.value as CaseType)}
              fullWidth
            >
              {caseTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Trademark No"
              value={trademarkNo}
              onChange={(e) => setTrademarkNo(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Class (1-45)"
              value={classNo}
              onChange={(e) => setClassNo(e.target.value)}
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              label="Name of Application"
              value={nameOfApplication}
              onChange={(e) => setNameOfApplication(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Stage"
              select
              value={stage}
              onChange={(e) => setStage(Number(e.target.value) as any)}
              fullWidth
            >
              {stageOptions.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField label="Sub Stage" value={subStage} onChange={(e) => setSubStage(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={consultantOptions}
              value={consultantOptions.find((c) => c.id === assignedConsultantId) ?? null}
              onChange={(_, v) => setAssignedConsultantId(v?.id)}
              renderInput={(params) => <TextField {...params} label="Assigned Consultant" />}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <FilePicker label="Upload Logo/File(s)" multiple onPicked={(f) => setLogoFiles(f)} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
