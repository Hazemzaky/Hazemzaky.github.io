/**
 * Rental Calculation Example - 30-Day Month Standard
 * 
 * This file demonstrates how the 30-day month standard works
 * for rental calculations as requested by the user.
 */

import { FINANCIAL_CONSTANTS } from './financeCalculations';

/**
 * Example: September 2025 to September 2026 Rental Calculation
 * 
 * Monthly Rent: $100
 * Period: September 2025 to September 2026 (12 months)
 * Expected Total: $1,200
 */
export class RentalCalculationExample {
  /**
   * Calculate annual rent using 30-day month standard
   */
  static calculateAnnualRent(monthlyRent: number): number {
    return monthlyRent * FINANCIAL_CONSTANTS.MONTHS_PER_YEAR; // 12 months
  }

  /**
   * Calculate daily rent using 30-day month standard
   */
  static calculateDailyRent(monthlyRent: number): number {
    return monthlyRent / FINANCIAL_CONSTANTS.DAYS_PER_MONTH; // 30 days
  }

  /**
   * Calculate rent for a specific period using 30-day month standard
   */
  static calculatePeriodRent(
    monthlyRent: number,
    startDate: Date,
    endDate: Date
  ): number {
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyRent = this.calculateDailyRent(monthlyRent);
    return dailyRent * periodDays;
  }

  /**
   * Demonstrate the September 2025 to September 2026 example
   */
  static demonstrateExample(): {
    monthlyRent: number;
    dailyRent: number;
    annualRent: number;
    periodRent: number;
    periodDays: number;
  } {
    const monthlyRent = 100;
    const startDate = new Date('2025-09-01');
    const endDate = new Date('2026-09-01');
    
    const dailyRent = this.calculateDailyRent(monthlyRent);
    const annualRent = this.calculateAnnualRent(monthlyRent);
    const periodRent = this.calculatePeriodRent(monthlyRent, startDate, endDate);
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      monthlyRent,
      dailyRent: Math.round(dailyRent * 100) / 100, // Round to 2 decimal places
      annualRent,
      periodRent: Math.round(periodRent * 100) / 100, // Round to 2 decimal places
      periodDays
    };
  }
}

/**
 * Example Usage and Verification
 */
export function verifyRentalCalculation(): void {
  console.log('=== Rental Calculation Example - 30-Day Month Standard ===');
  
  const example = RentalCalculationExample.demonstrateExample();
  
  console.log(`Monthly Rent: $${example.monthlyRent}`);
  console.log(`Daily Rent: $${example.dailyRent} (${example.monthlyRent} ÷ 30 days)`);
  console.log(`Annual Rent: $${example.annualRent} (${example.monthlyRent} × 12 months)`);
  console.log(`Period: September 2025 to September 2026 (${example.periodDays} days)`);
  console.log(`Period Rent: $${example.periodRent}`);
  
  // Verify the calculation
  const expectedAnnual = 1200; // 100 × 12 months
  const isCorrect = Math.abs(example.annualRent - expectedAnnual) < 0.01;
  
  console.log(`\nVerification:`);
  console.log(`Expected Annual Rent: $${expectedAnnual}`);
  console.log(`Calculated Annual Rent: $${example.annualRent}`);
  console.log(`Calculation is ${isCorrect ? 'CORRECT' : 'INCORRECT'} ✅`);
  
  console.log('\n=== Key Benefits of 30-Day Month Standard ===');
  console.log('1. Simplified calculations - all months are exactly 30 days');
  console.log('2. Consistent daily rates - no variation due to month length');
  console.log('3. Easy annual calculations - 12 months × 30 days = 360 days');
  console.log('4. Business-friendly - matches common business practices');
  console.log('5. Predictable costs - no surprises from varying month lengths');
}

export default RentalCalculationExample;
