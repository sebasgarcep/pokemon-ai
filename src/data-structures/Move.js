/**
 * @typedef {import('./typedefs').PP} PP
 * @typedef {import('./typedefs').TargetTypes} TargetTypes
 */

/**
 * Encloses information about the current state of a move.
 */
class Move {
  /**
   * Creates a move.
   * @param {string} move
   * @param {PP} pp
   * @param {TargetTypes} target
   * @param {boolean} disabled
   */
  constructor(
    move,
    pp,
    target,
    disabled,
  ) {
    this.move = move;
    this.pp = pp;
    this.target = target;
    this.disabled = disabled;
  }
}

module.exports = Move;
