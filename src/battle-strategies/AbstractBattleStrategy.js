/* eslint-disable no-unused-vars */

/**
 * @typedef {import('../data-structures/BattleAction')} BattleAction
 * @typedef {import('../data-structures/PokemonBuild')} PokemonBuild
 * @typedef {import('../data-structures/PokemonPreview')} PokemonPreview
 */

/**
  * Abstract interface for battle strategy.
  * @public
  */
class AbstractBattleStrategy {
  /**
   * Makes a choice about what to do in battle.
   * @abstract
   * @param {*} playerTeam FIXME: SIGNATURE MISSING
   * @param {*} playerActive FIXME: SIGNATURE MISSING
   * @param {*} rivalActive FIXME: SIGNATURE MISSING
   * @param {*} field FIXME: SIGNATURE MISSING
   * @returns {BattleAction[]}
   */
  battle(playerTeam, playerActive, rivalActive, field) {
    throw new Error('Not implemented.');
  }

  /**
   * Makes a choice about which Pokemon to bring out when a switch is forced.
   * @abstract
   * @param {*} playerTeam FIXME: SIGNATURE MISSING
   * @param {*} switches FIXME: SIGNATURE MISSING
   * @returns {BattleAction[]}
   */
  forceSwitch(playerTeam, switches) {
    throw new Error('Not implemented.');
  }
}

module.exports = AbstractBattleStrategy;
