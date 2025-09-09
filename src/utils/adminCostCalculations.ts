/**
 * Professional Cost Calculation System for AdminPage
 * 
 * This module replaces the basic cost calculations with professional,
 * finance-grade calculations that follow accounting standards.
 */

import {
  FinanceCalculator,
  AmortizationCalculator,
  TimeValueCalculator,
  CostAllocationCalculator,
  FacilityCostCalculator,
  AmortizationMethod,
  CostCategory,
  PeriodType,
  FINANCIAL_CONSTANTS,
  type FacilityCostStructure,
  type FinancialPeriod,
  type CostAllocation
} from './financeCalculations';
import dayjs from 'dayjs';

/**
 * Enhanced Cost Calculation Functions for AdminPage
 */
export class AdminCostCalculator {
  /**
   * Calculate facility costs using professional finance methods
   */
  static calculateFacilityCosts(
    facilities: any[],
    periodStart: Date,
    periodEnd: Date,
    periodType: PeriodType = PeriodType.MONTHLY
  ): {
    totalCost: number;
    costBreakdown: Record<string, number>;
    facilityBreakdown: Array<{
      facilityId: string;
      facilityName: string;
      totalCost: number;
      costBreakdown: Record<string, number>;
    }>;
  } {
    const period: FinancialPeriod = FinanceCalculator.createFinancialPeriod(
      periodStart,
      periodEnd,
      periodType
    );

    let totalCost = 0;
    const costBreakdown: Record<string, number> = {};
    const facilityBreakdown: Array<{
      facilityId: string;
      facilityName: string;
      totalCost: number;
      costBreakdown: Record<string, number>;
    }> = [];

    for (const facility of facilities) {
      if (!facility.rentAgreement?.startDate) continue;

      const facilityCostStructure = this.convertToFacilityCostStructure(facility);
      const facilityCosts = FacilityCostCalculator.calculateFacilityCosts(
        facilityCostStructure,
        period
      );

      totalCost += facilityCosts.totalCost;

      // Aggregate cost breakdown
      for (const [category, amount] of Object.entries(facilityCosts.costBreakdown)) {
        costBreakdown[category] = (costBreakdown[category] || 0) + amount;
      }

      // Individual facility breakdown
      facilityBreakdown.push({
        facilityId: facility._id || facility.id,
        facilityName: facility.facilityName || 'Unknown Facility',
        totalCost: facilityCosts.totalCost,
        costBreakdown: facilityCosts.costBreakdown
      });
    }

    return {
      totalCost: this.roundToPrecision(totalCost),
      costBreakdown: this.roundCostBreakdown(costBreakdown),
      facilityBreakdown
    };
  }

  /**
   * Calculate daily facility costs
   */
  static calculateDailyFacilityCosts(facilities: any[]): number {
    const today = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const result = this.calculateFacilityCosts(facilities, dayStart, dayEnd, PeriodType.DAILY);
    return result.totalCost;
  }

  /**
   * Calculate weekly facility costs
   */
  static calculateWeeklyFacilityCosts(facilities: any[]): number {
    const today = new Date();
    const weekStart = this.getWeekStart(today);
    const weekEnd = this.getWeekEnd(today);

    const result = this.calculateFacilityCosts(facilities, weekStart, weekEnd, PeriodType.WEEKLY);
    return result.totalCost;
  }

  /**
   * Calculate monthly facility costs
   */
  static calculateMonthlyFacilityCosts(facilities: any[]): number {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const result = this.calculateFacilityCosts(facilities, monthStart, monthEnd, PeriodType.MONTHLY);
    return result.totalCost;
  }

  /**
   * Calculate quarterly facility costs
   */
  static calculateQuarterlyFacilityCosts(facilities: any[]): number {
    const today = new Date();
    const quarterStart = this.getQuarterStart(today);
    const quarterEnd = this.getQuarterEnd(today);

    const result = this.calculateFacilityCosts(facilities, quarterStart, quarterEnd, PeriodType.QUARTERLY);
    return result.totalCost;
  }

  /**
   * Calculate half-yearly facility costs
   */
  static calculateHalfYearlyFacilityCosts(facilities: any[]): number {
    const today = new Date();
    const halfYearStart = this.getHalfYearStart(today);
    const halfYearEnd = this.getHalfYearEnd(today);

    const result = this.calculateFacilityCosts(facilities, halfYearStart, halfYearEnd, PeriodType.SEMI_ANNUAL);
    return result.totalCost;
  }

  /**
   * Calculate yearly facility costs
   */
  static calculateYearlyFacilityCosts(facilities: any[]): number {
    const today = new Date();
    const yearStart = this.getFinancialYearStart(today);
    const yearEnd = this.getFinancialYearEnd(today);

    const result = this.calculateFacilityCosts(facilities, yearStart, yearEnd, PeriodType.FINANCIAL_YEAR);
    return result.totalCost;
  }

  /**
   * Calculate government document costs with proper amortization using 30-day month standard
   */
  static calculateGovernmentDocumentCosts(
    documents: any[],
    periodStart: Date,
    periodEnd: Date
  ): number {
    const period: FinancialPeriod = FinanceCalculator.createFinancialPeriod(
      periodStart,
      periodEnd,
      PeriodType.MONTHLY
    );

    let totalCost = 0;

    for (const doc of documents) {
      if (!doc.fee || !doc.submissionDate) continue;

      const submissionDate = new Date(doc.submissionDate);
      const cost = parseFloat(doc.fee) || 0;
      const amortization = parseInt(doc.amortization) || 0;

      if (amortization > 0) {
        // Use professional amortization calculation with 30-day month standard
        const amortizedCost = AmortizationCalculator.straightLine(
          cost,
          0, // salvage value
          amortization,
          period
        );
        totalCost += amortizedCost;
      } else {
        // One-time cost if submission date falls within period
        if (submissionDate >= periodStart && submissionDate < periodEnd) {
          totalCost += cost;
        }
      }
    }

    return this.roundToPrecision(totalCost);
  }

  /**
   * Calculate correspondence costs with proper amortization
   */
  static calculateCorrespondenceCosts(
    correspondences: any[],
    periodStart: Date,
    periodEnd: Date
  ): number {
    return this.calculateGovernmentDocumentCosts(correspondences, periodStart, periodEnd);
  }

  /**
   * Calculate legal case costs
   */
  static calculateLegalCaseCosts(
    legalCases: any[],
    periodStart: Date,
    periodEnd: Date
  ): number {
    let totalCost = 0;

    for (const legalCase of legalCases) {
      if (!legalCase.filingDate) continue;

      const filingDate = new Date(legalCase.filingDate);
      
      // Only include costs if filing date falls within the period
      if (filingDate >= periodStart && filingDate < periodEnd) {
        const contractAmount = parseFloat(legalCase.legalRepresentative?.contractAmount) || 0;
        const actualCost = parseFloat(legalCase.actualCost) || 0;
        const actualLegalRepCost = parseFloat(legalCase.actualLegalRepCost) || 0;
        const otherCosts = parseFloat(legalCase.otherCosts) || 0;
        const totalActualCost = parseFloat(legalCase.totalActualCost) || 0;

        // Sum all actual costs (excluding estimated costs as per requirement)
        const caseTotalCost = contractAmount + actualCost + actualLegalRepCost + otherCosts + totalActualCost;
        totalCost += caseTotalCost;
      }
    }

    return this.roundToPrecision(totalCost);
  }

  /**
   * Convert facility data to professional cost structure
   */
  private static convertToFacilityCostStructure(facility: any): FacilityCostStructure {
    const rentAgreement = facility.rentAgreement || {};
    const securityDeposit = rentAgreement.securityDeposit || 0;
    const securityDepositAmount = rentAgreement.securityDepositAmount || 0;
    const totalSecurityDeposit = parseFloat(securityDeposit) + parseFloat(securityDepositAmount);

    return {
      facilityId: facility._id || facility.id || 'unknown',
      facilityName: facility.facilityName || 'Unknown Facility',
      rentAgreement: {
        monthlyRent: parseFloat(rentAgreement.monthlyRent) || 0,
        startDate: new Date(rentAgreement.startDate || new Date()),
        endDate: new Date(rentAgreement.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
        escalationRate: parseFloat(rentAgreement.escalationRate) || 0
      },
      securityDeposit: {
        amount: totalSecurityDeposit,
        isRefundable: true,
        amortizationPeriod: parseInt(rentAgreement.securityDepositAmortization) || 12,
        amortizationMethod: AmortizationMethod.STRAIGHT_LINE
      },
      maintenanceCosts: (facility.maintenanceHistory || []).map((maintenance: any) => ({
        amount: parseFloat(maintenance.cost) || 0,
        frequency: 'monthly' as const,
        startDate: new Date(maintenance.date || new Date()),
        escalationRate: 0
      })),
      otherCosts: []
    };
  }

  /**
   * Helper functions for period calculations
   */
  private static getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  private static getWeekEnd(date: Date): Date {
    const weekStart = this.getWeekStart(new Date(date));
    return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  }

  private static getQuarterStart(date: Date): Date {
    const quarter = Math.floor(date.getMonth() / 3);
    return new Date(date.getFullYear(), quarter * 3, 1);
  }

  private static getQuarterEnd(date: Date): Date {
    const quarter = Math.floor(date.getMonth() / 3);
    return new Date(date.getFullYear(), (quarter + 1) * 3, 0);
  }

  private static getHalfYearStart(date: Date): Date {
    const half = Math.floor(date.getMonth() / 6);
    return new Date(date.getFullYear(), half * 6, 1);
  }

  private static getHalfYearEnd(date: Date): Date {
    const half = Math.floor(date.getMonth() / 6);
    return new Date(date.getFullYear(), (half + 1) * 6, 0);
  }

  private static getFinancialYearStart(date: Date): Date {
    const year = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
    return new Date(year, 3, 1); // April 1st
  }

  private static getFinancialYearEnd(date: Date): Date {
    const year = date.getMonth() >= 3 ? date.getFullYear() + 1 : date.getFullYear();
    return new Date(year, 2, 31); // March 31st
  }

  private static roundToPrecision(value: number): number {
    return Math.round(value * Math.pow(10, FINANCIAL_CONSTANTS.PRECISION_DECIMALS)) / 
           Math.pow(10, FINANCIAL_CONSTANTS.PRECISION_DECIMALS);
  }

  private static roundCostBreakdown(breakdown: Record<string, number>): Record<string, number> {
    const rounded: Record<string, number> = {};
    for (const [key, value] of Object.entries(breakdown)) {
      rounded[key] = this.roundToPrecision(value);
    }
    return rounded;
  }
}

export default AdminCostCalculator;
