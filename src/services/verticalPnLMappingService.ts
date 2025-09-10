import api from '../apiBase';

// Vertical P&L Categories based on your specification
export const VERTICAL_PNL_CATEGORIES = {
  // Revenue Section
  REVENUE: {
    OPERATING_REVENUES: 'operating_revenues',
    REBATE: 'rebate',
    NET_OPERATING_REVENUE: 'net_operating_revenue',
    SALES: 'sales',
    REVENUE_RENTAL_EQUIPMENT: 'revenue_rental_equipment',
    REVENUE_DS: 'revenue_ds',
    REVENUE_SUB_COMPANIES: 'revenue_sub_companies',
    OTHER_REVENUE: 'other_revenue',
    PROVISION_END_SERVICE_NOT_REQUIRED: 'provision_end_service_not_required',
    PROVISION_IMPAIRMENT_NOT_REQUIRED: 'provision_impairment_not_required',
    TOTAL_REVENUE: 'total_revenue'
  },
  
  // Expenses Section
  EXPENSES: {
    OPERATION_COST: 'operation_cost',
    COST_RENTAL_EQUIPMENT: 'cost_rental_equipment',
    COST_DS: 'cost_ds',
    GENERAL_ADMIN_EXPENSES: 'general_admin_expenses',
    STAFF_COSTS: 'staff_costs',
    BUSINESS_TRIP_EXPENSES: 'business_trip_expenses',
    OVERTIME_EXPENSES: 'overtime_expenses',
    TRIP_ALLOWANCE_EXPENSES: 'trip_allowance_expenses',
    FOOD_ALLOWANCE_EXPENSES: 'food_allowance_expenses',
    HSE_TRAINING_EXPENSES: 'hse_training_expenses',
    INVENTORY_MATERIAL_COSTS: 'inventory_material_costs',
    LEGAL_COMPLIANCE_COSTS: 'legal_compliance_costs',
    FACILITY_INFRASTRUCTURE_COSTS: 'facility_infrastructure_costs',
    PROVISION_EXPECTED_CREDIT_LOSS: 'provision_expected_credit_loss',
    COST_SERVICE_AGREEMENT: 'cost_service_agreement',
    TOTAL_EXPENSES: 'total_expenses'
  },
  
  // Income, Expenses and Other Items
  OTHER_ITEMS: {
    GAIN_SELLING_OTHER_PRODUCTS: 'gain_selling_other_products',
    EBITDA: 'ebitda',
    FINANCE_COSTS: 'finance_costs',
    DEPRECIATION: 'depreciation',
    NET_PROFIT: 'net_profit'
  }
};

// Module to P&L Category Mapping
export const MODULE_PNL_MAPPING = {
  // HR Module mappings
  hr: {
    payroll: VERTICAL_PNL_CATEGORIES.EXPENSES.STAFF_COSTS,
    employees: VERTICAL_PNL_CATEGORIES.EXPENSES.STAFF_COSTS,
    overtime: VERTICAL_PNL_CATEGORIES.EXPENSES.OVERTIME_EXPENSES,
    businessTrips: VERTICAL_PNL_CATEGORIES.EXPENSES.BUSINESS_TRIP_EXPENSES,
    tripAllowance: VERTICAL_PNL_CATEGORIES.EXPENSES.TRIP_ALLOWANCE_EXPENSES,
    foodAllowance: VERTICAL_PNL_CATEGORIES.EXPENSES.FOOD_ALLOWANCE_EXPENSES
  },
  
  // Assets Module mappings
  assets: {
    depreciation: VERTICAL_PNL_CATEGORIES.OTHER_ITEMS.DEPRECIATION,
    rentalRevenue: VERTICAL_PNL_CATEGORIES.REVENUE.REVENUE_RENTAL_EQUIPMENT,
    assetCosts: VERTICAL_PNL_CATEGORIES.EXPENSES.COST_RENTAL_EQUIPMENT
  },
  
  // Operations Module mappings
  operations: {
    fuelCosts: VERTICAL_PNL_CATEGORIES.EXPENSES.OPERATION_COST,
    vehicleCosts: VERTICAL_PNL_CATEGORIES.EXPENSES.OPERATION_COST,
    logisticsCosts: VERTICAL_PNL_CATEGORIES.EXPENSES.OPERATION_COST
  },
  
  // Maintenance Module mappings
  maintenance: {
    maintenanceCosts: VERTICAL_PNL_CATEGORIES.EXPENSES.COST_SERVICE_AGREEMENT,
    spareParts: VERTICAL_PNL_CATEGORIES.EXPENSES.INVENTORY_MATERIAL_COSTS
  },
  
  // Procurement Module mappings
  procurement: {
    procurementCosts: VERTICAL_PNL_CATEGORIES.EXPENSES.OPERATION_COST,
    supplierCosts: VERTICAL_PNL_CATEGORIES.EXPENSES.OPERATION_COST
  },
  
  // HSE Module mappings
  hse: {
    safetyTraining: VERTICAL_PNL_CATEGORIES.EXPENSES.HSE_TRAINING_EXPENSES,
    safetyEquipment: VERTICAL_PNL_CATEGORIES.EXPENSES.HSE_TRAINING_EXPENSES,
    environmentalCosts: VERTICAL_PNL_CATEGORIES.EXPENSES.HSE_TRAINING_EXPENSES
  },
  
  // Admin Module mappings
  admin: {
    generalAdmin: VERTICAL_PNL_CATEGORIES.EXPENSES.GENERAL_ADMIN_EXPENSES,
    legalCompliance: VERTICAL_PNL_CATEGORIES.EXPENSES.LEGAL_COMPLIANCE_COSTS,
    facilityInfrastructure: VERTICAL_PNL_CATEGORIES.EXPENSES.FACILITY_INFRASTRUCTURE_COSTS
  },
  
  // Inventory Module mappings
  inventory: {
    inventoryCosts: VERTICAL_PNL_CATEGORIES.EXPENSES.INVENTORY_MATERIAL_COSTS,
    materialCosts: VERTICAL_PNL_CATEGORIES.EXPENSES.INVENTORY_MATERIAL_COSTS
  },
  
  // Sales Module mappings
  sales: {
    salesRevenue: VERTICAL_PNL_CATEGORIES.REVENUE.SALES,
    operatingRevenues: VERTICAL_PNL_CATEGORIES.REVENUE.OPERATING_REVENUES,
    netOperatingRevenue: VERTICAL_PNL_CATEGORIES.REVENUE.NET_OPERATING_REVENUE
  },
  
  // Invoices Module mappings
  invoices: {
    invoiceRevenue: VERTICAL_PNL_CATEGORIES.REVENUE.NET_OPERATING_REVENUE,
    otherRevenue: VERTICAL_PNL_CATEGORIES.REVENUE.OTHER_REVENUE
  }
};

// Cost Data Aggregation Interface
interface ModuleCostData {
  module: string;
  category: string;
  subcategory?: string;
  amount: number;
  period: string;
  records: any[];
  calculationMethod: 'sum' | 'average' | 'depreciation' | 'manual';
  metadata?: any;
}

// Vertical P&L Mapping Service
export class VerticalPnLMappingService {
  private static instance: VerticalPnLMappingService;

  private constructor() {}

  public static getInstance(): VerticalPnLMappingService {
    if (!VerticalPnLMappingService.instance) {
      VerticalPnLMappingService.instance = new VerticalPnLMappingService();
    }
    return VerticalPnLMappingService.instance;
  }

  // Aggregate costs from all modules for a specific period
  public async aggregateAllModuleCosts(period: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      console.log('Aggregating costs for period:', { period, startDate, endDate });

      // Fetch data from all modules in parallel
      const [
        hrData,
        assetsData,
        operationsData,
        maintenanceData,
        procurementData,
        hseData,
        adminData,
        inventoryData,
        salesData,
        invoicesData,
        fuelLogsData
      ] = await Promise.allSettled([
        this.getHRCosts(period, startDate, endDate),
        this.getAssetsCosts(period, startDate, endDate),
        this.getOperationsCosts(period, startDate, endDate),
        this.getMaintenanceCosts(period, startDate, endDate),
        this.getProcurementCosts(period, startDate, endDate),
        this.getHSECosts(period, startDate, endDate),
        this.getAdminCosts(period, startDate, endDate),
        this.getInventoryCosts(period, startDate, endDate),
        this.getSalesCosts(period, startDate, endDate),
        this.getInvoicesCosts(period, startDate, endDate),
        this.getFuelLogsCosts(period, startDate, endDate)
      ]);

      // Process results and handle errors gracefully
      const moduleResults = {
        hr: hrData.status === 'fulfilled' ? hrData.value : { costs: {}, error: hrData.reason },
        assets: assetsData.status === 'fulfilled' ? assetsData.value : { costs: {}, error: assetsData.reason },
        operations: operationsData.status === 'fulfilled' ? operationsData.value : { costs: {}, error: operationsData.reason },
        maintenance: maintenanceData.status === 'fulfilled' ? maintenanceData.value : { costs: {}, error: maintenanceData.reason },
        procurement: procurementData.status === 'fulfilled' ? procurementData.value : { costs: {}, error: procurementData.reason },
        hse: hseData.status === 'fulfilled' ? hseData.value : { costs: {}, error: hseData.reason },
        admin: adminData.status === 'fulfilled' ? adminData.value : { costs: {}, error: adminData.reason },
        inventory: inventoryData.status === 'fulfilled' ? inventoryData.value : { costs: {}, error: inventoryData.reason },
        sales: salesData.status === 'fulfilled' ? salesData.value : { costs: {}, error: salesData.reason },
        invoices: invoicesData.status === 'fulfilled' ? invoicesData.value : { costs: {}, error: invoicesData.reason },
        fuelLogs: fuelLogsData.status === 'fulfilled' ? fuelLogsData.value : { costs: {}, error: fuelLogsData.reason }
      };

      console.log('Module results:', moduleResults);

      // Build the vertical P&L structure
      const verticalPnL = this.buildVerticalPnLStructure(moduleResults, period);

      return verticalPnL;
    } catch (error) {
      console.error('Error aggregating module costs:', error);
      
      // Return fallback structure with all specified P&L items when backend is unavailable
      return this.getFallbackPnLStructure(period);
    }
  }

  // Fallback P&L structure when backend is unavailable
  private getFallbackPnLStructure(period: string): any {
    console.log('Using fallback P&L structure - backend unavailable');
    
    return this.buildVerticalPnLStructure({
      hr: { costs: {} },
      assets: { costs: {} },
      operations: { costs: {} },
      maintenance: { costs: {} },
      procurement: { costs: {} },
      hse: { costs: {} },
      admin: { costs: {} },
      inventory: { costs: {} },
      sales: { costs: {} },
      invoices: { costs: {} },
      fuelLogs: { costs: {} }
    }, period);
  }

  // Get HR-related costs
  private async getHRCosts(period: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = this.buildDateParams(period, startDate, endDate);
      
      const [payrollRes, tripsRes] = await Promise.allSettled([
        api.get(`/payroll?${params}`),
        api.get(`/business-trips?${params}`)
      ]);

      const costs = {
        staffCosts: 0,
        businessTripExpenses: 0
      };

      // Process payroll data
      if (payrollRes.status === 'fulfilled' && payrollRes.value.data) {
        const payrolls = Array.isArray(payrollRes.value.data) ? payrollRes.value.data : [];
        costs.staffCosts = payrolls.reduce((sum: number, p: any) => sum + (p.netPay || 0), 0);
      }

      // Process business trips data
      if (tripsRes.status === 'fulfilled' && tripsRes.value.data) {
        const trips = Array.isArray(tripsRes.value.data) ? tripsRes.value.data : [];
        costs.businessTripExpenses = trips.reduce((sum: number, t: any) => sum + (t.cost || 0), 0);
      }

      return { costs, module: 'hr' };
    } catch (error) {
      console.error('Error fetching HR costs:', error);
      return { costs: {}, error: error };
    }
  }

  // Get Assets-related costs and rental revenue from completed projects
  private async getAssetsCosts(period: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = this.buildDateParams(period, startDate, endDate);
      
      const [assetsRes, depreciationRes, projectsRes] = await Promise.allSettled([
        api.get(`/assets?${params}`),
        api.get(`/depreciation?${params}`),
        api.get(`/projects?${params}`)
      ]);

      const costs = {
        rentalEquipmentRevenue: 0,
        rentalEquipmentCosts: 0,
        depreciation: 0
      };

      // Process completed projects for rental equipment revenue
      if (projectsRes.status === 'fulfilled' && projectsRes.value.data) {
        const projects = Array.isArray(projectsRes.value.data) ? projectsRes.value.data : [];
        
        // Calculate rental revenue from COMPLETED PROJECTS ONLY
        costs.rentalEquipmentRevenue = this.calculateRevenueFromCompletedProjects(projects, period, startDate, endDate);
      }

      // Process assets data for operating costs
      if (assetsRes.status === 'fulfilled' && assetsRes.value.data) {
        const assets = Array.isArray(assetsRes.value.data) ? assetsRes.value.data : [];
        // Calculate rental equipment operating costs
        assets.forEach((asset: any) => {
          if (asset.operatingCost) costs.rentalEquipmentCosts += asset.operatingCost;
        });
      }

      // Process depreciation data
      if (depreciationRes.status === 'fulfilled' && depreciationRes.value.data) {
        const depreciations = Array.isArray(depreciationRes.value.data) ? depreciationRes.value.data : [];
        costs.depreciation = depreciations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
      }

      return { costs, module: 'assets' };
    } catch (error) {
      console.error('Error fetching Assets costs:', error);
      return { costs: {}, error: error };
    }
  }

  // Calculate rental revenue from completed projects only
  private calculateRevenueFromCompletedProjects(projects: any[], period: string, startDate?: string, endDate?: string): number {
    // Get period boundaries
    const boundaries = this.getPeriodBoundaries(period, startDate, endDate);
    
    return projects
      .filter(project => {
        // Only include completed projects
        if (project.status !== 'completed' || !project.endTime) return false;
        
        const projectEndDate = new Date(project.endTime);
        return projectEndDate >= boundaries.start && projectEndDate < boundaries.end;
      })
      .reduce((total, project) => total + (project.revenue || 0), 0);
  }

  // Get period boundaries helper method
  private getPeriodBoundaries(period: string, startDate?: string, endDate?: string): { start: Date; end: Date } {
    if (startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    const now = new Date();
    
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
  }

  // Get Operations-related costs (Fuel, Vehicles, Overtime, Trip Allowances)
  private async getOperationsCosts(period: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = this.buildDateParams(period, startDate, endDate);
      
      const [fuelRes, vehicleRes, overtimeRes, tripAllowanceRes, foodAllowanceRes] = await Promise.allSettled([
        api.get(`/fuel-logs?${params}`),
        api.get(`/water-logs?${params}`), // Using water logs as vehicle operations proxy
        api.get(`/overtime?${params}`),
        api.get(`/trip-allowance?${params}`),
        api.get(`/food-allowance?${params}`)
      ]);

      const costs = {
        operationCosts: 0,
        fuelCosts: 0,
        vehicleCosts: 0,
        overtimeExpenses: 0,
        tripAllowanceExpenses: 0,
        foodAllowanceExpenses: 0
      };

      // Process fuel data
      if (fuelRes.status === 'fulfilled' && fuelRes.value.data) {
        const fuels = Array.isArray(fuelRes.value.data) ? fuelRes.value.data : [];
        costs.fuelCosts = fuels.reduce((sum: number, f: any) => sum + (f.totalCost || 0), 0);
      }

      // Process vehicle operations data
      if (vehicleRes.status === 'fulfilled' && vehicleRes.value.data) {
        const vehicles = Array.isArray(vehicleRes.value.data) ? vehicleRes.value.data : [];
        costs.vehicleCosts = vehicles.reduce((sum: number, v: any) => sum + (v.cost || 0), 0);
      }

      // Process overtime data (Operations Module - from Overtime page)
      if (overtimeRes.status === 'fulfilled' && overtimeRes.value.data) {
        const overtimes = Array.isArray(overtimeRes.value.data) ? overtimeRes.value.data : [];
        costs.overtimeExpenses = overtimes.reduce((sum: number, o: any) => sum + (Number(o.totalCost) || 0), 0);
      }

      // Process trip allowance data (Operations Module - from Trip Allowance page)
      if (tripAllowanceRes.status === 'fulfilled' && tripAllowanceRes.value.data) {
        const tripAllowances = Array.isArray(tripAllowanceRes.value.data) ? tripAllowanceRes.value.data : [];
        costs.tripAllowanceExpenses = tripAllowances.reduce((sum: number, t: any) => sum + (Number(t.allowance) || 0), 0);
      }

      // Process food allowance data (Operations Module - from Food Allowance page)
      if (foodAllowanceRes.status === 'fulfilled' && foodAllowanceRes.value.data) {
        const foodAllowances = Array.isArray(foodAllowanceRes.value.data) ? foodAllowanceRes.value.data : [];
        costs.foodAllowanceExpenses = foodAllowances.reduce((sum: number, f: any) => sum + (Number(f.value) || 0), 0);
      }

      costs.operationCosts = costs.fuelCosts + costs.vehicleCosts + costs.overtimeExpenses + costs.tripAllowanceExpenses + costs.foodAllowanceExpenses;

      return { costs, module: 'operations' };
    } catch (error) {
      console.error('Error fetching Operations costs:', error);
      return { costs: {}, error: error };
    }
  }

  // Get Maintenance-related costs
  private async getMaintenanceCosts(period: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = this.buildDateParams(period, startDate, endDate);
      
      const maintenanceRes = await api.get(`/maintenance?${params}`);

      const costs = {
        maintenanceCosts: 0
      };

      if (maintenanceRes.data) {
        const maintenances = Array.isArray(maintenanceRes.data) ? maintenanceRes.data : [];
        // Only include actual maintenance costs, not service agreements
        costs.maintenanceCosts = maintenances.reduce((sum: number, m: any) => sum + (m.totalCost || 0), 0);
      }

      return { costs, module: 'maintenance' };
    } catch (error) {
      console.error('Error fetching Maintenance costs:', error);
      return { costs: {}, error: error };
    }
  }

  // Get Fuel Logs-related costs
  private async getFuelLogsCosts(period: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = this.buildDateParams(period, startDate, endDate);
      
      const fuelLogsRes = await api.get(`/fuel-logs?${params}`);

      const costs = {
        fuelCosts: 0
      };

      if (fuelLogsRes.data) {
        const fuelLogs = Array.isArray(fuelLogsRes.data) ? fuelLogsRes.data : [];
        costs.fuelCosts = fuelLogs.reduce((sum: number, f: any) => sum + (f.totalCost || 0), 0);
      }

      return { costs, module: 'fuelLogs' };
    } catch (error) {
      console.error('Error fetching Fuel Logs costs:', error);
      return { costs: {}, error: error };
    }
  }

  // Get Procurement-related costs
  private async getProcurementCosts(period: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = this.buildDateParams(period, startDate, endDate);
      
      const procurementRes = await api.get(`/purchase-requests?${params}`).catch(() => ({ data: [] })); // Handle 404 gracefully

      const costs = {
        procurementCosts: 0
      };

      if (procurementRes.data) {
        const procurements = Array.isArray(procurementRes.data) ? procurementRes.data : [];
        costs.procurementCosts = procurements.reduce((sum: number, p: any) => sum + (p.estimatedCost || 0), 0);
      }

      return { costs, module: 'procurement' };
    } catch (error) {
      console.error('Error fetching Procurement costs:', error);
      return { costs: { procurementCosts: 0 }, error: error };
    }
  }

  // Get HSE-related costs (Training & Competency)
  private async getHSECosts(period: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = this.buildDateParams(period, startDate, endDate);
      
      const [hseRes, trainingRes] = await Promise.allSettled([
        api.get(`/hse/accidents?${params}`).catch(() => ({ data: [] })), // Handle 404 gracefully
        api.get(`/hse/training?${params}`)
      ]);

      const costs = {
        hseTrainingExpenses: 0,
        safetyExpenses: 0
      };

      // Process HSE incidents data
      if (hseRes.status === 'fulfilled' && hseRes.value.data) {
        const hseItems = Array.isArray(hseRes.value.data) ? hseRes.value.data : [];
        costs.safetyExpenses = hseItems.reduce((sum: number, h: any) => sum + (h.cost || 0), 0);
      }

      // Process HSE training data (from Training & Competency tab)
      if (trainingRes.status === 'fulfilled' && trainingRes.value.data) {
        const trainingData = Array.isArray(trainingRes.value.data) ? trainingRes.value.data : [];
        
        // Calculate training costs based on period and amortization
        costs.hseTrainingExpenses = this.calculateHSETrainingCosts(trainingData, period, startDate, endDate);
      }

      return { costs, module: 'hse' };
    } catch (error) {
      console.error('Error fetching HSE costs:', error);
      return { costs: { hseTrainingExpenses: 0, safetyExpenses: 0 }, error: error };
    }
  }

  // Calculate HSE training costs with amortization support
  private calculateHSETrainingCosts(trainings: any[], period: string, startDate?: string, endDate?: string): number {
    const boundaries = this.getPeriodBoundaries(period, startDate, endDate);
    
    return trainings.reduce((total, training) => {
      const cost = Number(training.cost) || 0;
      const amortization = Number(training.amortization) || 0;
      const trainingStartDate = new Date(training.startDate);
      
      if (amortization > 0) {
        // For amortized costs, calculate the portion for this period
        const monthlyAmount = cost / amortization;
        const trainingEndDate = new Date(trainingStartDate);
        trainingEndDate.setMonth(trainingEndDate.getMonth() + amortization);
        
        // Check if there's any overlap between training period and reporting period
        if (trainingStartDate > boundaries.end || trainingEndDate < boundaries.start) {
          return total; // No overlap, no cost for this period
        }
        
        // Calculate the overlap period
        const overlapStart = new Date(Math.max(trainingStartDate.getTime(), boundaries.start.getTime()));
        const overlapEnd = new Date(Math.min(trainingEndDate.getTime(), boundaries.end.getTime()));
        
        // Calculate how many months of amortization fall within this period
        const overlapMonths = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
        
        return total + (monthlyAmount * Math.max(0, overlapMonths));
      } else {
        // For non-amortized costs, only count if training is within the period
        if (trainingStartDate >= boundaries.start && trainingStartDate < boundaries.end) {
          return total + cost;
        }
      }
      
      return total;
    }, 0);
  }

  // Get Admin-related costs (Legal Case Management, Company Facility Documents & Government Correspondence Log)
  private async getAdminCosts(period: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = this.buildDateParams(period, startDate, endDate);
      
      // Fetch legal cases, facility documents, and government correspondence from Admin page
      const [legalCasesRes, facilitiesRes, correspondenceRes] = await Promise.allSettled([
        api.get(`/admin/legal-cases?${params}`),
        api.get(`/admin/company-facilities?${params}`),
        api.get(`/admin/government-correspondence?${params}`)
      ]);

      const costs = {
        generalAdminExpenses: 0,
        legalComplianceCosts: 0,
        facilityInfrastructureCosts: 0
      };

      // Calculate legal compliance costs from Legal Case Management tab
      if (legalCasesRes.status === 'fulfilled' && legalCasesRes.value.data) {
        const legalCases = Array.isArray(legalCasesRes.value.data) ? legalCasesRes.value.data : [];
        
        // Calculate total legal costs from actualCost and contractAmount
        costs.legalComplianceCosts = legalCases.reduce((sum: number, legalCase: any) => {
          const actualCost = parseFloat(legalCase.actualCost) || 0;
          const contractAmount = parseFloat(legalCase.legalRepresentative?.contractAmount) || 0;
          const actualLegalRepCost = parseFloat(legalCase.actualLegalRepCost) || 0;
          const otherCosts = parseFloat(legalCase.otherCosts) || 0;
          const totalActualCost = parseFloat(legalCase.totalActualCost) || 0;
          
          // Sum all actual costs (excluding estimatedCost as per Admin page logic)
          const totalCost = actualCost + contractAmount + actualLegalRepCost + otherCosts + totalActualCost;
          
          // Check if filing date falls within the period
          if (legalCase.filingDate) {
            const filingDate = new Date(legalCase.filingDate);
            const periodBoundaries = this.getPeriodBoundaries(period, startDate, endDate);
            
            if (filingDate >= periodBoundaries.start && filingDate < periodBoundaries.end) {
              return sum + totalCost;
            }
          }
          
          return sum;
        }, 0);
      }

      // Calculate facility & infrastructure costs from Company Facility Documents tab
      if (facilitiesRes.status === 'fulfilled' && facilitiesRes.value.data) {
        const facilities = Array.isArray(facilitiesRes.value.data) ? facilitiesRes.value.data : [];
        
        costs.facilityInfrastructureCosts = facilities.reduce((sum: number, facility: any) => {
          let facilityCost = 0;
          
          // Add rent agreement costs (monthly rent) - this is the main facility cost
          if (facility.rentAgreement?.monthlyRent) {
            facilityCost += Number(facility.rentAgreement.monthlyRent) || 0;
          }
          
          // Add amortized security deposit if applicable
          if (facility.hasSecurityDeposit === 'Yes' && facility.securityDepositAmount && facility.securityDepositAmortization) {
            const securityDepositAmount = Number(facility.securityDepositAmount) || 0;
            const securityDepositAmortization = Number(facility.securityDepositAmortization) || 0;
            
            if (securityDepositAmount > 0 && securityDepositAmortization > 0 && facility.rentAgreement?.startDate) {
              const startDate = new Date(facility.rentAgreement.startDate);
              const { start, end } = this.getPeriodBoundaries(period, startDate.toISOString(), endDate);
              
              // Calculate amortized portion of security deposit
              const amortizedDeposit = this.calculateAmortizedCost(
                securityDepositAmount, 
                securityDepositAmortization, 
                startDate, 
                start, 
                end
              );
              facilityCost += amortizedDeposit;
            }
          }
          
          // For facility costs, we don't need to check creation date since rent is ongoing
          // The monthly rent should be included for the current period regardless of when the facility was created
          return sum + facilityCost;
        }, 0);
      }

      // Calculate general administrative expenses from Government Correspondence Log
      if (correspondenceRes.status === 'fulfilled' && correspondenceRes.value.data) {
        const correspondences = Array.isArray(correspondenceRes.value.data) ? correspondenceRes.value.data : [];
        
        // Calculate total correspondence costs from fees
        costs.generalAdminExpenses = correspondences.reduce((sum: number, correspondence: any) => {
          const fee = parseFloat(correspondence.fee) || 0;
          const amortization = parseInt(correspondence.amortization) || 0;
          
          if (fee > 0) {
            if (amortization > 0 && correspondence.submissionDate) {
              // For amortized correspondence costs
              const submissionDate = new Date(correspondence.submissionDate);
              const periodBoundaries = this.getPeriodBoundaries(period, startDate, endDate);
              
              // Calculate amortized portion for this period
              const amortizedCost = this.calculateAmortizedCost(
                fee, 
                amortization, 
                submissionDate, 
                periodBoundaries.start, 
                periodBoundaries.end
              );
              return sum + amortizedCost;
            } else if (correspondence.submissionDate) {
              // For non-amortized costs, include if submission date falls within period
              const submissionDate = new Date(correspondence.submissionDate);
              const periodBoundaries = this.getPeriodBoundaries(period, startDate, endDate);
              
              if (submissionDate >= periodBoundaries.start && submissionDate < periodBoundaries.end) {
                return sum + fee;
              }
            }
          }
          
          return sum;
        }, 0);
      }

      return { costs, module: 'admin' };
    } catch (error) {
      console.error('Error fetching Admin costs:', error);
      return { costs: {}, error: error };
    }
  }

  // Get Inventory-related costs
  private async getInventoryCosts(period: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = this.buildDateParams(period, startDate, endDate);
      
      const inventoryRes = await api.get(`/inventory/items?${params}`).catch(() => ({ data: [] })); // Handle 404 gracefully

      const costs = {
        inventoryMaterialCosts: 0
      };

      if (inventoryRes.data) {
        const inventoryItems = Array.isArray(inventoryRes.data) ? inventoryRes.data : [];
        costs.inventoryMaterialCosts = inventoryItems.reduce((sum: number, i: any) => 
          sum + ((i.purchaseCost || 0) * (i.quantity || 0)), 0
        );
      }

      return { costs, module: 'inventory' };
    } catch (error) {
      console.error('Error fetching Inventory costs:', error);
      return { costs: { inventoryMaterialCosts: 0 }, error: error };
    }
  }

  // Get Sales-related revenue
  private async getSalesCosts(period: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = this.buildDateParams(period, startDate, endDate);
      
      const salesRes = await api.get(`/quotations?${params}`).catch(() => ({ data: [] })); // Handle 404 gracefully

      const costs = {
        salesRevenue: 0,
        operatingRevenues: 0
      };

      if (salesRes.data) {
        const sales = Array.isArray(salesRes.data) ? salesRes.data : [];
        costs.salesRevenue = sales.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0);
        costs.operatingRevenues = costs.salesRevenue;
      }

      return { costs, module: 'sales' };
    } catch (error) {
      console.error('Error fetching Sales data:', error);
      return { costs: { salesRevenue: 0, operatingRevenues: 0 }, error: error };
    }
  }

  // Get Invoices-related revenue
  private async getInvoicesCosts(period: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = this.buildDateParams(period, startDate, endDate);
      
      const invoicesRes = await api.get(`/invoices?${params}`).catch(() => ({ data: [] })); // Handle 500 gracefully

      const costs = {
        invoiceRevenue: 0,
        netOperatingRevenue: 0
      };

      if (invoicesRes.data) {
        const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
        costs.invoiceRevenue = invoices.reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);
        costs.netOperatingRevenue = costs.invoiceRevenue;
      }

      return { costs, module: 'invoices' };
    } catch (error) {
      console.error('Error fetching Invoices data:', error);
      return { costs: { invoiceRevenue: 0, netOperatingRevenue: 0 }, error: error };
    }
  }

  // Build the vertical P&L structure from module data
  private buildVerticalPnLStructure(moduleResults: any, period: string): any {
    const pnlStructure = {
      period,
      summary: {
        revenue: 0,
        costOfSales: 0,
        grossProfit: 0,
        grossMargin: '0%',
        operatingExpenses: 0,
        operatingProfit: 0,
        operatingMargin: '0%',
        netProfit: 0,
        profitForPeriod: 0,
        netMargin: '0%',
        ebitda: 0
      },
      table: [] as any[],
      breakdown: {
        revenue: {},
        expenses: {},
        moduleContributions: {}
      }
    };

    // Revenue Section - Include ALL specified items
    const revenueSection = {
      id: 'revenue',
      category: 'Revenue',
      type: 'revenue',
      subtotal: 0,
      items: [] as any[]
    };

    // Complete Revenue Items as per your specification
    const revenueItems = [
      {
        id: 'revenue_rental_equipment',
        description: 'Revenue from Rental Equipment (Completed Projects)',
        amount: moduleResults.assets?.costs?.rentalEquipmentRevenue || 0,
        module: 'projects',
        type: 'revenue'
      },
      {
        id: 'ds_revenue',
        description: 'Revenue from DS',
        amount: 0, // Manual entry
        module: 'manual',
        type: 'revenue'
      },
      {
        id: 'sub_companies_revenue',
        description: 'Revenue from Sub Companies',
        amount: 0, // Manual entry
        module: 'manual',
        type: 'revenue'
      },
      {
        id: 'other_revenue',
        description: 'Other Revenue',
        amount: 0, // Manual entry
        module: 'manual',
        type: 'revenue'
      },
      {
        id: 'provision_end_service',
        description: 'Provision for End of Service Indemnity No Longer Required',
        amount: 0, // Manual entry
        module: 'manual',
        type: 'revenue'
      },
      {
        id: 'provision_impairment',
        description: 'Provision for Impairment Loss No Longer Required',
        amount: 0, // Manual entry
        module: 'manual',
        type: 'revenue'
      },
      {
        id: 'rebate',
        description: 'Rebate',
        amount: 0, // Manual entry
        module: 'manual',
        type: 'revenue'
      }
    ];

    // Add all revenue items and calculate total
    revenueItems.forEach(item => {
      revenueSection.items.push(item);
      revenueSection.subtotal += item.amount;
    });

    // Expenses Section - Include ALL specified items
    const expensesSection = {
      id: 'expenses',
      category: 'Expenses',
      type: 'expenses',
      subtotal: 0,
      items: [] as any[]
    };

    // Complete Expense Items as per your specification
    const expenseItems = [
      // Operation Cost as parent category with sub-items
      {
        id: 'operation_cost',
        description: 'Operation Cost',
        amount: (moduleResults.operations?.costs?.operationCosts || 0) + 
                (moduleResults.operations?.costs?.overtimeExpenses || 0) + 
                (moduleResults.operations?.costs?.tripAllowanceExpenses || 0) + 
                (moduleResults.operations?.costs?.foodAllowanceExpenses || 0) + 
                (moduleResults.fuelLogs?.costs?.fuelCosts || 0) + 
                (moduleResults.maintenance?.costs?.maintenanceCosts || 0),
        module: 'operations',
        type: 'expense',
        isParent: true,
        subItems: [
          {
            id: 'base_operation_cost',
            description: 'Base Operation Cost',
            amount: moduleResults.operations?.costs?.operationCosts || 0,
            module: 'operations',
            type: 'expense'
          },
          {
            id: 'overtime_expenses',
            description: 'Overtime Expenses',
            amount: moduleResults.operations?.costs?.overtimeExpenses || 0,
            module: 'operations',
            type: 'expense'
          },
          {
            id: 'trip_allowance_expenses',
            description: 'Trip Allowance Expenses',
            amount: moduleResults.operations?.costs?.tripAllowanceExpenses || 0,
            module: 'operations',
            type: 'expense'
          },
          {
            id: 'food_allowance_expenses',
            description: 'Food Allowance Expenses',
            amount: moduleResults.operations?.costs?.foodAllowanceExpenses || 0,
            module: 'operations',
            type: 'expense'
          },
          {
            id: 'fuel_log_costs',
            description: 'Fuel Log Costs',
            amount: moduleResults.fuelLogs?.costs?.fuelCosts || 0,
            module: 'fuelLogs',
            type: 'expense'
          },
          {
            id: 'maintenance_costs',
            description: 'Maintenance Costs',
            amount: moduleResults.maintenance?.costs?.maintenanceCosts || 0,
            module: 'maintenance',
            type: 'expense'
          }
        ]
      },
      {
        id: 'rental_equipment_cost',
        description: 'Cost of Rental Equipment (Manual Entry)',
        amount: 0, // Manual entry
        module: 'manual',
        type: 'expense'
      },
      {
        id: 'ds_cost',
        description: 'Cost of DS',
        amount: 0, // Manual entry
        module: 'manual',
        type: 'expense'
      },
      {
        id: 'general_admin_expenses',
        description: 'General and Administrative Expenses',
        amount: moduleResults.admin?.costs?.generalAdminExpenses || 0,
        module: 'admin',
        type: 'expense'
      },
      {
        id: 'staff_costs',
        description: 'Staff Costs',
        amount: moduleResults.hr?.costs?.staffCosts || 0,
        module: 'hr',
        type: 'expense'
      },
      {
        id: 'business_trip_expenses',
        description: 'Business Trip Expenses',
        amount: moduleResults.hr?.costs?.businessTripExpenses || 0,
        module: 'hr',
        type: 'expense'
      },
      {
        id: 'hse_training_expenses',
        description: 'HSE & Training Expenses',
        amount: moduleResults.hse?.costs?.hseTrainingExpenses || 0,
        module: 'hse',
        type: 'expense'
      },
      {
        id: 'legal_compliance_costs',
        description: 'Legal & Compliance Costs',
        amount: moduleResults.admin?.costs?.legalComplianceCosts || 0,
        module: 'admin',
        type: 'expense'
      },
      {
        id: 'facility_infrastructure_costs',
        description: 'Facility & Infrastructure Costs',
        amount: moduleResults.admin?.costs?.facilityInfrastructureCosts || 0,
        module: 'admin',
        type: 'expense'
      },
      {
        id: 'service_agreement_cost',
        description: 'Cost of Service Agreement (Manual Entry)',
        amount: 0, // Manual entry
        module: 'manual',
        type: 'expense'
      },
      {
        id: 'provision_credit_loss',
        description: 'Provision for Expected Credit Loss (Manual Entry)',
        amount: 0, // Manual entry
        module: 'manual',
        type: 'expense'
      }
    ];

    // Add all expense items and calculate total
    expenseItems.forEach(item => {
      expensesSection.items.push(item);
      expensesSection.subtotal += item.amount;
    });

    // Income, Expenses and Other Items Section - Include ALL specified items
    const otherItemsSection = {
      id: 'other_items',
      category: 'Income, Expenses and Other Items',
      type: 'other',
      subtotal: 0,
      items: [] as any[]
    };

    // Complete Other Items as per your specification
    const otherItems = [
      {
        id: 'gain_selling_products',
        description: 'Gain from Selling Other Products (Manual Entry)',
        amount: 0, // Manual entry
        module: 'manual',
        type: 'revenue'
      }
    ];

    // EBITDA Section - NEW MAIN SECTION
    const ebitdaSection = {
      id: 'ebitda',
      category: 'EBITDA',
      type: 'ebitda',
      subtotal: 0,
      items: [] as any[]
    };

    // Calculate EBITDA: Total Revenue + Income, Expenses and Other Items - Total Expenses - Finance Costs (excluding depreciation)
    const incomeExpensesOther = 0; // Will be calculated from manual entries
    const financeCosts = 0; // Manual entry
    const depreciation = moduleResults.assets?.costs?.depreciation || 0;
    const ebitda = revenueSection.subtotal + incomeExpensesOther - expensesSection.subtotal - financeCosts;

    // EBITDA items
    const ebitdaItems = [
      {
        id: 'finance_costs',
        description: 'Finance Costs (Manual Entry)',
        amount: 0, // Manual entry
        module: 'manual',
        type: 'expense'
      },
      {
        id: 'depreciation',
        description: 'Depreciation',
        amount: moduleResults.assets?.costs?.depreciation || 0,
        module: 'assets',
        type: 'expense'
      }
    ];

    // Add all other items
    otherItems.forEach(item => {
      otherItemsSection.items.push(item);
    });
    otherItemsSection.subtotal = otherItems.reduce((sum, item) => sum + item.amount, 0);

    // Add all EBITDA items
    ebitdaItems.forEach(item => {
      ebitdaSection.items.push(item);
    });
    // EBITDA subtotal is the calculated formula result, not the sum of items underneath
    ebitdaSection.subtotal = ebitda;

    // Net Profit Section - NEW MAIN SECTION
    const netProfitSection = {
      id: 'net_profit',
      category: 'Net Profit',
      type: 'net_profit',
      subtotal: 0,
      items: [] as any[]
    };

    // Calculate Net Profit: EBITDA - Depreciation
    const netProfit = ebitda - depreciation;

    // Net Profit items
    const netProfitItems = [
      {
        id: 'net_profit',
        description: 'Net Profit (EBITDA - Depreciation)',
        amount: netProfit,
        module: 'finance',
        type: 'summary'
      }
    ];

    // Add all Net Profit items
    netProfitItems.forEach(item => {
      netProfitSection.items.push(item);
    });
    // Net Profit subtotal is the calculated formula result
    netProfitSection.subtotal = netProfit;

    // Build final structure
    pnlStructure.table = [revenueSection, expensesSection, otherItemsSection, ebitdaSection, netProfitSection];
    
    // Calculate summary values
    const grossProfit = revenueSection.subtotal - expensesSection.subtotal;
    const ebitdaValue = ebitda;
    const finalNetProfitValue = netProfit;
    
    // Calculate margins
    const grossMargin = revenueSection.subtotal > 0 ? ((grossProfit / revenueSection.subtotal) * 100).toFixed(1) : '0.0';
    const operatingMargin = revenueSection.subtotal > 0 ? ((ebitdaValue / revenueSection.subtotal) * 100).toFixed(1) : '0.0';
    const netMargin = revenueSection.subtotal > 0 ? ((finalNetProfitValue / revenueSection.subtotal) * 100).toFixed(1) : '0.0';

    pnlStructure.summary = {
      revenue: revenueSection.subtotal,
      costOfSales: expensesSection.subtotal,
      grossProfit: grossProfit,
      grossMargin: `${grossMargin}%`,
      operatingExpenses: expensesSection.subtotal,
      operatingProfit: ebitdaValue,
      operatingMargin: `${operatingMargin}%`,
      netProfit: finalNetProfitValue,
      profitForPeriod: finalNetProfitValue, // Alias for compatibility
      netMargin: `${netMargin}%`,
      ebitda: ebitdaValue // Alias for compatibility
    };

    console.log('Summary values calculated:', {
      revenue: revenueSection.subtotal,
      costOfSales: expensesSection.subtotal,
      grossProfit,
      operatingProfit: ebitdaValue,
      netProfit: finalNetProfitValue,
      grossMargin: `${grossMargin}%`,
      operatingMargin: `${operatingMargin}%`,
      netMargin: `${netMargin}%`
    });

    // Set breakdown details
    pnlStructure.breakdown.moduleContributions = moduleResults;

    return pnlStructure;
  }

  // Helper method to calculate amortized cost
  private calculateAmortizedCost(cost: number, amortizationMonths: number, startDate: Date, periodStart: Date, periodEnd: Date): number {
    if (!cost || !amortizationMonths || amortizationMonths <= 0) return cost || 0;
    
    const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const amortizationDays = Math.ceil((amortizationMonths * 30)); // Convert months to days
    const overlapDays = Math.max(0, Math.min(periodEnd.getTime(), startDate.getTime() + (amortizationDays * 24 * 60 * 60 * 1000)) - Math.max(periodStart.getTime(), startDate.getTime())) / (1000 * 60 * 60 * 24);
    
    return (cost * overlapDays) / amortizationDays;
  }

  // Helper method to build date parameters
  private buildDateParams(period: string, startDate?: string, endDate?: string): string {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('period', period);
    return params.toString();
  }
}

// Export singleton instance
export const verticalPnLMappingService = VerticalPnLMappingService.getInstance();
export default verticalPnLMappingService;
