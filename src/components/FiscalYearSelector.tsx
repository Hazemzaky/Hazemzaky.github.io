import React from 'react';
import { useFiscalYear } from '../context/FiscalYearContext';
import { MenuItem, Select, InputLabel, FormControl } from '@mui/material';

const FiscalYearSelector: React.FC = () => {
  const { fiscalYear, setFiscalYear } = useFiscalYear();
  const now = new Date();
  const currentFiscal = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const years = Array.from({ length: 5 }, (_, i) => currentFiscal - 2 + i);
  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel id="fiscal-year-label">Fiscal Year</InputLabel>
      <Select
        labelId="fiscal-year-label"
        value={fiscalYear}
        label="Fiscal Year"
        onChange={e => setFiscalYear(Number(e.target.value))}
      >
        {years.map(year => (
          <MenuItem key={year} value={year}>
            {`${year}/${(year + 1).toString().slice(-2)}`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FiscalYearSelector; 