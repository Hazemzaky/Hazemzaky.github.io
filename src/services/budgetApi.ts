import api from '../apiBase';

// Assumptions
export const getAssumptions = (year: number) => api.get(`/budget/assumptions?year=${year}`);
export const saveAssumptions = (data: any) => api.post('/budget/assumptions', data);

// Revenue
export const getRevenue = (year: number) => api.get(`/budget/revenue?year=${year}`);
export const saveRevenueBulk = (year: number, lines: any[]) => api.post('/budget/revenue/bulk', { year, lines });

// OPEX
export const getOpex = (year: number) => api.get(`/budget/opex?year=${year}`);
export const saveOpexBulk = (year: number, categories: any[]) => api.post('/budget/opex/bulk', { year, categories });

// Staffing
export const getStaffing = (year: number) => api.get(`/budget/staffing?year=${year}`);
export const saveStaffingBulk = (year: number, staff: any[]) => api.post('/budget/staffing/bulk', { year, staff });

// Loans
export const getLoans = (year: number) => api.get(`/budget/loans?year=${year}`);
export const saveLoansBulk = (year: number, loans: any[]) => api.post('/budget/loans/bulk', { year, loans });

// CAPEX
export const getCapex = (year: number) => api.get(`/budget/capex?year=${year}`);
export const saveCapexBulk = (year: number, capex: any[]) => api.post('/budget/capex/bulk', { year, capex });

// Variance
export const getVariance = (year: number, module: string) => api.get(`/budget/variance?year=${year}&module=${module}`);
export const saveVarianceBulk = (year: number, module: string, items: any[]) => api.post('/budget/variance/bulk', { year, module, items });

// Contracts
export const getContracts = (year: number) => api.get(`/budget/contracts?year=${year}`);
export const saveContractsBulk = (year: number, contracts: any[]) => api.post('/budget/contracts/bulk', { year, contracts }); 