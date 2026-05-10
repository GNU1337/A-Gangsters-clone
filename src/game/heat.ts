/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SIXTY_FOUR_RULE, FRONT_COMPATIBILITY } from './constants';
import { Business, GameState } from './types';

export function calculateDetectionRisk(business: Business): number {
  if (!business.racketType) return 0;

  const compatibility = FRONT_COMPATIBILITY[business.frontType]?.[business.racketType] ?? 0;
  
  // 2 = Best (Low risk), 1 = OK (Medium risk), 0 = Worst (High risk)
  let risk = 0;
  switch (compatibility) {
    case 2: risk = 5; break;
    case 1: risk = 25; break;
    case 0: risk = 60; break;
  }

  // Multiply by efficiency (more activity = more heat)
  risk = risk * (business.efficiency / SIXTY_FOUR_RULE.UNIT);
  
  return Math.min(100, risk);
}

export function processFBIChecks(state: GameState): GameState {
  const nextState = { ...state };
  let newEvents = [];

  Object.values(nextState.businesses).forEach(b => {
    if (b.ownerId === state.playerGang && b.racketType) {
      const risk = calculateDetectionRisk(b);
      const roll = Math.random() * 100;

      if (roll < risk * 0.1) { // 10% of risk used as raid chance per week
        // Raid!
        b.racketType = undefined;
        b.ownerId = 'neutral'; // Business lost
        nextState.heatLevel += 15;
        
        newEvents.push({
          id: `raid-${Date.now()}-${b.id}`,
          turn: state.turn,
          message: `FBI RAID! ${b.name} was seized. Your illegal activities were exposed.`,
          type: 'critical' as const,
          timestamp: Date.now()
        });
      } else if (roll < risk * 0.3) {
        b.isRaidWarning = true;
        newEvents.push({
          id: `warning-${Date.now()}-${b.id}`,
          turn: state.turn,
          message: `WHISPER: FBI agents spotted near ${b.name}. Heat is rising.`,
          type: 'warning' as const,
          timestamp: Date.now()
        });
      }
    }
  });

  nextState.history = [...nextState.history, ...newEvents];
  return nextState;
}
