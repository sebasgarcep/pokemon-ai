/* eslint-disable no-unused-vars */

/**
 * @typedef {import('../data-structures/BattleAction').BattleAction} BattleAction
 * @typedef {import('../data-structures/BattleAction').SwitchAction} SwitchAction
 * @typedef {import('../data-structures/BattleAction').PassAction} PassAction
 * @typedef {import('../data-structures/PokemonState')} PokemonState
 * @typedef {import('../data-structures/SharedPokemonState')} SharedPokemonState
 * @typedef {import('../data-structures/FieldState')} FieldState
 */

/**
  * Abstract interface for battle strategy.
  * @public
  */
class AbstractBattleStrategy {
  /**
   * Makes a choice about what to do in battle.
   * @abstract
   * @param {PokemonState[]} playerTeam
   * @param {PokemonState[]} playerActive
   * @param {SharedPokemonState[]} rivalActive
   * @param {FieldState} field
   * @returns {BattleAction[]}
   */
  battle(playerTeam, playerActive, rivalActive, field) {
    throw new Error('Not implemented.');
  }

  /**
   * Makes a choice about which Pokemon to bring out when a switch is forced.
   * @abstract
   * @param {PokemonState[]} playerTeam
   * @param {PokemonState[]} playerActive
   * @param {SharedPokemonState[]} rivalActive
   * @param {FieldState} field
   * @param {boolean[]} switches
   * @returns {(SwitchAction | PassAction)[]}
   */
  forceSwitch(playerTeam, playerActive, rivalActive, field, switches) {
    throw new Error('Not implemented.');
  }
}

module.exports = AbstractBattleStrategy;
