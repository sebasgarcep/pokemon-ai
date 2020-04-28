/**
 * @typedef {import('../data-structures/BattleAction').BattleAction} BattleAction
 * @typedef {import('../data-structures/BattleAction').SwitchAction} SwitchAction
 * @typedef {import('../data-structures/PokemonBuild')} PokemonBuild
 * @typedef {import('../data-structures/PokemonPreview')} PokemonPreview
 * @typedef {import('../data-structures/PokemonState')} PokemonState
 * @typedef {import('../data-structures/SharedPokemonState')} SharedPokemonState
 * @typedef {import('../data-structures/FieldState')} FieldState
 */

const AbstractBattleStrategy = require('./AbstractBattleStrategy');
const { MoveAction, SwitchAction, PassAction } = require('../data-structures/BattleAction');
const { sample } = require('../utils');

class RandomBattleStrategy extends AbstractBattleStrategy {
  /**
   * @param {PokemonState[]} playerTeam
   * @param {PokemonState[]} playerActive
   * @param {SharedPokemonState[]} rivalActive
   * @param {FieldState} field
   * @returns {BattleAction[]}
   */
  // eslint-disable-next-line no-unused-vars
  battle(playerTeam, playerActive, rivalActive, field) {
    return playerActive.map((entity, index) => {
      if (!entity) { return new PassAction(); }
      const [details] = sample(entity.moves.filter((item) => {
        if (item.target === 'adjacentAlly' && !playerActive[2 - index]) { return false; }
        return !item.disabled && item.pp.current > 0;
      }));
      if (details === undefined) { return new PassAction(); }
      /** @type {number} */
      let target;
      if (['normal', 'any'].includes(details.target)) {
        target = sample([1, 2])[0];
      } else if(['adjacentAlly'].includes(details.target)) {
        target = index - 2;
      } else if(['adjacentAllyOrSelf'].includes(details.target)) {
        target = sample([0, 1])[0] - 2;
      } else {
        target = 0;
      }
      return new MoveAction(details, target);
    });
  }

  /**
   * @param {PokemonState[]} playerTeam
   * @param {PokemonState[]} playerActive
   * @param {SharedPokemonState[]} rivalActive
   * @param {FieldState} field
   * @param {boolean[]} switches
   * @returns {(SwitchAction | PassAction)[]}
   */
  // eslint-disable-next-line no-unused-vars
  forceSwitch(playerTeam, playerActive, rivalActive, field, switches) {
    const numSwitches = switches.filter(entity => !!entity).length;
    /** @type {(SwitchAction | PassAction)[]} */
    const actions = playerTeam
      .filter(entity => !entity.active && entity.hp.current > 0)
      .slice(0, numSwitches)
      .map(entity => new SwitchAction(entity));
    while (actions.length < numSwitches) {
      actions.push(new PassAction());
    }
    return actions;
  }
}

module.exports = RandomBattleStrategy;
