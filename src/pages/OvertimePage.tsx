import React, { useEffect, useState } from 'react';
import {
  Box, Tabs, Tab, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, TextField, MenuItem, Card, CardContent, Typography, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, CircularProgress, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const months = [
  'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'
];

const getCurrentFiscalMonth = () => {
  const now = new Date();
  const month = now.getMonth();
  // Fiscal year starts in April (3)
  return month >= 3 ? month - 3 : month + 9;
};

const defaultRow = {
  employee: '',
  salary: '',
  dailySalary: '',
  hourlyRate: '',
  normalRate: '',
  normalHours: '',
  normalSalary: '',
  fridayRate: '',
  fridayHours: '',
  fridaySalary: '',
  holidayRate: '',
  holidayHours: '',
  holidaySalary: '',
  totalOvertimeHours: '',
  totalCost: '',
};

const overtimeAttendanceDefaultRow = {
  site: '',
  coId: '',
  employeeName: '',
  position: '',
  manager: '',
  date: '',
  day: '',
  dayType: '',
  from: '',
  to: '',
  totalHours: '',
  remarks: '',
};

const getYearForTab = (tabIdx: number) => {
  const now = new Date();
  const fiscalStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  // April (0) to December (8) is fiscalStart, Jan/Feb/Mar is fiscalStart+1
  return tabIdx <= 8 ? fiscalStart : fiscalStart + 1;
};

const OvertimePage: React.FC = () => {
  const [tab, setTab] = useState(getCurrentFiscalMonth());
  const [employees, setEmployees] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [form, setForm] = useState<any>(defaultRow);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attendanceTab, setAttendanceTab] = useState(0); // 0: Overtime, 1: Overtime Attendance
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceForm, setAttendanceForm] = useState<any>(overtimeAttendanceDefaultRow);
  const [openAttendanceForm, setOpenAttendanceForm] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  // Overtime Attendance search/filter state
  const [attendanceSearch, setAttendanceSearch] = useState({
    coId: '',
    employeeName: '',
    dayType: '',
    manager: '',
    position: '',
  });

  // Filtered attendance data
  const filteredAttendanceData = attendanceData.filter(row =>
    (!attendanceSearch.coId || row.coId.toLowerCase().includes(attendanceSearch.coId.toLowerCase())) &&
    (!attendanceSearch.employeeName || row.employeeName.toLowerCase().includes(attendanceSearch.employeeName.toLowerCase())) &&
    (!attendanceSearch.dayType || row.dayType === attendanceSearch.dayType) &&
    (!attendanceSearch.manager || row.manager.toLowerCase().includes(attendanceSearch.manager.toLowerCase())) &&
    (!attendanceSearch.position || row.position.toLowerCase().includes(attendanceSearch.position.toLowerCase()))
  );

  // Totals for filtered data
  const totalNormal = filteredAttendanceData.filter(r => r.dayType === 'Normal Day').reduce((sum, r) => sum + Number(r.totalHours || 0), 0);
  const totalFriday = filteredAttendanceData.filter(r => r.dayType === 'Friday day').reduce((sum, r) => sum + Number(r.totalHours || 0), 0);
  const totalHoliday = filteredAttendanceData.filter(r => r.dayType === 'Holiday Days').reduce((sum, r) => sum + Number(r.totalHours || 0), 0);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchMonthData();
    // eslint-disable-next-line
  }, [tab]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/payroll/employees?position=driver,operator');
      const json = await res.json();
      setEmployees(Array.isArray(json) ? json : []);
    } catch {
      setEmployees([]);
    }
  };

  const fetchMonthData = async () => {
    setLoading(true);
    setError('');
    try {
      const monthIdx = tab;
      const year = getYearForTab(tab);
      const res = await fetch(`/api/overtime?month=${monthIdx}&year=${year}`);
      const json = await res.json();
      setMonthData(json);
    } catch (err: any) {
      setError('Failed to load overtime data');
      setMonthData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: any, newValue: number) => setTab(newValue);

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAddData = async () => {
    for (const key of Object.keys(defaultRow)) {
      if (!form[key]) {
        setError('All fields are required');
        return;
      }
    }
    setSaving(true);
    setError('');
    try {
      const monthIdx = tab;
      const year = getYearForTab(tab);
      const payload = {
        ...form,
        month: monthIdx,
        year,
        salary: Number(form.salary),
        dailySalary: Number(form.dailySalary),
        hourlyRate: Number(form.hourlyRate),
        normalRate: Number(form.normalRate),
        normalHours: Number(form.normalHours),
        normalSalary: Number(form.normalSalary),
        fridayRate: Number(form.fridayRate),
        fridayHours: Number(form.fridayHours),
        fridaySalary: Number(form.fridaySalary),
        holidayRate: Number(form.holidayRate),
        holidayHours: Number(form.holidayHours),
        holidaySalary: Number(form.holidaySalary),
        totalOvertimeHours: Number(form.totalOvertimeHours),
        totalCost: Number(form.totalCost),
      };
      const res = await fetch('/api/overtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      setForm(defaultRow);
      setOpenForm(false);
      fetchMonthData();
    } catch (err: any) {
      setError('Failed to save overtime data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/overtime/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchMonthData();
    } catch {
      setError('Failed to delete overtime record');
    } finally {
      setSaving(false);
    }
  };

  // Overtime Attendance handlers
  const handleAttendanceFormChange = (e: any) => {
    const { name, value } = e.target;
    let newForm = { ...attendanceForm, [name]: value };
    // Auto-calculate day from date
    if (name === 'date' && value) {
      const d = new Date(value);
      newForm.day = d.toLocaleDateString(undefined, { weekday: 'long' });
    }
    // Auto-calculate total hours
    if ((name === 'from' || name === 'to') && newForm.from && newForm.to) {
      const fromParts = newForm.from.split(':');
      const toParts = newForm.to.split(':');
      if (fromParts.length === 2 && toParts.length === 2) {
        const fromDate = new Date(0, 0, 0, Number(fromParts[0]), Number(fromParts[1]));
        const toDate = new Date(0, 0, 0, Number(toParts[0]), Number(toParts[1]));
        let diff = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60);
        if (diff < 0) diff += 24; // handle overnight
        newForm.totalHours = diff.toFixed(2);
      }
    }
    setAttendanceForm(newForm);
  };

  const handleAddAttendance = async () => {
    for (const key of Object.keys(overtimeAttendanceDefaultRow)) {
      if (!attendanceForm[key] && key !== 'remarks') {
        setAttendanceError('All fields except remarks are required');
        return;
      }
    }
    setAttendanceSaving(true);
    setAttendanceError('');
    try {
      setAttendanceData(prev => [...prev, { ...attendanceForm }]);
      setAttendanceForm(overtimeAttendanceDefaultRow);
      setOpenAttendanceForm(false);
    } catch (err: any) {
      setAttendanceError('Failed to save overtime attendance data');
    } finally {
      setAttendanceSaving(false);
    }
  };

  // Calculate totals for each column
  const totals = {
    salary: monthData.reduce((sum, r) => sum + Number(r.salary || 0), 0),
    dailySalary: monthData.reduce((sum, r) => sum + Number(r.dailySalary || 0), 0),
    hourlyRate: monthData.reduce((sum, r) => sum + Number(r.hourlyRate || 0), 0),
    normalSalary: monthData.reduce((sum, r) => sum + Number(r.normalSalary || 0), 0),
    fridaySalary: monthData.reduce((sum, r) => sum + Number(r.fridaySalary || 0), 0),
    holidaySalary: monthData.reduce((sum, r) => sum + Number(r.holidaySalary || 0), 0),
    totalOvertimeHours: monthData.reduce((sum, r) => sum + Number(r.totalOvertimeHours || 0), 0),
    totalCost: monthData.reduce((sum, r) => sum + Number(r.totalCost || 0), 0),
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Overtime</Typography>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={attendanceTab} onChange={(_, v) => setAttendanceTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Overtime" />
          <Tab label="Overtime Attendance" />
        </Tabs>
      </Paper>
      {attendanceTab === 0 && (
        <>
          <Box mb={2}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
              Add Data
            </Button>
          </Box>
          {loading ? <CircularProgress /> : (
          <Paper sx={{ p: 2, overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Daily Salary</TableCell>
                  <TableCell>Hourly Rate</TableCell>
                  <TableCell sx={{ bgcolor: 'white' }}>Normal Day Rate</TableCell>
                  <TableCell sx={{ bgcolor: 'white' }}>Normal Day Hours</TableCell>
                  <TableCell sx={{ bgcolor: 'white' }}>Normal Day Salary</TableCell>
                  <TableCell sx={{ bgcolor: '#ffebee' }}>Friday Rate</TableCell>
                  <TableCell sx={{ bgcolor: '#ffebee' }}>Friday Hours</TableCell>
                  <TableCell sx={{ bgcolor: '#ffebee' }}>Friday Salary</TableCell>
                  <TableCell sx={{ bgcolor: '#e8f5e9' }}>Public Holiday Rate</TableCell>
                  <TableCell sx={{ bgcolor: '#e8f5e9' }}>Public Holiday Hours</TableCell>
                  <TableCell sx={{ bgcolor: '#e8f5e9' }}>Public Holiday Salary</TableCell>
                  <TableCell>Total Overtime Hours</TableCell>
                  <TableCell>Total Cost</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthData.map((row, idx) => (
                  <TableRow key={row._id || idx}>
                    <TableCell>{employees.find(e => e._id === row.employee || (row.employee && row.employee._id))?.name || ''}</TableCell>
                    <TableCell>{row.salary}</TableCell>
                    <TableCell>{row.dailySalary}</TableCell>
                    <TableCell>{row.hourlyRate}</TableCell>
                    <TableCell sx={{ bgcolor: 'white' }}>{row.normalRate}</TableCell>
                    <TableCell sx={{ bgcolor: 'white' }}>{row.normalHours}</TableCell>
                    <TableCell sx={{ bgcolor: 'white' }}>{row.normalSalary}</TableCell>
                    <TableCell sx={{ bgcolor: '#ffebee' }}>{row.fridayRate}</TableCell>
                    <TableCell sx={{ bgcolor: '#ffebee' }}>{row.fridayHours}</TableCell>
                    <TableCell sx={{ bgcolor: '#ffebee' }}>{row.fridaySalary}</TableCell>
                    <TableCell sx={{ bgcolor: '#e8f5e9' }}>{row.holidayRate}</TableCell>
                    <TableCell sx={{ bgcolor: '#e8f5e9' }}>{row.holidayHours}</TableCell>
                    <TableCell sx={{ bgcolor: '#e8f5e9' }}>{row.holidaySalary}</TableCell>
                    <TableCell>{row.totalOvertimeHours}</TableCell>
                    <TableCell>{row.totalCost}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDelete(row._id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          )}
          {/* Totals Cards */}
          <Box display="flex" gap={2} mt={2} flexWrap="wrap">
            <Card><CardContent><Typography>Total Normal Salary: {totals.normalSalary}</Typography></CardContent></Card>
            <Card><CardContent><Typography>Total Friday Salary: {totals.fridaySalary}</Typography></CardContent></Card>
            <Card><CardContent><Typography>Total Holiday Salary: {totals.holidaySalary}</Typography></CardContent></Card>
            <Card><CardContent><Typography>Total Overtime Hours: {totals.totalOvertimeHours}</Typography></CardContent></Card>
            <Card><CardContent><Typography>Total Cost: {totals.totalCost}</Typography></CardContent></Card>
          </Box>
          {/* Add Data Dialog */}
          <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
            <DialogTitle>Add Overtime Data</DialogTitle>
            <DialogContent>
              <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                <FormControl fullWidth required>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    name="employee"
                    value={form.employee}
                    label="Employee"
                    onChange={handleFormChange}
                  >
                    {Array.isArray(employees) && employees.map(e => (
                      <MenuItem key={e._id} value={e._id}>{e.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Salary" name="salary" value={form.salary} onChange={handleFormChange} required fullWidth />
                <TextField label="Daily Salary" name="dailySalary" value={form.dailySalary} onChange={handleFormChange} required fullWidth />
                <TextField label="Hourly Rate" name="hourlyRate" value={form.hourlyRate} onChange={handleFormChange} required fullWidth />
                {/* Normal Day (white) */}
                <TextField label="Normal Day Rate" name="normalRate" value={form.normalRate} onChange={handleFormChange} required fullWidth sx={{ bgcolor: 'white' }} />
                <TextField label="Normal Day Hours" name="normalHours" value={form.normalHours} onChange={handleFormChange} required fullWidth sx={{ bgcolor: 'white' }} />
                <TextField label="Normal Day Salary" name="normalSalary" value={form.normalSalary} onChange={handleFormChange} required fullWidth sx={{ bgcolor: 'white' }} />
                {/* Friday (red) */}
                <TextField label="Friday Rate" name="fridayRate" value={form.fridayRate} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#ffebee' }} />
                <TextField label="Friday Hours" name="fridayHours" value={form.fridayHours} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#ffebee' }} />
                <TextField label="Friday Salary" name="fridaySalary" value={form.fridaySalary} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#ffebee' }} />
                {/* Public Holiday (green) */}
                <TextField label="Public Holiday Rate" name="holidayRate" value={form.holidayRate} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#e8f5e9' }} />
                <TextField label="Public Holiday Hours" name="holidayHours" value={form.holidayHours} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#e8f5e9' }} />
                <TextField label="Public Holiday Salary" name="holidaySalary" value={form.holidaySalary} onChange={handleFormChange} required fullWidth sx={{ bgcolor: '#e8f5e9' }} />
                <TextField label="Total Overtime Hours" name="totalOvertimeHours" value={form.totalOvertimeHours} onChange={handleFormChange} required fullWidth />
                <TextField label="Total Cost" name="totalCost" value={form.totalCost} onChange={handleFormChange} required fullWidth />
              </Box>
              {error && <Typography color="error" mt={2}>{error}</Typography>}
            </DialogContent>
            <Box display="flex" justifyContent="flex-end" p={2}>
              <Button onClick={() => setOpenForm(false)} sx={{ mr: 2 }}>Cancel</Button>
              <Button onClick={handleAddData} variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Add'}</Button>
            </Box>
          </Dialog>
        </>
      )}
      {attendanceTab === 1 && (
        <>
          <Box mb={2}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAttendanceForm(true)}>
              Add Overtime Attendance
            </Button>
          </Box>
          {/* Search/Filter Controls */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField label="Co. ID" value={attendanceSearch.coId} onChange={e => setAttendanceSearch(s => ({ ...s, coId: e.target.value }))} size="small" />
              <TextField label="Employee Name" value={attendanceSearch.employeeName} onChange={e => setAttendanceSearch(s => ({ ...s, employeeName: e.target.value }))} size="small" />
              <TextField label="Manager" value={attendanceSearch.manager} onChange={e => setAttendanceSearch(s => ({ ...s, manager: e.target.value }))} size="small" />
              <TextField label="Position" value={attendanceSearch.position} onChange={e => setAttendanceSearch(s => ({ ...s, position: e.target.value }))} size="small" />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Day Type</InputLabel>
                <Select
                  value={attendanceSearch.dayType}
                  label="Day Type"
                  onChange={e => setAttendanceSearch(s => ({ ...s, dayType: e.target.value }))}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Holiday Days">Holiday Days</MenuItem>
                  <MenuItem value="Friday day">Friday day</MenuItem>
                  <MenuItem value="Normal Day">Normal Day</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
          <Paper sx={{ p: 2, overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Site</TableCell>
                  <TableCell>Co. ID</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Day</TableCell>
                  <TableCell>Day Type</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Total Hours</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAttendanceData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.site}</TableCell>
                    <TableCell>{row.coId}</TableCell>
                    <TableCell>{row.employeeName}</TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell>{row.manager}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.day}</TableCell>
                    <TableCell>{row.dayType}</TableCell>
                    <TableCell>{row.from}</TableCell>
                    <TableCell>{row.to}</TableCell>
                    <TableCell>{row.totalHours}</TableCell>
                    <TableCell>{row.remarks}</TableCell>
                  </TableRow>
                ))}
                {/* Totals Row */}
                <TableRow>
                  <TableCell colSpan={10} align="right"><b>Total Normal Day Hours:</b></TableCell>
                  <TableCell colSpan={2}><b>{totalNormal}</b></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={10} align="right"><b>Total Friday Hours:</b></TableCell>
                  <TableCell colSpan={2}><b>{totalFriday}</b></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={10} align="right"><b>Total Holiday Hours:</b></TableCell>
                  <TableCell colSpan={2}><b>{totalHoliday}</b></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
          <Dialog open={openAttendanceForm} onClose={() => setOpenAttendanceForm(false)} maxWidth="md" fullWidth>
            <DialogTitle>Add Overtime Attendance</DialogTitle>
            <DialogContent>
              <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                <FormControl fullWidth required>
                  <InputLabel>Co. ID</InputLabel>
                  <Select
                    name="coId"
                    value={attendanceForm.coId}
                    label="Co. ID"
                    onChange={e => {
                      const selectedId = e.target.value;
                      const emp = employees.find((emp: any) => emp.employeeId === selectedId);
                      setAttendanceForm((prev: any) => ({
                        ...prev,
                        coId: selectedId,
                        employeeName: emp ? emp.name : '',
                      }));
                    }}
                  >
                    {employees.map(emp => (
                      <MenuItem key={emp.employeeId} value={emp.employeeId}>{emp.employeeId}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Employee Name" name="employeeName" value={attendanceForm.employeeName} fullWidth required disabled />
                <TextField label="Position" name="position" value={attendanceForm.position} onChange={handleAttendanceFormChange} required fullWidth />
                <TextField label="Manager" name="manager" value={attendanceForm.manager} onChange={handleAttendanceFormChange} required fullWidth />
                <TextField label="Date" name="date" type="date" value={attendanceForm.date} onChange={handleAttendanceFormChange} required fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="Day" name="day" value={attendanceForm.day} onChange={handleAttendanceFormChange} required fullWidth disabled />
                <FormControl fullWidth required>
                  <InputLabel>Day Type</InputLabel>
                  <Select
                    name="dayType"
                    value={attendanceForm.dayType}
                    label="Day Type"
                    onChange={handleAttendanceFormChange}
                  >
                    <MenuItem value="Holiday Days">Holiday Days</MenuItem>
                    <MenuItem value="Friday day">Friday day</MenuItem>
                    <MenuItem value="Normal Day">Normal Day</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="From" name="from" type="time" value={attendanceForm.from} onChange={handleAttendanceFormChange} required fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="To" name="to" type="time" value={attendanceForm.to} onChange={handleAttendanceFormChange} required fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="Total Hours" name="totalHours" value={attendanceForm.totalHours} onChange={handleAttendanceFormChange} required fullWidth disabled />
                <TextField label="Remarks" name="remarks" value={attendanceForm.remarks} onChange={handleAttendanceFormChange} fullWidth multiline minRows={2} />
              </Box>
              {attendanceError && <Typography color="error" mt={2}>{attendanceError}</Typography>}
            </DialogContent>
            <Box display="flex" justifyContent="flex-end" p={2}>
              <Button onClick={() => setOpenAttendanceForm(false)} sx={{ mr: 2 }}>Cancel</Button>
              <Button onClick={handleAddAttendance} variant="contained" disabled={attendanceSaving}>{attendanceSaving ? 'Saving...' : 'Add'}</Button>
            </Box>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default OvertimePage; 