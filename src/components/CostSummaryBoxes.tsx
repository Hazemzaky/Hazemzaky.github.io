import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

// Types
interface CostSummaryBoxesProps {
  monthlyRent: number;
  startDate: Date;
  endDate: Date;
  securityDeposit?: number;
  amortizationPeriodMonths?: number;
}

interface CostBreakdown {
  daily: number;
  weekly: number;
  monthly: number;
  quarterly: number;
  halfYearly: number;
  fiscalYear: number;
}

// Utility Functions
class FacilityCostCalculator {
  /**
   * Calculate monthly total following PREFIX INSTRUCTION
   * Step 1: monthly total = monthly rent + (security deposit ÷ amortization period in months)
   */
  static calculateMonthlyTotal(
    monthlyRent: number,
    securityDeposit: number = 0,
    amortizationPeriodMonths: number = 12
  ): number {
    const securityDepositMonthly = securityDeposit > 0 && amortizationPeriodMonths > 0 
      ? securityDeposit / amortizationPeriodMonths 
      : 0;
    
    return monthlyRent + securityDepositMonthly;
  }

  /**
   * Get current date info
   */
  static getCurrentDateInfo() {
    const today = dayjs();
    return {
      currentDate: today,
      currentMonth: today.month() + 1, // 1-12
      currentYear: today.year(),
      currentQuarter: Math.floor(today.month() / 3) + 1, // 1-4
      currentHalf: Math.floor(today.month() / 6) + 1, // 1-2
      currentFiscalYear: today.month() >= 3 ? today.year() : today.year() - 1
    };
  }

  /**
   * Check if a date falls within the rental period
   */
  static isWithinRentalPeriod(
    checkDate: dayjs.Dayjs,
    startDate: Date,
    endDate: Date
  ): boolean {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return checkDate.isAfter(start.subtract(1, 'day')) && checkDate.isBefore(end.add(1, 'day'));
  }

  /**
   * Get fiscal quarter start date (April 1, July 1, October 1, January 1)
   */
  static getFiscalQuarterStart(year: number, quarter: number): dayjs.Dayjs {
    const quarterMonths = [3, 6, 9, 0]; // April=3, July=6, October=9, January=0
    const actualYear = quarter === 4 ? year + 1 : year;
    return dayjs().year(actualYear).month(quarterMonths[quarter - 1]).date(1);
  }

  /**
   * Get fiscal half-year start date (April 1, October 1)
   */
  static getFiscalHalfStart(year: number, half: number): dayjs.Dayjs {
    const halfMonths = [3, 9]; // April=3, October=9
    return dayjs().year(year).month(halfMonths[half - 1]).date(1);
  }

  /**
   * Get fiscal year start date (April 1)
   */
  static getFiscalYearStart(year: number): dayjs.Dayjs {
    return dayjs().year(year).month(3).date(1); // April 1
  }

  /**
   * Get fiscal year end date (March 31)
   */
  static getFiscalYearEnd(year: number): dayjs.Dayjs {
    return dayjs().year(year + 1).month(2).date(31); // March 31
  }

  /**
   * Calculate daily cost
   * Step 2: daily cost = monthly total ÷ number of days in that month
   */
  static calculateDailyCost(
    monthlyTotal: number,
    date: dayjs.Dayjs
  ): number {
    const daysInMonth = date.daysInMonth();
    return monthlyTotal / daysInMonth;
  }

  /**
   * Calculate weekly cost
   * Step 2: weekly cost = daily cost × 7
   */
  static calculateWeeklyCost(
    dailyCost: number
  ): number {
    return dailyCost * 7;
  }

  /**
   * Calculate monthly cost
   * Step 2: monthly cost = fixed monthly total (do not prorate by days)
   */
  static calculateMonthlyCost(
    monthlyTotal: number
  ): number {
    return monthlyTotal; // Fixed monthly total, no proration
  }

  /**
   * Calculate quarterly cost
   * Step 2: quarterly cost = sum of monthly totals in the quarter
   */
  static calculateQuarterlyCost(
    monthlyTotal: number,
    year: number,
    quarter: number,
    startDate: Date,
    endDate: Date
  ): number {
    const quarterStart = this.getFiscalQuarterStart(year, quarter);
    const quarterEnd = quarterStart.add(3, 'months').subtract(1, 'day');
    
    // Check if rental period overlaps with this quarter
    const rentalStart = dayjs(startDate);
    const rentalEnd = dayjs(endDate);
    
    if (quarterEnd.isBefore(rentalStart) || quarterStart.isAfter(rentalEnd)) {
      return 0; // No overlap
    }

    // Count months that overlap with rental period
    let monthsInQuarter = 0;
    for (let i = 0; i < 3; i++) {
      const monthDate = quarterStart.add(i, 'month');
      if (this.isWithinRentalPeriod(monthDate, startDate, endDate)) {
        monthsInQuarter++;
      }
    }

    return monthlyTotal * monthsInQuarter;
  }

  /**
   * Calculate half-yearly cost
   * Step 2: half-yearly cost = sum of monthly totals in that half-year
   */
  static calculateHalfYearlyCost(
    monthlyTotal: number,
    year: number,
    half: number,
    startDate: Date,
    endDate: Date
  ): number {
    const halfStart = this.getFiscalHalfStart(year, half);
    const halfEnd = halfStart.add(6, 'months').subtract(1, 'day');
    
    // Check if rental period overlaps with this half-year
    const rentalStart = dayjs(startDate);
    const rentalEnd = dayjs(endDate);
    
    if (halfEnd.isBefore(rentalStart) || halfStart.isAfter(rentalEnd)) {
      return 0; // No overlap
    }

    // Count months that overlap with rental period
    let monthsInHalf = 0;
    for (let i = 0; i < 6; i++) {
      const monthDate = halfStart.add(i, 'month');
      if (this.isWithinRentalPeriod(monthDate, startDate, endDate)) {
        monthsInHalf++;
      }
    }

    return monthlyTotal * monthsInHalf;
  }

  /**
   * Calculate fiscal year cost
   * Step 2: fiscal year cost = sum of monthly totals within fiscal year
   */
  static calculateFiscalYearCost(
    monthlyTotal: number,
    fiscalYear: number,
    startDate: Date,
    endDate: Date
  ): number {
    const fiscalStart = this.getFiscalYearStart(fiscalYear);
    const fiscalEnd = this.getFiscalYearEnd(fiscalYear);
    
    // Check if rental period overlaps with this fiscal year
    const rentalStart = dayjs(startDate);
    const rentalEnd = dayjs(endDate);
    
    if (fiscalEnd.isBefore(rentalStart) || fiscalStart.isAfter(rentalEnd)) {
      return 0; // No overlap
    }

    // Count months that overlap with rental period
    let monthsInFiscalYear = 0;
    for (let i = 0; i < 12; i++) {
      const monthDate = fiscalStart.add(i, 'month');
      if (this.isWithinRentalPeriod(monthDate, startDate, endDate)) {
        monthsInFiscalYear++;
      }
    }

    return monthlyTotal * monthsInFiscalYear;
  }

  /**
   * Calculate all cost breakdowns following PREFIX INSTRUCTION
   */
  static calculateAllCosts(props: CostSummaryBoxesProps): CostBreakdown {
    const { monthlyRent, startDate, endDate, securityDeposit = 0, amortizationPeriodMonths = 12 } = props;
    
    // Step 1: Calculate monthly total
    const monthlyTotal = this.calculateMonthlyTotal(monthlyRent, securityDeposit, amortizationPeriodMonths);
    
    // Get current date info
    const dateInfo = this.getCurrentDateInfo();
    
    // Step 2: Calculate all breakdowns
    const dailyCost = this.calculateDailyCost(monthlyTotal, dateInfo.currentDate);
    const weeklyCost = this.calculateWeeklyCost(dailyCost);
    const monthlyCost = this.calculateMonthlyCost(monthlyTotal);
    const quarterlyCost = this.calculateQuarterlyCost(monthlyTotal, dateInfo.currentFiscalYear, dateInfo.currentQuarter, startDate, endDate);
    const halfYearlyCost = this.calculateHalfYearlyCost(monthlyTotal, dateInfo.currentFiscalYear, dateInfo.currentHalf, startDate, endDate);
    const fiscalYearCost = this.calculateFiscalYearCost(monthlyTotal, dateInfo.currentFiscalYear, startDate, endDate);
    
    return {
      daily: Math.round(dailyCost * 100) / 100,
      weekly: Math.round(weeklyCost * 100) / 100,
      monthly: Math.round(monthlyCost * 100) / 100,
      quarterly: Math.round(quarterlyCost * 100) / 100,
      halfYearly: Math.round(halfYearlyCost * 100) / 100,
      fiscalYear: Math.round(fiscalYearCost * 100) / 100
    };
  }
}

// Main Component
const CostSummaryBoxes: React.FC<CostSummaryBoxesProps> = ({
  monthlyRent,
  startDate,
  endDate,
  securityDeposit = 0,
  amortizationPeriodMonths = 12
}) => {
  const theme = useTheme();
  const dateInfo = FacilityCostCalculator.getCurrentDateInfo();
  const costs = FacilityCostCalculator.calculateAllCosts({
    monthlyRent,
    startDate,
    endDate,
    securityDeposit,
    amortizationPeriodMonths
  });

  const getMonthName = (monthNumber: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  const getQuarterName = (quarter: number): string => {
    const quarters = ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)'];
    return quarters[quarter - 1];
  };

  const getHalfName = (half: number): string => {
    const halves = ['H1 (Apr-Sep)', 'H2 (Oct-Mar)'];
    return halves[half - 1];
  };

  const costBoxes = [
    {
      title: 'Daily Total',
      value: costs.daily,
      icon: <ScheduleIcon />,
      color: theme.palette.primary.main,
      subtitle: `Current: ${dateInfo.currentDate.format('MMM DD, YYYY')}`,
      description: 'Monthly total ÷ days in month'
    },
    {
      title: 'Weekly Total',
      value: costs.weekly,
      icon: <CalendarIcon />,
      color: theme.palette.secondary.main,
      subtitle: `Week of ${dateInfo.currentDate.startOf('week').format('MMM DD')}`,
      description: 'Daily cost × 7 days'
    },
    {
      title: 'Monthly Total',
      value: costs.monthly,
      icon: <MoneyIcon />,
      color: theme.palette.success.main,
      subtitle: getMonthName(dateInfo.currentMonth),
      description: 'Fixed monthly total (no proration)'
    },
    {
      title: 'Quarterly Total',
      value: costs.quarterly,
      icon: <TrendingUpIcon />,
      color: theme.palette.warning.main,
      subtitle: getQuarterName(dateInfo.currentQuarter),
      description: 'Sum of monthly totals in quarter'
    },
    {
      title: 'Half-Year Total',
      value: costs.halfYearly,
      icon: <AssessmentIcon />,
      color: theme.palette.info.main,
      subtitle: getHalfName(dateInfo.currentHalf),
      description: 'Sum of monthly totals in half-year'
    },
    {
      title: 'Fiscal Year Total',
      value: costs.fiscalYear,
      icon: <AccountBalanceIcon />,
      color: theme.palette.error.main,
      subtitle: `FY ${dateInfo.currentFiscalYear}-${(dateInfo.currentFiscalYear + 1).toString().slice(-2)}`,
      description: 'Sum of monthly totals in fiscal year'
    }
  ];

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ 
        fontWeight: 600, 
        color: theme.palette.text.primary,
        mb: 3,
        textAlign: 'center'
      }}>
        Facility Cost Summary
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(3, 1fr)'
        },
        gap: 3
      }}>
        {costBoxes.map((box, index) => (
          <Card
            key={index}
            elevation={0}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(box.color, 0.1)} 0%, ${alpha(box.color, 0.05)} 100%)`,
              border: `1px solid ${alpha(box.color, 0.2)}`,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${alpha(box.color, 0.15)}`,
                border: `1px solid ${alpha(box.color, 0.3)}`
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '50%',
                    bgcolor: alpha(box.color, 0.1),
                    color: box.color,
                    mr: 2
                  }}
                >
                  {box.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.text.primary,
                    mb: 0.5
                  }}>
                    {box.title}
                  </Typography>
                  <Chip
                    label={box.subtitle}
                    size="small"
                    sx={{
                      bgcolor: alpha(box.color, 0.1),
                      color: box.color,
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Box>

              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: box.color,
                mb: 1
              }}>
                ${costs[box.title.toLowerCase().replace(' ', '') as keyof CostBreakdown]?.toLocaleString()}
              </Typography>

              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary,
                fontStyle: 'italic'
              }}>
                {box.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Summary Information */}
      <Box sx={{ mt: 4, p: 3, bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Calculation Summary
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Monthly Rent: ${monthlyRent.toLocaleString()}
            </Typography>
            {securityDeposit > 0 && (
              <Typography variant="body2" color="text.secondary">
                Security Deposit: ${securityDeposit.toLocaleString()} 
                (amortized over {amortizationPeriodMonths} months)
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Monthly Total: ${(monthlyRent + (securityDeposit / amortizationPeriodMonths)).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Rental Period: {dayjs(startDate).format('MMM DD, YYYY')} - {dayjs(endDate).format('MMM DD, YYYY')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Date: {dateInfo.currentDate.format('MMM DD, YYYY')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CostSummaryBoxes;
