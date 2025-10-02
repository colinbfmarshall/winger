// utils/EloCalculator.js
export class EloCalculator {
  static kFactor(eloRating) {
    if (eloRating <= 1200) return 40;
    if (eloRating <= 1800) return 20;
    return 10;
  }
  
  static expectedScore(ratingA, ratingB) {
    return 1.0 / (1.0 + Math.pow(10, (ratingB - ratingA) / 400.0));
  }
  
  static estimateEloAfter(momentElo, opponentElo, isWinner) {
    const kFactor = this.kFactor(momentElo);
    const expected = this.expectedScore(momentElo, opponentElo);
    const actual = isWinner ? 1.0 : 0.0;
    
    const newElo = momentElo + kFactor * (actual - expected);
    return Math.max(Math.round(newElo), 600);
  }
}
