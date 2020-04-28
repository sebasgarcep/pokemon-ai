/**
 * @typedef {import('./SharedPokemonState')} SharedPokemonState
 * @typedef {import('./Move')} Move
 */

/**
 * Uses a Pokemon's move.
 * @public
 */
class MoveAction {
  /**
   * Creates a move action.
   * @param {Move} move
   * @param {number} target
   */
  constructor(move, target) {
    this.move = move;
    this.target = target;
  }
}

/**
 * Switches a Pokemon for another.
 * @public
 */
class SwitchAction {
  /**
   * Creates a switch action.
   * @param {SharedPokemonState} outgoing
   */
  constructor(outgoing) {
    this.outgoing = outgoing;
  }
}

/**
 * Nothing to do.
 * @public
 */
class PassAction {}

/**
 * @typedef {MoveAction | SwitchAction | PassAction} BattleAction
 */

module.exports.MoveAction = MoveAction;
module.exports.SwitchAction = SwitchAction;
module.exports.PassAction = PassAction;
