# Vertical Profit & Loss Statement Integration

## Overview

This document describes the comprehensive integration system that links costs from all system modules to create a complete Vertical Profit & Loss Statement according to your specified structure.

## Vertical P&L Structure

### Revenue Section
- **Operating Revenues** → Linked to Sales module
- **Rebate** → Manual entry
- **Net Operating Revenue** → Linked to Invoices module  
- **Sales** → Linked to Sales module
- **Revenue from Rental Equipment** → Linked to Assets module
- **Revenue from DS** → Manual entry
- **Revenue from Sub Companies** → Manual entry
- **Other Revenue** → Linked to Invoices module
- **Provision for End of Service Indemnity No Longer Required** → Manual entry
- **Provision for Impairment Loss No Longer Required** → Manual entry
- **Total Revenue** → Calculated sum of all revenue items

### Expenses Section
- **Operation Cost** → Linked to Operations module (Fuel, Vehicle costs)
- **Cost of Rental Equipment** → Linked to Assets module
- **Cost of DS** → Manual entry
- **General and Administrative Expenses** → Linked to Admin module
- **Staff Costs** → Linked to HR/Payroll module
- **Business Trip Expenses** → Linked to Business Trips module
- **Overtime Expenses** → Linked to Overtime module
- **Trip Allowance Expenses** → Linked to Trip Allowance module
- **Food Allowance Expenses** → Linked to Food Allowance module
- **HSE & Training Expenses** → Linked to HSE module
- **Inventory & Material Costs** → Linked to Inventory module
- **Legal & Compliance Costs** → Linked to Admin module
- **Facility & Infrastructure Costs** → Linked to Admin module
- **Provision for Expected Credit Loss** → Manual entry
- **Cost of Service Agreement** → Linked to Maintenance module
- **Total Expenses** → Calculated sum of all expense items

### Other Items Section
- **Gain from Selling Other Products** → Manual entry
- **EBITDA** → Calculated (Total Revenue - Total Expenses)
- **Finance Costs** → Manual entry
- **Depreciation** → Linked to Assets module
- **Net Profit** → Calculated (EBITDA - Depreciation - Finance Costs)

## Module Integration Mapping

### HR Module → P&L Categories
- **Payroll Page** → Staff Costs
- **Employees Page** → Staff Costs
- **Overtime Page** → Overtime Expenses
- **Business Trips Page** → Business Trip Expenses
- **Trip Allowance Page** → Trip Allowance Expenses
- **Food Allowance Page** → Food Allowance Expenses

### Assets Module → P&L Categories
- **Assets Page** → Revenue from Rental Equipment, Cost of Rental Equipment
- **Depreciation** → Depreciation line item

### Operations Module → P&L Categories
- **Fuel Logs Page** → Operation Cost
- **Water Logs Page** → Operation Cost (vehicle operations)
- **Vehicle Operations** → Operation Cost

### Maintenance Module → P&L Categories
- **Maintenance Page** → Cost of Service Agreement
- **Spare Parts** → Inventory & Material Costs

### Procurement Module → P&L Categories
- **Procurement Requests** → Operation Cost
- **Supplier Costs** → Operation Cost

### HSE Module → P&L Categories
- **Safety Training** → HSE & Training Expenses
- **Safety Equipment** → HSE & Training Expenses
- **Environmental Costs** → HSE & Training Expenses

### Admin Module → P&L Categories
- **General Admin Costs** → General and Administrative Expenses
- **Legal Compliance** → Legal & Compliance Costs
- **Facility Management** → Facility & Infrastructure Costs

### Inventory Module → P&L Categories
- **Inventory Costs** → Inventory & Material Costs
- **Material Costs** → Inventory & Material Costs

### Sales Module → P&L Categories
- **Sales Revenue** → Sales, Operating Revenues
- **Service Revenue** → Net Operating Revenue

### Invoices Module → P&L Categories
- **Invoice Revenue** → Net Operating Revenue
- **Other Revenue** → Other Revenue

## Technical Implementation

### Files Created/Modified

1. **`verticalPnLMappingService.ts`** - New service that:
   - Defines the vertical P&L category structure
   - Maps each module to appropriate P&L categories
   - Aggregates costs from all modules in parallel
   - Handles data fetching errors gracefully
   - Builds the complete vertical P&L structure

2. **`pnlIntegrationService.ts`** - Enhanced existing service:
   - Integrates with the new vertical mapping service
   - Processes manual entries and integrates them into the structure
   - Generates charts and analysis data from vertical structure
   - Provides fallback to original API if vertical mapping fails

3. **`PnLPage.tsx`** - Enhanced P&L page:
   - Updated table component to show module sources
   - Added detailed cost breakdown by module
   - Enhanced visual design with module icons and colors
   - Added module integration status indicators
   - Improved summary cards with module contributions

### Key Features

#### 1. Real-Time Cost Aggregation
- Automatically pulls data from all modules
- Updates P&L when any module data changes
- Handles module data errors gracefully
- Shows integration status for each module

#### 2. Visual Module Identification
- Each cost line item shows its source module
- Color-coded module indicators
- Module-specific icons for easy identification
- Integration status chips showing active/inactive modules

#### 3. Detailed Cost Breakdown
- Expandable sections showing individual cost components
- Percentage of revenue calculations
- Module contribution percentages
- Cost trend indicators

#### 4. Manual Entry Integration
- Seamless integration of manual entries with calculated costs
- Automatic recalculation when manual entries change
- Clear distinction between calculated and manual entries

#### 5. Error Handling & Fallbacks
- Graceful handling of module API failures
- Fallback to original P&L API if vertical mapping fails
- Clear error messages and status indicators

## Usage Instructions

### For Users
1. **Navigate to P&L Page** - Access from the main navigation
2. **Select Period** - Choose your reporting period (daily, weekly, monthly, quarterly, yearly)
3. **Generate Report** - Click "Generate Report" to aggregate all module costs
4. **View Breakdown** - Click on section headers to expand and see module details
5. **Check Integration** - Review the "Module Integration Status" section to see which modules are contributing data

### For Developers
1. **Adding New Modules** - Update the `MODULE_PNL_MAPPING` in `verticalPnLMappingService.ts`
2. **Adding New Cost Categories** - Update `VERTICAL_PNL_CATEGORIES` structure
3. **Modifying Cost Calculations** - Update the specific module cost fetching methods
4. **Adding New Manual Entries** - Update the `integrateManualEntries` method

## Data Flow

```
1. User selects period and clicks "Generate Report"
2. PnL Integration Service calls Vertical P&L Mapping Service
3. Mapping Service fetches data from all modules in parallel:
   - HR Module (payroll, overtime, trips, allowances)
   - Assets Module (assets, depreciation)
   - Operations Module (fuel, vehicles)
   - Maintenance Module (maintenance costs)
   - Procurement Module (procurement costs)
   - HSE Module (safety, training costs)
   - Admin Module (admin, legal, facility costs)
   - Inventory Module (inventory, material costs)
   - Sales Module (sales revenue)
   - Invoices Module (invoice revenue)
4. Service builds vertical P&L structure with module attribution
5. Manual entries are integrated into the structure
6. Final P&L data is returned to the UI
7. UI displays comprehensive vertical P&L with module breakdown
```

## Benefits

1. **Complete Cost Visibility** - Every cost is traced back to its source module
2. **Automated Consolidation** - No manual data entry required for most items
3. **Real-Time Updates** - P&L reflects latest data from all modules
4. **Module Accountability** - Easy to identify which modules contribute to costs
5. **IFRS Compliance** - Structured according to international standards
6. **Error Resilience** - System continues to work even if some modules fail
7. **Visual Clarity** - Clear visual indicators for cost sources and trends

## Future Enhancements

1. **Drill-Down Capability** - Click on module costs to view detailed transactions
2. **Comparative Analysis** - Period-over-period comparisons by module
3. **Budget Integration** - Compare actual costs to budgeted amounts by module
4. **Cost Center Allocation** - Further breakdown by cost centers within modules
5. **Real-Time Dashboards** - Live updating P&L as transactions occur
6. **Export Capabilities** - Export detailed P&L with module breakdowns to Excel/PDF

## Troubleshooting

### Common Issues

1. **Missing Module Data** - Check if the module API is responding correctly
2. **Incorrect Cost Mapping** - Verify the `MODULE_PNL_MAPPING` configuration
3. **Manual Entries Not Showing** - Check manual entries API endpoint
4. **Performance Issues** - Consider implementing caching for large datasets

### Debugging

1. Check browser console for detailed error messages
2. Verify API endpoints are accessible
3. Check module integration status indicators
4. Review network tab for failed API calls

This integration provides a comprehensive, automated, and visually clear Vertical P&L Statement that consolidates costs from all your system modules while maintaining full traceability and IFRS compliance.
