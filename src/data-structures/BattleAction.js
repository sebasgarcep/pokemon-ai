/**
 * Uses a Pokemon's move.
 * @public
 */
class MoveAction {
  /**
   * Creates a move action.
   * @param {string} move
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
   * @param {string} outgoing
   */
  constructor(outgoing) {
    this.outgoing = outgoing;
  }
}

/**
 * @typedef {MoveAction | SwitchAction} BattleAction
 */

module.exports.MoveAction = MoveAction;
module.exports.SwitchAction = SwitchAction;
