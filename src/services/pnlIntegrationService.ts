import React from 'react';
import api from '../apiBase';
import { verticalPnLMappingService } from './verticalPnLMappingService';

// PnL Integration Service - Handles real-time updates between Cost Analysis Dashboards and PnL
export class PnLIntegrationService {
  private static instance: PnLIntegrationService;
  private updateCallbacks: Map<string, Function[]> = new Map();
  private eventSource: EventSource | null = null;

  private constructor() {
    this.initializeRealTimeUpdates();
  }

  public static getInstance(): PnLIntegrationService {
    if (!PnLIntegrationService.instance) {
      PnLIntegrationService.instance = new PnLIntegrationService();
    }
    return PnLIntegrationService.instance;
  }

  // Initialize real-time updates via Server-Sent Events
  private initializeRealTimeUpdates() {
    // For now, use polling - can be enhanced with WebSocket/SSE later
    this.startPolling();
  }

  // Start polling for PnL updates
  private startPolling() {
    // Poll every 30 seconds for updates
    setInterval(() => {
      this.checkForUpdates();
    }, 30000);

    // Also listen for custom events
    window.addEventListener('pnlDataUpdated', () => {
      this.triggerUpdate('manual');
    });
  }

  // Check for updates from all modules
  private async checkForUpdates() {
    try {
      // This would check for recent updates in all modules
      const response = await api.get('/pnl/check-updates');
      const data = response.data as { hasUpdates?: boolean };
      if (data.hasUpdates) {
        this.triggerUpdate('automatic');
      }
    } catch (error) {
      console.error('Error checking for PnL updates:', error);
    }
  }

  // Trigger update notifications
  private triggerUpdate(source: string) {
    this.updateCallbacks.forEach((callbacks, module) => {
      callbacks.forEach(callback => {
        try {
          callback({ source, timestamp: new Date().toISOString() });
        } catch (error) {
          console.error(`Error in PnL update callback for ${module}:`, error);
        }
      });
    });
  }

  // Subscribe to PnL updates
  public subscribe(module: string, callback: Function) {
    if (!this.updateCallbacks.has(module)) {
      this.updateCallbacks.set(module, []);
    }
    this.updateCallbacks.get(module)!.push(callback);
  }

  // Unsubscribe from PnL updates
  public unsubscribe(module: string, callback: Function) {
    const callbacks = this.updateCallbacks.get(module);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Debounce map to prevent excessive API calls
  private debounceTimeouts: Map<string, NodeJS.Timeout> = new Map();

  // Notify PnL of data changes in specific modules with debouncing
  public async notifyDataChange(module: string, action: string, data: any) {
    // Skip PnL integration for modules that don't need it
    if (module === 'businessTrip' && action === 'calculate') {
      console.log('Skipping PnL integration for businessTrip module');
      return;
    }

    // Clear existing timeout for this module
    const existingTimeout = this.debounceTimeouts.get(module);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout to debounce the call
    const timeoutId = setTimeout(async () => {
      try {
        await api.post('/pnl/update-realtime', {
          module,
          action,
          data,
          timestamp: new Date().toISOString()
        });
        
        // Trigger immediate update
        this.triggerUpdate(module);
      } catch (error) {
        console.error('Error notifying PnL of data change:', error);
      } finally {
        // Remove timeout from map
        this.debounceTimeouts.delete(module);
      }
    }, 1000); // 1 second debounce

    this.debounceTimeouts.set(module, timeoutId);
  }

  // Get period-specific PnL data with enhanced vertical structure
  public async getPnLDataForPeriod(period: string, startDate?: string, endDate?: string) {
    try {
      console.log('Fetching enhanced PnL data for period:', { period, startDate, endDate });


            // Also fetch manual entries and other P&L specific data
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      params.append('period', period);


      // Use the vertical P&L mapping service to aggregate costs from all modules
      const verticalPnLData = await verticalPnLMappingService.aggregateAllModuleCosts(period, startDate, endDate);
      
      console.log('Vertical PnL Data:', verticalPnLData);

      const [manualEntriesRes, chartsRes, analysisRes] = await Promise.allSettled([
        api.get(`/pnl/manual-entries?${params.toString()}`),
        api.get(`/pnl/charts?${params.toString()}`),
        api.get(`/pnl/analysis?${params.toString()}`)
      ]);

      // Process manual entries and integrate them
      let manualEntries = {};
      if (manualEntriesRes.status === 'fulfilled' && manualEntriesRes.value.data) {
        manualEntries = manualEntriesRes.value.data;
        
        // Integrate manual entries into the vertical P&L structure
        this.integrateManualEntries(verticalPnLData, manualEntries);
      }

      // Generate charts data from the vertical structure
      const chartsData = this.generateChartsFromVerticalData(verticalPnLData);
      
      // Generate analysis data
      const analysisData = this.generateAnalysisFromVerticalData(verticalPnLData);

      return {
        summary: verticalPnLData.summary,
        table: verticalPnLData.table,
        charts: chartsRes.status === 'fulfilled' ? chartsRes.value.data : chartsData,
        analysis: analysisRes.status === 'fulfilled' ? analysisRes.value.data : analysisData,
        breakdown: verticalPnLData.breakdown
      };
    } catch (error) {
      console.error('Error fetching enhanced PnL data:', error);
      
      // Fallback to original API calls if vertical mapping fails
      try {
        const params = new URLSearchParams();
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        params.append('period', period);

        const [summaryRes, tableRes, chartsRes, analysisRes] = await Promise.all([
          api.get(`/pnl/summary?${params.toString()}`),
          api.get(`/pnl/table?${params.toString()}`),
          api.get(`/pnl/charts?${params.toString()}`),
          api.get(`/pnl/analysis?${params.toString()}`)
        ]);

        return {
          summary: summaryRes.data,
          table: Array.isArray(tableRes.data) ? tableRes.data : [],
          charts: chartsRes.data,
          analysis: analysisRes.data
        };
      } catch (fallbackError) {
        console.error('Fallback PnL data fetch also failed:', fallbackError);
        throw error;
      }
    }
  }

  // Integrate manual entries into the vertical P&L structure
  private integrateManualEntries(verticalPnLData: any, manualEntries: any) {
    if (!manualEntries || !Array.isArray(manualEntries)) return;

    manualEntries.forEach((entry: any) => {
      // Find and update existing items instead of adding new ones
      let targetSection = null;
      let targetItem = null;

      // Determine which section and item to update based on itemId
      if (['gain_selling_products'].includes(entry.itemId)) {
        targetSection = verticalPnLData.table.find((section: any) => section.type === 'other');
        targetItem = targetSection?.items.find((item: any) => item.id === entry.itemId);
      } else if (['provision_credit_loss', 'rental_equipment_cost', 'ds_cost', 'service_agreement_cost'].includes(entry.itemId)) {
        targetSection = verticalPnLData.table.find((section: any) => section.type === 'expenses');
        targetItem = targetSection?.items.find((item: any) => item.id === entry.itemId);
      } else if (['provision_impairment', 'provision_end_service', 'rebate', 'sub_companies_revenue', 'other_revenue', 'ds_revenue'].includes(entry.itemId)) {
        targetSection = verticalPnLData.table.find((section: any) => section.type === 'revenue');
        targetItem = targetSection?.items.find((item: any) => item.id === entry.itemId);
      } else if (['finance_costs'].includes(entry.itemId)) {
        targetSection = verticalPnLData.table.find((section: any) => section.type === 'ebitda');
        targetItem = targetSection?.items.find((item: any) => item.id === entry.itemId);
      }

      // Update the existing item with manual entry value
      if (targetItem) {
        targetItem.amount = entry.amount || 0;
        console.log(`Updated ${entry.itemId} with manual entry value: ${entry.amount}`);
      } else {
        console.warn(`Could not find item ${entry.itemId} in P&L structure`);
      }
    });

    // Recalculate totals after manual entry updates
    const revenueSection = verticalPnLData.table.find((section: any) => section.type === 'revenue');
    const expensesSection = verticalPnLData.table.find((section: any) => section.type === 'expenses');
    const otherSection = verticalPnLData.table.find((section: any) => section.type === 'other');
    const ebitdaSection = verticalPnLData.table.find((section: any) => section.type === 'ebitda');

    if (revenueSection && expensesSection && otherSection && ebitdaSection) {
      // Recalculate section subtotals based on updated item amounts
      revenueSection.subtotal = revenueSection.items.reduce((sum: number, item: any) => sum + item.amount, 0);
      expensesSection.subtotal = expensesSection.items.reduce((sum: number, item: any) => sum + item.amount, 0);
      otherSection.subtotal = otherSection.items.reduce((sum: number, item: any) => sum + item.amount, 0);
      
      // Calculate EBITDA: Total Revenue + Income, Expenses and Other Items - Total Expenses
      const incomeExpensesOther = otherSection.subtotal;
      const ebitda = revenueSection.subtotal + incomeExpensesOther - expensesSection.subtotal;
      
      // Update EBITDA section subtotal (this is the calculated formula result, not sum of items)
      ebitdaSection.subtotal = ebitda;
      
      // Update summary values
      verticalPnLData.summary.revenue = revenueSection.subtotal;
      verticalPnLData.summary.operatingExpenses = expensesSection.subtotal;
      verticalPnLData.summary.grossProfit = revenueSection.subtotal - expensesSection.subtotal;
      verticalPnLData.summary.operatingProfit = verticalPnLData.summary.grossProfit;
      
      // Calculate depreciation from EBITDA section
      const depreciationItem = ebitdaSection.items.find((item: any) => item.id === 'depreciation');
      const depreciation = depreciationItem?.amount || 0;
      
      // Update net profit calculation (EBITDA - depreciation)
      const netProfit = ebitdaSection.subtotal - depreciation;
      verticalPnLData.summary.netProfit = netProfit;
    }
  }

  // Generate charts data from vertical P&L structure
  private generateChartsFromVerticalData(verticalPnLData: any) {
    const currentPeriod = new Date().toISOString().split('T')[0];
    
    return {
      netProfitOverTime: [
        {
          period: currentPeriod,
          netProfit: verticalPnLData.summary.netProfit || 0
        }
      ],
      revenueVsExpense: [
        {
          period: currentPeriod,
          revenue: verticalPnLData.summary.revenue || 0,
          expenses: verticalPnLData.summary.operatingExpenses || 0,
          netProfit: verticalPnLData.summary.netProfit || 0
        }
      ],
      marginTrend: [
        {
          period: currentPeriod,
          grossMargin: verticalPnLData.summary.revenue > 0 ? 
            ((verticalPnLData.summary.grossProfit || 0) / verticalPnLData.summary.revenue * 100).toFixed(1) : 0,
          netMargin: verticalPnLData.summary.revenue > 0 ? 
            ((verticalPnLData.summary.netProfit || 0) / verticalPnLData.summary.revenue * 100).toFixed(1) : 0
        }
      ]
    };
  }

  // Generate analysis data from vertical P&L structure
  private generateAnalysisFromVerticalData(verticalPnLData: any) {
    const alerts = [];
    const trends = [];
    const recommendations = [];

    // Generate alerts based on the data
    if (verticalPnLData.summary.netProfit < 0) {
      alerts.push({
        severity: 'error',
        message: `Net loss of KD ${Math.abs(verticalPnLData.summary.netProfit).toLocaleString()} recorded for this period.`
      });
    }

    if (verticalPnLData.summary.revenue === 0) {
      alerts.push({
        severity: 'warning',
        message: 'No revenue recorded for this period.'
      });
    }

    // Generate trends
    const grossMargin = verticalPnLData.summary.revenue > 0 ? 
      (verticalPnLData.summary.grossProfit / verticalPnLData.summary.revenue * 100) : 0;
    
    trends.push({
      description: `Gross margin is ${grossMargin.toFixed(1)}% for this period.`
    });

    // Generate recommendations
    if (grossMargin < 20) {
      recommendations.push('Consider reviewing cost structure to improve gross margins.');
    }

    if (verticalPnLData.summary.operatingExpenses > verticalPnLData.summary.revenue * 0.8) {
      recommendations.push('Operating expenses are high relative to revenue. Review expense optimization opportunities.');
    }

    return {
      alerts,
      trends,
      recommendations
    };
  }

  // Get quarter-specific data (Q1, Q2, Q3, Q4)
  public async getQuarterlyPnLData(year: number, quarter: number) {
    const quarterStartMonth = (quarter - 1) * 3;
    const startDate = new Date(year, quarterStartMonth, 1);
    const endDate = new Date(year, quarterStartMonth + 3, 0);

    return this.getPnLDataForPeriod('quarterly', startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
  }

  // Update Cost Analysis Dashboard data and sync with PnL
  public async updateCostAnalysisData(module: string, data: any) {
    try {
      // Update the specific module data
      await this.notifyDataChange(module, 'update', data);
      
      // Trigger PnL refresh
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('pnlRefreshNeeded', { 
          detail: { module, action: 'update', data } 
        }));
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error updating cost analysis data:', error);
      return false;
    }
  }

  // Calculate period costs for Cost Analysis Dashboards
  public calculatePeriodCosts(records: any[], dateField: string, costField: string) {
    const now = new Date();
    
    // Define period boundaries
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 1);
    
    const halfYearStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 6) * 6, 1);
    const halfYearEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 6) * 6 + 6, 1);
    
    // Financial year (Apr 1 - Mar 31)
    const currentYear = now.getFullYear();
    const fyStart = now.getMonth() >= 3 ? 
      new Date(currentYear, 3, 1) : 
      new Date(currentYear - 1, 3, 1);
    const fyEnd = now.getMonth() >= 3 ? 
      new Date(currentYear + 1, 3, 1) : 
      new Date(currentYear, 3, 1);

    // Calculate costs for each period
    const calculateCostForPeriod = (start: Date, end: Date) => {
      return records
        .filter(record => {
          const recordDate = new Date(record[dateField]);
          return recordDate >= start && recordDate < end;
        })
        .reduce((sum, record) => {
          const cost = typeof record[costField] === 'string' ? 
            parseFloat(record[costField]) || 0 : 
            record[costField] || 0;
          return sum + cost;
        }, 0);
    };

    return {
      daily: calculateCostForPeriod(todayStart, todayEnd),
      weekly: calculateCostForPeriod(weekStart, weekEnd),
      monthly: calculateCostForPeriod(monthStart, monthEnd),
      quarterly: calculateCostForPeriod(quarterStart, quarterEnd),
      halfYearly: calculateCostForPeriod(halfYearStart, halfYearEnd),
      yearly: calculateCostForPeriod(fyStart, fyEnd)
    };
  }

  // Cleanup
  public destroy() {
    if (this.eventSource) {
      this.eventSource.close();
    }
    this.updateCallbacks.clear();
    
    // Clear all debounce timeouts
    this.debounceTimeouts.forEach(timeout => clearTimeout(timeout));
    this.debounceTimeouts.clear();
  }
}

// Export singleton instance
export const pnlIntegrationService = PnLIntegrationService.getInstance();

// Enhanced Cost Analysis Dashboard Hook
export const usePnLIntegration = (module: string) => {
  const [pnlData, setPnlData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleUpdate = (updateInfo: any) => {
      console.log(`PnL update received for ${module}:`, updateInfo);
      // Refresh PnL data when updates occur
      refreshPnLData();
    };

    // Subscribe to updates
    pnlIntegrationService.subscribe(module, handleUpdate);

    // Listen for PnL refresh events
    const handlePnLRefresh = (event: any) => {
      if (event.detail.module === module || event.detail.module === 'all') {
        refreshPnLData();
      }
    };

    window.addEventListener('pnlRefreshNeeded', handlePnLRefresh);

    // Cleanup
    return () => {
      pnlIntegrationService.unsubscribe(module, handleUpdate);
      window.removeEventListener('pnlRefreshNeeded', handlePnLRefresh);
    };
  }, [module]);

  const refreshPnLData = async (period?: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await pnlIntegrationService.getPnLDataForPeriod(
        period || 'yearly', 
        startDate, 
        endDate
      );
      setPnlData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch PnL data');
    } finally {
      setLoading(false);
    }
  };

  const notifyDataChange = async (action: string, data: any) => {
    return pnlIntegrationService.updateCostAnalysisData(module, { action, data });
  };

  return {
    pnlData,
    loading,
    error,
    refreshPnLData,
    notifyDataChange
  };
};

// Period calculation utilities
export const getPeriodBoundaries = (period: string, customStart?: string, customEnd?: string) => {
  const now = new Date();
  
  if (customStart && customEnd) {
    return {
      start: new Date(customStart),
      end: new Date(customEnd)
    };
  }

  switch (period.toLowerCase()) {
    case 'daily':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      };
    
    case 'weekly':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return {
        start: weekStart,
        end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
    
    case 'monthly':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3);
      return {
        start: new Date(now.getFullYear(), quarter * 3, 1),
        end: new Date(now.getFullYear(), (quarter + 1) * 3, 1)
      };
    
    case 'q1':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 3, 1)
      };
    
    case 'q2':
      return {
        start: new Date(now.getFullYear(), 3, 1),
        end: new Date(now.getFullYear(), 6, 1)
      };
    
    case 'q3':
      return {
        start: new Date(now.getFullYear(), 6, 1),
        end: new Date(now.getFullYear(), 9, 1)
      };
    
    case 'q4':
      return {
        start: new Date(now.getFullYear(), 9, 1),
        end: new Date(now.getFullYear() + 1, 0, 1)
      };
    
    case 'half_yearly':
      const half = Math.floor(now.getMonth() / 6);
      return {
        start: new Date(now.getFullYear(), half * 6, 1),
        end: new Date(now.getFullYear(), (half + 1) * 6, 1)
      };
    
    case 'yearly':
    default:
      // Financial year (Apr 1 - Mar 31)
      const currentYear = now.getFullYear();
      const fyStart = now.getMonth() >= 3 ? 
        new Date(currentYear, 3, 1) : 
        new Date(currentYear - 1, 3, 1);
      const fyEnd = now.getMonth() >= 3 ? 
        new Date(currentYear + 1, 3, 1) : 
        new Date(currentYear, 3, 1);
      
      return { start: fyStart, end: fyEnd };
  }
};

export default pnlIntegrationService;



