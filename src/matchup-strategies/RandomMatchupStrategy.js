const AbstractMatchupStrategy = require('./AbstractMatchupStrategy');

class RandomMatchupStrategy extends AbstractMatchupStrategy {
  matchup() {
    const positions = [1, 2, 3, 4, 5, 6];
    const weights = positions.map(() => Math.random());
    return [1, 2, 3, 4, 5, 6].sort((a, b) => weights[a - 1] - weights[b - 1]).slice(0, 4);
  }
}

module.exports = RandomMatchupStrategy;
