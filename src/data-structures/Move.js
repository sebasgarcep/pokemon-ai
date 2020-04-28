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
   * @param {string} id
   * @param {string} name
   * @param {PP} pp
   * @param {TargetTypes} target
   * @param {boolean} disabled
   */
  constructor(
    id,
    name,
    pp,
    target,
    disabled,
  ) {
    this.id = id;
    this.name = name;
    this.pp = pp;
    this.target = target;
    this.disabled = disabled;
  }
}

module.exports = Move;
