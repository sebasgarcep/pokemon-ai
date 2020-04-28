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
   */
  constructor() {
  }
}

/**
 * @typedef {MoveAction | SwitchAction} BattleAction
 */

module.exports.MoveAction = MoveAction;
module.exports.SwitchAction = SwitchAction;
