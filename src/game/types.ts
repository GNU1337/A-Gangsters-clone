/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GamePhase {
  PLANNING = 'planning',
  WORKING = 'working',
  GAME_OVER = 'game_over'
}

export interface HoodAttributes {
  organization: number; // Originally Arson - Drives business efficiency
  business: number;     // Originally Fists - Drives legal income
  knives: number;       // Originally Driving - Spec in quiet hits
  intelligence: number; // Master stat
}

export enum HoodStatus {
  IDLE = 'idle',
  ON_ORDER = 'on_order',
  INJURED = 'injured',
  IN_JAIL = 'in_jail',
  DEAD = 'dead'
}

export interface Order {
  id: string;
  type: OrderType;
  targetId: string;
  hoodId: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export enum OrderType {
  EXTORT = 'extort',
  COLLECT = 'collect',
  HIT = 'hit',
  BOMB = 'bomb',
  BRIBE = 'bribe',
  RECON = 'recon',
  OPEN_RACKET = 'open_racket',
  RECRUIT = 'recruit'
}

export interface Hood {
  id: string;
  name: string;
  nickname: string;
  attributes: HoodAttributes;
  status: HoodStatus;
  loyalty: number;
  salary: number;
  x: number;
  y: number;
  currentOrderId?: string;
  gangId: string;
}

export enum RacketType {
  SPEAKEASY = 'speakeasy',
  CASINO = 'casino',
  LOAN_SHARK = 'loan_shark',
  COUNTERFEIT = 'counterfeit',
  PRIZEFIGHT = 'prizefight',
  MOONSHINE_STILL = 'moonshine_still'
}

export enum FrontType {
  RESTAURANT = 'restaurant',
  GYM = 'gym',
  PRINTER = 'printer',
  BANK = 'bank',
  EMPTY = 'empty'
}

export interface Business {
  id: string;
  name: string;
  frontType: FrontType;
  racketType?: RacketType;
  ownerId: string; // Gang ID
  blockId: string;
  incomeLegal: number;
  incomeIllegal: number;
  efficiency: number;
  detectionRisk: number;
  isRaidWarning: boolean;
}

export interface CityBlock {
  id: string;
  x: number;
  y: number;
  landValue: number; // 0-255
  businesses: string[]; // Business IDs
  type: 'commercial' | 'residential' | 'industrial' | 'park';
}

export interface Gang {
  id: string;
  name: string;
  bossName: string;
  money: number;
  legalMoney: number;
  isPlayer: boolean;
  intensity: number; // Diplomacy/Aggression (0-100)
  headquartersBlockId: string;
}

export interface GameState {
  turn: number;
  weekDate: string;
  phase: GamePhase;
  playerGang: string;
  gangs: Record<string, Gang>;
  hoods: Record<string, Hood>;
  businesses: Record<string, Business>;
  city: Record<string, CityBlock>;
  orders: Record<string, Order>;
  heatLevel: number;
  fbiPressure: number;
  selectedHoodId?: string;
  selectedBlockId?: string;
  simulationSpeed: number;
  isPaused: boolean;
  showTutorial: boolean;
  tutorialStep: number;
  history: GameEvent[];
}

export interface GameEvent {
  id: string;
  turn: number;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'critical';
  timestamp: number;
}
