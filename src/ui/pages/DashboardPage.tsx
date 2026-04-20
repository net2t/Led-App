import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import { db } from '../../db/db';

const colors = ['#1565c0', '#f50057', '#2e7d32', '#ed6c02'];

export default function DashboardPage() {
  const cases = useLiveQuery(() => db.cases.toArray(), []);
  const payments = useLiveQuery(() => db.payments.toArray(), []);

  const stageCounts = useMemo(() => {
    const init = [1, 2, 3, 4].map((s) => ({ stage: `Stage ${s}`, value: 0 }));
    for (const c of cases ?? []) {
      const idx = Math.max(1, Math.min(4, c.stage)) - 1;
      init[idx].value += 1;
    }
    return init;
  }, [cases]);

  const paymentsKpi = useMemo(() => {
    const due = (payments ?? []).reduce((s, p) => s + (Number(p.due) || 0), 0);
    const received = (payments ?? []).reduce((s, p) => s + (Number(p.received) || 0), 0);
    return { due, received, balance: due - received, count: (payments ?? []).length };
  }, [payments]);

  const typeCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cases ?? []) m.set(c.type, (m.get(c.type) ?? 0) + 1);
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [cases]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Total Records
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {(cases ?? []).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Payments Entries
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {paymentsKpi.count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Received
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {paymentsKpi.received}
              </Typography>
              <Chip size="small" label={`Balance: ${paymentsKpi.balance}`} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Due
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {paymentsKpi.due}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 360 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                Stage-wise Analysis
              </Typography>
              <Box sx={{ height: 290 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stageCounts} dataKey="value" nameKey="stage" outerRadius={110}>
                      {stageCounts.map((_, idx) => (
                        <Cell key={idx} fill={colors[idx % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: 360 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                Cases by Type
              </Typography>
              <Box sx={{ height: 290 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeCounts} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1565c0" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
