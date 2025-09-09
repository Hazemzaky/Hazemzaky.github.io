import { useEffect, useRef } from 'react';
import { pnlIntegrationService } from './pnlIntegrationService';

/**
 * Hook to synchronize a module's aggregated costs with the P&L system.
 * It computes period costs from the provided records and posts them to the backend.
 */
export const useModulePnLSync = (
  moduleName: string,
  records: any[],
  dateField: string,
  costField: string
) => {
  const lastPayloadRef = useRef<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!moduleName || !Array.isArray(records)) return;

    // Debounce rapid updates during initial loads
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const costs = pnlIntegrationService.calculatePeriodCosts(records, dateField, costField);
        const payload = JSON.stringify({ moduleName, costs, recordCount: records.length });

        // Avoid sending duplicate payloads
        if (payload === lastPayloadRef.current) return;
        lastPayloadRef.current = payload;

        await pnlIntegrationService.updateCostAnalysisData(moduleName, {
          costs,
          recordCount: records.length
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('PnL sync failed for module:', moduleName, err);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [moduleName, records, dateField, costField]);
};

export default useModulePnLSync;


