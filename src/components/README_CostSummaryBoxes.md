# CostSummaryBoxes Component

A React component for displaying facility rental cost summaries following the **PREFIX INSTRUCTION** for monthly-first calculations.

## 🎯 PREFIX INSTRUCTION Compliance

This component strictly follows the PREFIX INSTRUCTION:

1. **Step 1**: Calculate monthly total as: `monthly total = monthly rent + (security deposit ÷ amortization period in months)`
2. **Step 2**: Use that monthly total for all further breakdowns:
   - Daily cost = monthly total ÷ number of days in that month
   - Weekly cost = daily cost × 7
   - Monthly cost = fixed monthly total (no proration)
   - Quarterly cost = sum of monthly totals in the quarter
   - Half-year cost = sum of monthly totals in that half-year
   - Fiscal year cost = sum of monthly totals within fiscal year

## 📋 Props

```typescript
interface CostSummaryBoxesProps {
  monthlyRent: number;                    // Monthly rental amount
  startDate: Date;                       // Rental start date
  endDate: Date;                         // Rental end date
  securityDeposit?: number;              // Security deposit amount (optional)
  amortizationPeriodMonths?: number;     // Amortization period in months (default: 12)
}
```

## 🚀 Usage

### Basic Usage

```tsx
import CostSummaryBoxes from './components/CostSummaryBoxes';

function MyComponent() {
  return (
    <CostSummaryBoxes
      monthlyRent={5000}
      startDate={new Date('2024-01-01')}
      endDate={new Date('2025-12-31')}
      securityDeposit={10000}
      amortizationPeriodMonths={12}
    />
  );
}
```

### With Security Deposit

```tsx
<CostSummaryBoxes
  monthlyRent={8000}
  startDate={new Date('2024-06-01')}
  endDate={new Date('2026-05-31')}
  securityDeposit={24000}
  amortizationPeriodMonths={24}
/>
```

### Without Security Deposit

```tsx
<CostSummaryBoxes
  monthlyRent={3000}
  startDate={new Date('2024-03-01')}
  endDate={new Date('2024-12-31')}
/>
```

## 📊 Displayed Totals

The component displays six cost totals:

1. **Daily Total** - Current date's daily cost
2. **Weekly Total** - Current week's total cost
3. **Monthly Total** - Current month's fixed total (no proration)
4. **Quarterly Total** - Current fiscal quarter total
5. **Half-Year Total** - Current fiscal half-year total
6. **Fiscal Year Total** - Current fiscal year total (April 1 - March 31)

## 🧮 Calculation Examples

### Example 1: Basic Rental
- Monthly Rent: $5,000
- Security Deposit: $10,000
- Amortization: 12 months
- **Monthly Total**: $5,000 + ($10,000 ÷ 12) = $5,833.33

### Example 2: High-Value Rental
- Monthly Rent: $15,000
- Security Deposit: $50,000
- Amortization: 24 months
- **Monthly Total**: $15,000 + ($50,000 ÷ 24) = $17,083.33

### Example 3: No Security Deposit
- Monthly Rent: $2,000
- Security Deposit: $0
- **Monthly Total**: $2,000 + $0 = $2,000

## 🎨 Features

- **Responsive Design**: Adapts to different screen sizes
- **Interactive Cards**: Hover effects and smooth transitions
- **Color-Coded**: Each cost type has a distinct color
- **Real-time Calculations**: Updates based on current date
- **Fiscal Year Alignment**: Properly aligned to April 1 - March 31 fiscal year
- **Precision**: Rounds to 2 decimal places for display

## 📅 Fiscal Year Alignment

The component uses proper fiscal year calculations:
- **Q1**: April 1 - June 30
- **Q2**: July 1 - September 30
- **Q3**: October 1 - December 31
- **Q4**: January 1 - March 31
- **H1**: April 1 - September 30
- **H2**: October 1 - March 31

## 🔧 Technical Details

### Dependencies
- React 18+
- Material-UI (MUI) 5+
- Day.js for date handling

### Key Functions
- `calculateMonthlyTotal()` - Implements Step 1 of PREFIX INSTRUCTION
- `calculateDailyCost()` - Daily cost calculation
- `calculateWeeklyCost()` - Weekly cost calculation
- `calculateMonthlyCost()` - Fixed monthly total
- `calculateQuarterlyCost()` - Quarterly total with overlap checking
- `calculateHalfYearlyCost()` - Half-year total with overlap checking
- `calculateFiscalYearCost()` - Fiscal year total with overlap checking

### Overlap Checking
The component intelligently checks if the rental period overlaps with the current fiscal periods and only includes months that fall within the rental period.

## 📁 File Structure

```
src/
├── components/
│   └── CostSummaryBoxes.tsx          # Main component
├── examples/
│   ├── CostSummaryBoxesExample.tsx   # Usage examples
│   └── AdminPageIntegration.tsx      # AdminPage integration example
└── README_CostSummaryBoxes.md        # This documentation
```

## 🎯 Integration with AdminPage

To integrate with your existing AdminPage, simply import and use the component in your Company Facility Documents tab:

```tsx
import CostSummaryBoxes from '../components/CostSummaryBoxes';

// In your facility tab content
<CostSummaryBoxes
  monthlyRent={facility.rentAgreement.monthlyRent}
  startDate={new Date(facility.rentAgreement.startDate)}
  endDate={new Date(facility.rentAgreement.endDate)}
  securityDeposit={facility.rentAgreement.securityDeposit}
  amortizationPeriodMonths={facility.rentAgreement.securityDepositAmortization}
/>
```

## ✅ Compliance Verification

This component has been designed to strictly follow the PREFIX INSTRUCTION:
- ✅ Monthly-first calculation approach
- ✅ No proration of security deposits or rent by days (except for daily/weekly display)
- ✅ Whole months for amortization
- ✅ Proper fiscal year alignment
- ✅ Accurate cost breakdowns for all time periods
