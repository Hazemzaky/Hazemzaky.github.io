/**
 * Professional Finance-Grade Cost Calculation System
 * 
 * This module implements sophisticated financial calculations following
 * Generally Accepted Accounting Principles (GAAP) and International
 * Financial Reporting Standards (IFRS).
 * 
 * Author: Senior Financial Systems Developer
 * Version: 2.0.0
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isLeapYear);
dayjs.extend(quarterOfYear);

// Financial Constants
export const FINANCIAL_CONSTANTS = {
  DAYS_PER_YEAR: 360, // Standardized to 30 days × 12 months for business calculations
  DAYS_PER_MONTH: 30, // All months standardized to 30 days
  MONTHS_PER_YEAR: 12,
  QUARTERS_PER_YEAR: 4,
  BUSINESS_DAYS_PER_WEEK: 5,
  BUSINESS_DAYS_PER_MONTH: 21.75, // Average business days per month
  DEFAULT_DISCOUNT_RATE: 0.05, // 5% annual discount rate
  DEFAULT_INFLATION_RATE: 0.03, // 3% annual inflation rate
  PRECISION_DECIMALS: 6 // High precision for financial calculations
};

// Amortization Methods
export enum AmortizationMethod {
  STRAIGHT_LINE = 'straight_line',
  DECLINING_BALANCE = 'declining_balance',
  SUM_OF_YEARS = 'sum_of_years',
  UNITS_OF_PRODUCTION = 'units_of_production',
  DOUBLE_DECLINING = 'double_declining'
}

// Cost Categories
export enum CostCategory {
  RENT = 'rent',
  SECURITY_DEPOSIT = 'security_deposit',
  MAINTENANCE = 'maintenance',
  UTILITIES = 'utilities',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  ADMINISTRATIVE = 'administrative',
  CAPITAL_EXPENDITURE = 'capital_expenditure'
}

// Financial Period Types
export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  FINANCIAL_YEAR = 'financial_year'
}

// Interface Definitions
export interface FinancialPeriod {
  startDate: Date;
  endDate: Date;
  type: PeriodType;
  daysInPeriod: number;
  businessDaysInPeriod: number;
}

export interface AmortizationSchedule {
  period: FinancialPeriod;
  beginningBalance: number;
  amortizationExpense: number;
  endingBalance: number;
  cumulativeAmortization: number;
}

export interface CostAllocation {
  category: CostCategory;
  amount: number;
  allocationMethod: string;
  period: FinancialPeriod;
  isAmortized: boolean;
  amortizationMethod?: AmortizationMethod;
  amortizationPeriod?: number; // in months
}

export interface FacilityCostStructure {
  facilityId: string;
  facilityName: string;
  rentAgreement: {
    monthlyRent: number;
    startDate: Date;
    endDate: Date;
    escalationRate?: number; // Annual rent escalation percentage
  };
  securityDeposit: {
    amount: number;
    isRefundable: boolean;
    amortizationPeriod: number; // in months
    amortizationMethod: AmortizationMethod;
  };
  maintenanceCosts: Array<{
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'annually' | 'one_time';
    startDate: Date;
    endDate?: Date;
    escalationRate?: number;
  }>;
  otherCosts: CostAllocation[];
}

export interface DiscountedCashFlow {
  period: FinancialPeriod;
  cashFlow: number;
  discountFactor: number;
  presentValue: number;
  cumulativePresentValue: number;
}

/**
 * Professional Financial Calculation Utilities
 */
export class FinanceCalculator {
  /**
   * Calculate exact days between two dates using proper calendar math
   */
  static calculateExactDays(startDate: Date, endDate: Date): number {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.diff(start, 'day', true); // true for fractional days
  }

  /**
   * Calculate business days between two dates
   */
  static calculateBusinessDays(startDate: Date, endDate: Date): number {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    let businessDays = 0;
    let current = start;

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const dayOfWeek = current.day();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
        businessDays++;
      }
      current = current.add(1, 'day');
    }

    return businessDays;
  }

  /**
   * Calculate the number of days in a specific month
   */
  static getDaysInMonth(year: number, month: number): number {
    return dayjs().year(year).month(month).daysInMonth();
  }

  /**
   * Calculate the number of days in a year (accounting for leap years)
   */
  static getDaysInYear(year: number): number {
    return dayjs().year(year).isLeapYear() ? 366 : 365;
  }

  /**
   * Create a financial period with proper date handling
   */
  static createFinancialPeriod(
    startDate: Date, 
    endDate: Date, 
    type: PeriodType
  ): FinancialPeriod {
    const daysInPeriod = this.calculateExactDays(startDate, endDate);
    const businessDaysInPeriod = this.calculateBusinessDays(startDate, endDate);

    return {
      startDate,
      endDate,
      type,
      daysInPeriod,
      businessDaysInPeriod
    };
  }

  /**
   * Calculate monthly periods for a given year
   */
  static getMonthlyPeriods(year: number): FinancialPeriod[] {
    const periods: FinancialPeriod[] = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = dayjs().year(year).month(month).startOf('month').toDate();
      const endDate = dayjs().year(year).month(month).endOf('month').toDate();
      
      periods.push(this.createFinancialPeriod(startDate, endDate, PeriodType.MONTHLY));
    }
    
    return periods;
  }

  /**
   * Calculate quarterly periods for a given year
   */
  static getQuarterlyPeriods(year: number): FinancialPeriod[] {
    const periods: FinancialPeriod[] = [];
    
    for (let quarter = 1; quarter <= 4; quarter++) {
      const startDate = dayjs().year(year).quarter(quarter).startOf('quarter').toDate();
      const endDate = dayjs().year(year).quarter(quarter).endOf('quarter').toDate();
      
      periods.push(this.createFinancialPeriod(startDate, endDate, PeriodType.QUARTERLY));
    }
    
    return periods;
  }

  /**
   * Calculate financial year periods (April 1 to March 31)
   */
  static getFinancialYearPeriods(year: number): FinancialPeriod[] {
    const startDate = dayjs().year(year).month(3).date(1).toDate(); // April 1
    const endDate = dayjs().year(year + 1).month(2).date(31).toDate(); // March 31
    
    return [this.createFinancialPeriod(startDate, endDate, PeriodType.FINANCIAL_YEAR)];
  }
}

/**
 * Professional Amortization Calculator
 */
export class AmortizationCalculator {
  /**
   * Calculate straight-line amortization
   * Formula: (Cost - Salvage Value) / Useful Life
   */
  static straightLine(
    cost: number,
    salvageValue: number = 0,
    usefulLifeMonths: number,
    period: FinancialPeriod
  ): number {
    if (usefulLifeMonths <= 0) return 0;
    
    const monthlyAmortization = (cost - salvageValue) / usefulLifeMonths;
    const monthsInPeriod = period.daysInPeriod / FINANCIAL_CONSTANTS.DAYS_PER_MONTH; // Standardized 30 days per month
    
    return monthlyAmortization * monthsInPeriod;
  }

  /**
   * Calculate declining balance amortization
   * Formula: Book Value × (2 / Useful Life)
   */
  static decliningBalance(
    cost: number,
    bookValue: number,
    usefulLifeMonths: number,
    period: FinancialPeriod
  ): number {
    if (usefulLifeMonths <= 0 || bookValue <= 0) return 0;
    
    const annualRate = 2 / (usefulLifeMonths / 12);
    const monthsInPeriod = period.daysInPeriod / FINANCIAL_CONSTANTS.DAYS_PER_MONTH; // Standardized 30 days per month
    const monthlyRate = annualRate / 12;
    
    return bookValue * monthlyRate * monthsInPeriod;
  }

  /**
   * Calculate sum-of-years digits amortization
   * Formula: (Remaining Life / Sum of Years) × (Cost - Salvage Value)
   */
  static sumOfYears(
    cost: number,
    salvageValue: number = 0,
    remainingLifeMonths: number,
    totalLifeMonths: number,
    period: FinancialPeriod
  ): number {
    if (remainingLifeMonths <= 0 || totalLifeMonths <= 0) return 0;
    
    const sumOfYears = (totalLifeMonths * (totalLifeMonths + 1)) / 2;
    const monthsInPeriod = period.daysInPeriod / FINANCIAL_CONSTANTS.DAYS_PER_MONTH; // Standardized 30 days per month
    
    return ((remainingLifeMonths / sumOfYears) * (cost - salvageValue)) * monthsInPeriod;
  }

  /**
   * Calculate double declining balance amortization
   * Formula: 2 × Straight Line Rate × Book Value
   */
  static doubleDecliningBalance(
    cost: number,
    bookValue: number,
    usefulLifeMonths: number,
    period: FinancialPeriod
  ): number {
    if (usefulLifeMonths <= 0 || bookValue <= 0) return 0;
    
    const straightLineRate = 1 / usefulLifeMonths;
    const doubleDecliningRate = 2 * straightLineRate;
    const monthsInPeriod = period.daysInPeriod / FINANCIAL_CONSTANTS.DAYS_PER_MONTH; // Standardized 30 days per month
    
    return bookValue * doubleDecliningRate * monthsInPeriod;
  }

  /**
   * Generate complete amortization schedule
   */
  static generateAmortizationSchedule(
    cost: number,
    salvageValue: number = 0,
    usefulLifeMonths: number,
    method: AmortizationMethod,
    periods: FinancialPeriod[]
  ): AmortizationSchedule[] {
    const schedule: AmortizationSchedule[] = [];
    let bookValue = cost;
    let cumulativeAmortization = 0;

    for (const period of periods) {
      let amortizationExpense = 0;

      switch (method) {
        case AmortizationMethod.STRAIGHT_LINE:
          amortizationExpense = this.straightLine(cost, salvageValue, usefulLifeMonths, period);
          break;
        case AmortizationMethod.DECLINING_BALANCE:
          amortizationExpense = this.decliningBalance(cost, bookValue, usefulLifeMonths, period);
          break;
        case AmortizationMethod.SUM_OF_YEARS:
          const remainingLife = Math.max(0, usefulLifeMonths - (schedule.length * (period.daysInPeriod / 30.44)));
          amortizationExpense = this.sumOfYears(cost, salvageValue, remainingLife, usefulLifeMonths, period);
          break;
        case AmortizationMethod.DOUBLE_DECLINING:
          amortizationExpense = this.doubleDecliningBalance(cost, bookValue, usefulLifeMonths, period);
          break;
      }

      // Ensure we don't amortize below salvage value
      if (bookValue - amortizationExpense < salvageValue) {
        amortizationExpense = Math.max(0, bookValue - salvageValue);
      }

      bookValue -= amortizationExpense;
      cumulativeAmortization += amortizationExpense;

      schedule.push({
        period,
        beginningBalance: bookValue + amortizationExpense,
        amortizationExpense,
        endingBalance: bookValue,
        cumulativeAmortization
      });
    }

    return schedule;
  }
}

/**
 * Time Value of Money Calculator
 */
export class TimeValueCalculator {
  /**
   * Calculate present value of a future cash flow
   * Formula: FV / (1 + r)^n
   */
  static presentValue(
    futureValue: number,
    discountRate: number,
    periods: number
  ): number {
    if (discountRate <= 0) return futureValue;
    return futureValue / Math.pow(1 + discountRate, periods);
  }

  /**
   * Calculate future value of a present cash flow
   * Formula: PV × (1 + r)^n
   */
  static futureValue(
    presentValue: number,
    discountRate: number,
    periods: number
  ): number {
    return presentValue * Math.pow(1 + discountRate, periods);
  }

  /**
   * Calculate net present value of a series of cash flows
   */
  static netPresentValue(
    cashFlows: number[],
    discountRate: number,
    initialInvestment: number = 0
  ): number {
    let npv = -initialInvestment;
    
    for (let i = 0; i < cashFlows.length; i++) {
      npv += this.presentValue(cashFlows[i], discountRate, i + 1);
    }
    
    return npv;
  }

  /**
   * Calculate internal rate of return (IRR)
   * Uses Newton-Raphson method for approximation
   */
  static internalRateOfReturn(
    cashFlows: number[],
    initialGuess: number = 0.1,
    maxIterations: number = 100,
    tolerance: number = 0.0001
  ): number {
    let rate = initialGuess;
    
    for (let i = 0; i < maxIterations; i++) {
      const npv = this.netPresentValue(cashFlows, rate, 0);
      const derivative = this.calculateNPVDerivative(cashFlows, rate);
      
      if (Math.abs(derivative) < tolerance) break;
      
      const newRate = rate - npv / derivative;
      
      if (Math.abs(newRate - rate) < tolerance) {
        rate = newRate;
        break;
      }
      
      rate = newRate;
    }
    
    return rate;
  }

  private static calculateNPVDerivative(cashFlows: number[], rate: number): number {
    let derivative = 0;
    
    for (let i = 0; i < cashFlows.length; i++) {
      derivative -= (i + 1) * cashFlows[i] / Math.pow(1 + rate, i + 2);
    }
    
    return derivative;
  }
}

/**
 * Professional Cost Allocation Calculator
 */
export class CostAllocationCalculator {
  /**
   * Allocate costs based on time proportion
   */
  static allocateByTime(
    totalCost: number,
    period: FinancialPeriod,
    totalPeriod: FinancialPeriod
  ): number {
    const timeRatio = period.daysInPeriod / totalPeriod.daysInPeriod;
    return totalCost * timeRatio;
  }

  /**
   * Allocate costs based on usage (e.g., square footage)
   */
  static allocateByUsage(
    totalCost: number,
    usage: number,
    totalUsage: number
  ): number {
    if (totalUsage <= 0) return 0;
    return totalCost * (usage / totalUsage);
  }

  /**
   * Allocate costs based on headcount
   */
  static allocateByHeadcount(
    totalCost: number,
    headcount: number,
    totalHeadcount: number
  ): number {
    if (totalHeadcount <= 0) return 0;
    return totalCost * (headcount / totalHeadcount);
  }

  /**
   * Allocate costs based on revenue
   */
  static allocateByRevenue(
    totalCost: number,
    revenue: number,
    totalRevenue: number
  ): number {
    if (totalRevenue <= 0) return 0;
    return totalCost * (revenue / totalRevenue);
  }
}

/**
 * Main Facility Cost Calculator
 */
export class FacilityCostCalculator {
  /**
   * Calculate comprehensive facility costs for a given period
   */
  static calculateFacilityCosts(
    facility: FacilityCostStructure,
    period: FinancialPeriod,
    discountRate: number = FINANCIAL_CONSTANTS.DEFAULT_DISCOUNT_RATE
  ): {
    totalCost: number;
    costBreakdown: Record<CostCategory, number>;
    amortizationSchedule: AmortizationSchedule[];
    presentValue: number;
  } {
    const costBreakdown: Record<CostCategory, number> = {
      [CostCategory.RENT]: 0,
      [CostCategory.SECURITY_DEPOSIT]: 0,
      [CostCategory.MAINTENANCE]: 0,
      [CostCategory.UTILITIES]: 0,
      [CostCategory.INSURANCE]: 0,
      [CostCategory.TAXES]: 0,
      [CostCategory.ADMINISTRATIVE]: 0,
      [CostCategory.CAPITAL_EXPENDITURE]: 0
    };

    // Calculate rent costs
    const rentCost = this.calculateRentCost(facility.rentAgreement, period);
    costBreakdown[CostCategory.RENT] = rentCost;

    // Calculate security deposit amortization
    const securityDepositCost = this.calculateSecurityDepositCost(
      facility.securityDeposit,
      period
    );
    costBreakdown[CostCategory.SECURITY_DEPOSIT] = securityDepositCost;

    // Calculate maintenance costs
    const maintenanceCost = this.calculateMaintenanceCost(
      facility.maintenanceCosts,
      period
    );
    costBreakdown[CostCategory.MAINTENANCE] = maintenanceCost;

    // Calculate other costs
    for (const cost of facility.otherCosts) {
      const allocatedCost = this.allocateCost(cost, period);
      costBreakdown[cost.category] += allocatedCost;
    }

    const totalCost = Object.values(costBreakdown).reduce((sum, cost) => sum + cost, 0);

    // Calculate present value using standardized 30-day months
    const presentValue = TimeValueCalculator.presentValue(
      totalCost,
      discountRate,
      period.daysInPeriod / FINANCIAL_CONSTANTS.DAYS_PER_YEAR
    );

    // Generate amortization schedule for security deposit
    const amortizationSchedule = AmortizationCalculator.generateAmortizationSchedule(
      facility.securityDeposit.amount,
      0,
      facility.securityDeposit.amortizationPeriod,
      facility.securityDeposit.amortizationMethod,
      [period]
    );

    return {
      totalCost: this.roundToPrecision(totalCost),
      costBreakdown: this.roundCostBreakdown(costBreakdown),
      amortizationSchedule,
      presentValue: this.roundToPrecision(presentValue)
    };
  }

  private static calculateRentCost(
    rentAgreement: FacilityCostStructure['rentAgreement'],
    period: FinancialPeriod
  ): number {
    const { monthlyRent, startDate, endDate, escalationRate = 0 } = rentAgreement;
    
    // Check if period overlaps with rent agreement
    const periodStart = dayjs(period.startDate);
    const periodEnd = dayjs(period.endDate);
    const agreementStart = dayjs(startDate);
    const agreementEnd = dayjs(endDate);

    if (periodEnd.isBefore(agreementStart) || periodStart.isAfter(agreementEnd)) {
      return 0;
    }

    // Calculate overlap period
    const overlapStart = periodStart.isAfter(agreementStart) ? periodStart : agreementStart;
    const overlapEnd = periodEnd.isBefore(agreementEnd) ? periodEnd : agreementEnd;
    const overlapDays = overlapEnd.diff(overlapStart, 'day', true);

    // Calculate escalated rent
    const monthsFromStart = overlapStart.diff(agreementStart, 'month', true);
    const escalatedRent = monthlyRent * Math.pow(1 + escalationRate, monthsFromStart / 12);

    // Calculate daily rent using standardized 30-day months
    const dailyRent = escalatedRent / FINANCIAL_CONSTANTS.DAYS_PER_MONTH;

    return dailyRent * overlapDays;
  }

  private static calculateSecurityDepositCost(
    securityDeposit: FacilityCostStructure['securityDeposit'],
    period: FinancialPeriod
  ): number {
    if (!securityDeposit.isRefundable) return 0;

    const schedule = AmortizationCalculator.generateAmortizationSchedule(
      securityDeposit.amount,
      0,
      securityDeposit.amortizationPeriod,
      securityDeposit.amortizationMethod,
      [period]
    );

    return schedule[0]?.amortizationExpense || 0;
  }

  private static calculateMaintenanceCost(
    maintenanceCosts: FacilityCostStructure['maintenanceCosts'],
    period: FinancialPeriod
  ): number {
    let totalCost = 0;

    for (const maintenance of maintenanceCosts) {
      const maintenanceStart = dayjs(maintenance.startDate);
      const maintenanceEnd = maintenance.endDate ? dayjs(maintenance.endDate) : dayjs().add(100, 'year');
      const periodStart = dayjs(period.startDate);
      const periodEnd = dayjs(period.endDate);

      // Check if maintenance period overlaps with calculation period
      if (periodEnd.isBefore(maintenanceStart) || periodStart.isAfter(maintenanceEnd)) {
        continue;
      }

      let cost = 0;

      switch (maintenance.frequency) {
        case 'monthly':
          cost = this.calculateMonthlyCost(maintenance, period);
          break;
        case 'quarterly':
          cost = this.calculateQuarterlyCost(maintenance, period);
          break;
        case 'annually':
          cost = this.calculateAnnualCost(maintenance, period);
          break;
        case 'one_time':
          cost = this.calculateOneTimeCost(maintenance, period);
          break;
      }

      totalCost += cost;
    }

    return totalCost;
  }

  private static calculateMonthlyCost(
    maintenance: FacilityCostStructure['maintenanceCosts'][0],
    period: FinancialPeriod
  ): number {
    const periodStart = dayjs(period.startDate);
    const periodEnd = dayjs(period.endDate);
    const maintenanceStart = dayjs(maintenance.startDate);

    // Calculate how many months are covered in this period
    const startMonth = periodStart.isAfter(maintenanceStart) ? periodStart : maintenanceStart;
    const endMonth = periodEnd.isBefore(maintenanceStart.add(1, 'year')) ? periodEnd : maintenanceStart.add(1, 'year');

    if (startMonth.isAfter(endMonth)) return 0;

    const monthsCovered = endMonth.diff(startMonth, 'month', true);
    const escalatedAmount = maintenance.amount * Math.pow(1 + (maintenance.escalationRate || 0), monthsCovered / 12);

    return escalatedAmount * monthsCovered;
  }

  private static calculateQuarterlyCost(
    maintenance: FacilityCostStructure['maintenanceCosts'][0],
    period: FinancialPeriod
  ): number {
    const periodStart = dayjs(period.startDate);
    const periodEnd = dayjs(period.endDate);
    const maintenanceStart = dayjs(maintenance.startDate);

    // Calculate quarters covered
    const quartersCovered = this.calculateQuartersCovered(periodStart, periodEnd, maintenanceStart);
    const escalatedAmount = maintenance.amount * Math.pow(1 + (maintenance.escalationRate || 0), quartersCovered / 4);

    return escalatedAmount * quartersCovered;
  }

  private static calculateAnnualCost(
    maintenance: FacilityCostStructure['maintenanceCosts'][0],
    period: FinancialPeriod
  ): number {
    const periodStart = dayjs(period.startDate);
    const periodEnd = dayjs(period.endDate);
    const maintenanceStart = dayjs(maintenance.startDate);

    // Check if period covers the annual maintenance
    if (periodStart.isAfter(maintenanceStart.add(1, 'year')) || 
        periodEnd.isBefore(maintenanceStart)) {
      return 0;
    }

    const yearsCovered = periodEnd.diff(periodStart, 'year', true);
    const escalatedAmount = maintenance.amount * Math.pow(1 + (maintenance.escalationRate || 0), yearsCovered);

    return escalatedAmount * yearsCovered;
  }

  private static calculateOneTimeCost(
    maintenance: FacilityCostStructure['maintenanceCosts'][0],
    period: FinancialPeriod
  ): number {
    const periodStart = dayjs(period.startDate);
    const periodEnd = dayjs(period.endDate);
    const maintenanceStart = dayjs(maintenance.startDate);

    // Check if one-time cost falls within the period
    if (maintenanceStart.isBefore(periodStart) || maintenanceStart.isAfter(periodEnd)) {
      return 0;
    }

    return maintenance.amount;
  }

  private static calculateQuartersCovered(
    periodStart: dayjs.Dayjs,
    periodEnd: dayjs.Dayjs,
    maintenanceStart: dayjs.Dayjs
  ): number {
    // This is a simplified calculation - in practice, you'd need more sophisticated logic
    return periodEnd.diff(periodStart, 'quarter', true);
  }

  private static allocateCost(cost: CostAllocation, period: FinancialPeriod): number {
    // This would implement the specific allocation method
    // For now, using time-based allocation
    return CostAllocationCalculator.allocateByTime(
      cost.amount,
      period,
      { startDate: new Date(), endDate: new Date(), type: PeriodType.ANNUAL, daysInPeriod: 365, businessDaysInPeriod: 260 }
    );
  }

  private static roundToPrecision(value: number): number {
    return Math.round(value * Math.pow(10, FINANCIAL_CONSTANTS.PRECISION_DECIMALS)) / 
           Math.pow(10, FINANCIAL_CONSTANTS.PRECISION_DECIMALS);
  }

  private static roundCostBreakdown(breakdown: Record<CostCategory, number>): Record<CostCategory, number> {
    const rounded: Record<CostCategory, number> = {} as Record<CostCategory, number>;
    for (const [key, value] of Object.entries(breakdown)) {
      rounded[key as CostCategory] = this.roundToPrecision(value);
    }
    return rounded;
  }
}

/**
 * Export the main calculator class for easy use
 */
export default FacilityCostCalculator;
