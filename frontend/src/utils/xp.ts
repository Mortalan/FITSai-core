export const LEVEL_XP_REQUIREMENTS: Record<number, number> = {
  1: 0, 2: 100, 3: 250, 4: 450, 5: 700, 6: 1000, 7: 1400, 8: 1900, 9: 2500, 10: 3200,
  11: 4000, 12: 5000, 13: 6200, 14: 7600, 15: 9200, 16: 11000, 17: 13000, 18: 15200, 19: 17600, 20: 20200,
  21: 23000, 22: 26000, 23: 29500, 24: 33500, 25: 38000, 26: 43000, 27: 48500, 28: 54500, 29: 61000, 30: 68000,
  31: 75500, 32: 83500, 33: 92000, 34: 101000, 35: 110500, 36: 120500, 37: 131000, 38: 142000, 39: 153500, 40: 165500,
  41: 178000, 42: 191000, 43: 204500, 44: 218500, 45: 233000, 46: 248000, 47: 263500, 48: 279500, 49: 296000, 50: 313000,
};

export function getXPProgress(level: number, currentXP: number) {
  if (level >= 50) return 100;
  const currentTierXP = LEVEL_XP_REQUIREMENTS[level] || 0;
  const nextTierXP = LEVEL_XP_REQUIREMENTS[level + 1] || 100;
  const progress = ((currentXP - currentTierXP) / (nextTierXP - currentTierXP)) * 100;
  return Math.max(0, Math.min(100, progress));
}
