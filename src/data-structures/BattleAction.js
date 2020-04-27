/**
 * Battle action taken.
 * @public
 */
class BattleAction {
  /**
   * Creates a battle action.
   * @param {'move' | 'switch'} type
   * @param {string} move
   * @param {number} target
   */
  constructor(type, move, target) {
    this.type = type;
    this.move = move;
    this.target = target;
  }

  /**
   * Creates a move action.
   * @param {string} move
   * @param {number} target
   * @returns {BattleAction}
   */
  static chooseMove(move, target) {
    return new BattleAction('move', move, target);
  }
}

module.exports = BattleAction;
