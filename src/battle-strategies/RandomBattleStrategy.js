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
const { SwitchAction } = require('../data-structures/BattleAction');
const { MoveAction } = require('../data-structures/BattleAction');
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
    return playerActive.map(entity => {
      if (!entity) { return null; }
      const [details] = sample(entity.moves.filter((item) => !item.disabled && item.pp.current > 0));
      const target = ['normal', 'any'].includes(details.target) ? 1 : 0;
      return new MoveAction(details, target);
    });
  }

  /**
   * @param {PokemonState[]} playerTeam
   * @param {PokemonState[]} playerActive
   * @param {SharedPokemonState[]} rivalActive
   * @param {FieldState} field
   * @param {boolean[]} switches
   * @returns {SwitchAction[]}
   */
  // eslint-disable-next-line no-unused-vars
  forceSwitch(playerTeam, playerActive, rivalActive, field, switches) {
    const numSwitches = switches.filter(entity => !!entity).length;
    return playerTeam
      .filter(entity => !entity.active && entity.hp.current > 0)
      .slice(0, numSwitches)
      .map(entity => new SwitchAction(entity));
  }
}

module.exports = RandomBattleStrategy;
