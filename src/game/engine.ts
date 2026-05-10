/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SIXTY_FOUR_RULE, RACKET_METRICS, FRONT_COMPATIBILITY } from './constants';
import { CityBlock, GameState, GamePhase, Gang, Hood, HoodStatus, Business, FrontType, RacketType, OrderType } from './types';

export function calculateBusinessIncome(business: Business, landValue: number): { legal: number, illegal: number } {
  const lvFactor = landValue / 255;
  const efficiencyFactor = business.efficiency / SIXTY_FOUR_RULE.UNIT;
  
  let illegal = 0;
  if (business.racketType) {
    const metric = RACKET_METRICS[business.racketType];
    illegal = metric.baseProfit * lvFactor * efficiencyFactor * SIXTY_FOUR_RULE.UNIT;
    
    // Penalize casinos in low LV areas as per requirements
    if (business.racketType === RacketType.CASINO && landValue < metric.minLV) {
      illegal = -Math.abs(illegal);
    }
  }

  const legal = 100 * lvFactor * efficiencyFactor * SIXTY_FOUR_RULE.UNIT;
  
  return { legal, illegal };
}

export function generateInitialState(): GameState {
  const playerGangId = 'player-gang';
  const playerGang: Gang = {
    id: playerGangId,
    name: 'The Syndicate',
    bossName: 'The User',
    money: 5000 * SIXTY_FOUR_RULE.UNIT,
    legalMoney: 1000 * SIXTY_FOUR_RULE.UNIT,
    isPlayer: true,
    intensity: 50,
    headquartersBlockId: 'block-0-0',
  };

  const gangs: Record<string, Gang> = { [playerGangId]: playerGang };
  ['The Moretti Family', 'The Irish Mob', 'The Black Hand'].forEach((name, i) => {
    const id = `rival-${i}`;
    gangs[id] = {
      id,
      name,
      bossName: `Boss ${i}`,
      money: 4000 * SIXTY_FOUR_RULE.UNIT,
      legalMoney: 500 * SIXTY_FOUR_RULE.UNIT,
      isPlayer: false,
      intensity: 60,
      headquartersBlockId: `block-${15-i}-${15-i}`,
    };
  });

  const city: Record<string, CityBlock> = {};
  const businesses: Record<string, Business> = {};
  
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const id = `block-${x}-${y}`;
      const type = Math.random() > 0.8 ? 'industrial' : Math.random() > 0.6 ? 'residential' : 'commercial';
      const landValue = Math.floor(Math.random() * 256);
      
      const bId = `business-${x}-${y}`;
      const frontType = Math.random() > 0.5 ? FrontType.RESTAURANT : FrontType.PRINTER;
      
      businesses[bId] = {
        id: bId,
        name: `${frontType} ${x}${y}`,
        frontType,
        ownerId: 'neutral',
        blockId: id,
        incomeLegal: 0,
        incomeIllegal: 0,
        efficiency: 64,
        detectionRisk: 0,
        isRaidWarning: false,
      };

      city[id] = { id, x, y, landValue, businesses: [bId], type };
    }
  }

  const hoods: Record<string, Hood> = {};
  const nicknames = ['Lefty', 'Smiley', 'The Butcher', 'The Ghost', 'The Hammer'];
  for (let i = 0; i < 5; i++) {
    const id = `hood-player-${i}`;
    hoods[id] = {
      id,
      name: `Hood ${i}`,
      nickname: nicknames[i],
      attributes: {
        organization: Math.floor(Math.random() * 64 + 32),
        business: Math.floor(Math.random() * 64 + 32),
        knives: Math.floor(Math.random() * 64 + 32),
        intelligence: Math.floor(Math.random() * 64 + 32),
      },
      status: HoodStatus.IDLE,
      loyalty: 80,
      salary: 100,
      x: Math.random() * 2,
      y: Math.random() * 2,
      gangId: playerGangId,
    };
  }

  return {
    turn: 1,
    weekDate: 'October 1920',
    phase: GamePhase.PLANNING,
    playerGang: playerGangId,
    gangs,
    hoods,
    businesses,
    city,
    orders: {},
    heatLevel: 10,
    fbiPressure: 5,
    simulationSpeed: 1,
    isPaused: false,
    history: [{
      id: 'initial',
      turn: 1,
      message: 'New week begins. Prohibition is in full swing. Establish your first speakeasy.',
      type: 'info',
      timestamp: Date.now()
    }],
  };
}

export function processWeekEnd(state: GameState): GameState {
  const nextState = { ...state };
  const playerGang = nextState.gangs[state.playerGang];
  
  let totalLegal = 0;
  let totalIllegal = 0;

  Object.values(nextState.businesses).forEach(b => {
    if (b.ownerId === state.playerGang) {
      const block = nextState.city[b.blockId];
      const { legal, illegal } = calculateBusinessIncome(b, block.landValue);
      totalLegal += legal;
      totalIllegal += illegal;
    }
  });

  playerGang.money += totalIllegal;
  playerGang.legalMoney += totalLegal;
  
  nextState.turn += 1;
  nextState.history.push({
    id: `turn-${nextState.turn}`,
    turn: nextState.turn,
    message: `Week ${state.turn} complete. Net income: $${((totalLegal + totalIllegal) / 64).toLocaleString()}`,
    type: 'info',
    timestamp: Date.now()
  });

  return nextState;
}

export function moveHood(hood: Hood, targetX: number, targetY: number, speed: number): Hood {
  const dx = targetX - hood.x;
  const dy = targetY - hood.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist < 0.1) return { ...hood, x: targetX, y: targetY };
  
  return {
    ...hood,
    x: hood.x + (dx / dist) * speed,
    y: hood.y + (dy / dist) * speed,
  };
}
