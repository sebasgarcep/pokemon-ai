const AbstractBattleStrategy = require('./AbstractBattleStrategy');
const { sample } = require('../utils');

class RandomBattleStrategy extends AbstractBattleStrategy {
  // eslint-disable-next-line no-unused-vars
  battle(playerTeam, playerActive, rivalActive, field) {
    return playerActive.map(item => {
      if (!item) { return null; }
      const [move] = sample(
        [1, 2, 3, 4].filter((index) => item.moves[index - 1].pp > 0)
      );
      const target = item.moves[move - 1].target === 'normal' ? 1 : 0;
      return { type: 'move', move, target };
    });
  }

  // eslint-disable-next-line no-unused-vars
  forceSwitch(playerTeam, switches) {

  }
}

module.exports = RandomBattleStrategy;
