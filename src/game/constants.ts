/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FrontType, RacketType } from './types';

// The "64-Rule": 64 equals 1 unit, 32 represents 0 or random chance
export const SIXTY_FOUR_RULE = {
  UNIT: 64,
  CHANCE_THRESHOLD: 32,
  MAX_CAPACITY: 255,
};

// Front Compatibility Logic: 2 = Best, 1 = OK, 0 = Worst
export const FRONT_COMPATIBILITY: Record<FrontType, Partial<Record<RacketType, number>>> = {
  [FrontType.RESTAURANT]: {
    [RacketType.SPEAKEASY]: 2,
    [RacketType.CASINO]: 1,
    [RacketType.LOAN_SHARK]: 1,
  },
  [FrontType.GYM]: {
    [RacketType.PRIZEFIGHT]: 2,
    [RacketType.LOAN_SHARK]: 1,
  },
  [FrontType.PRINTER]: {
    [RacketType.COUNTERFEIT]: 2,
  },
  [FrontType.BANK]: {
    [RacketType.LOAN_SHARK]: 2,
    [RacketType.COUNTERFEIT]: 1,
  },
  [FrontType.EMPTY]: {
    [RacketType.MOONSHINE_STILL]: 2,
    [RacketType.SPEAKEASY]: 0,
  },
};

export const INITIAL_CASH = 1000 * SIXTY_FOUR_RULE.UNIT;
export const CITY_SIZE = 16; // 16x16 blocks = 256 blocks

export const RACKET_METRICS = {
  [RacketType.SPEAKEASY]: { baseProfit: 128, minLV: 64, needsSupply: true },
  [RacketType.CASINO]: { baseProfit: 255, minLV: 160, needsSupply: false },
  [RacketType.LOAN_SHARK]: { baseProfit: 64, minLV: 32, needsSupply: false },
  [RacketType.COUNTERFEIT]: { baseProfit: 192, minLV: 0, needsSupply: false },
  [RacketType.PRIZEFIGHT]: { baseProfit: 96, minLV: 48, needsSupply: false },
  [RacketType.MOONSHINE_STILL]: { baseProfit: 0, minLV: 0, needsSupply: false, providesSupply: true },
};

export const ATTRIBUTE_LABELS = {
  organization: 'Organization (Efficiency)',
  business: 'Business (Legal Income)',
  knives: 'Knives (Stealth/Close)',
  intelligence: 'Intelligence (Success Rate)',
};

export const VICTORY_CONDITIONS = {
  GO_STRAIGHT: 'LEGIT_WEALTH',
  MAYOR: 'POLITICAL_CONTROL',
  DOMINATION: 'LAST_GANG_STANDING',
};

// Global UI Customization
export const UI_SETTINGS = {
  BASE_FONT_SIZE: '18px',    // Increased for "bigger"
  HEADER_FONT_SIZE: '48px',  // Dramatically increased for "bigger"
  SMALL_FONT_SIZE: '14px',   // Increased for "bigger"
  TINY_FONT_SIZE: '11px',    // Increased for "bigger"
  IS_BOLD: true,             
  FONT_WEIGHT: '900',        // "Bolder" - Black weight
  TEXT_COLOR_BLACK: '#000000', // "Blacker" literal ink
  TEXT_COLOR_GOLD: '#d4af37',
  ACCENT_GREEN: '#00ff41',    // "Green Bright" - Classic terminal green
  BG_COLOR_DEEP: '#000000',    // Deeper blacks
  BG_COLOR_PAPER: '#f4ead5',
  FONT_FAMILY: '"Crimson Pro", serif',
};
