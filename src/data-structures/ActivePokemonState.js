/**
 * @typedef {import('./typedefs').HP} HP
 * @typedef {import('./typedefs').Spread} Spread
 * @typedef {import('./PokemonBuild')} PokemonBuild
 * @typedef {import('./Move')} Move
 */

const PokemonState = require('./PokemonState');

/**
 * Encloses the pokemon state plus the possible choices that a Pokemon can take.
 */
class ActivePokemonState extends PokemonState {
  /**
   * Creates a Pokemon state.
   * @param {PokemonBuild} build
   * @param {HP} hp
   * @param {HP} sharedHp
   * @param {any} status FIXME: missing signature
   * @param {any} volatiles FIXME: missing signature
   * @param {Spread} statChanges
   * @param {Move[]} moves
   * @param {boolean} canDynamax
   * @param {Move[]} maxMoves
   */
  constructor(
    build,
    hp,
    sharedHp,
    status,
    volatiles,
    statChanges,
    moves,
    canDynamax,
    maxMoves
  ) {
    super(
      build,
      hp,
      sharedHp,
      status,
      volatiles,
      statChanges,
    );
    this.moves = moves;
    this.canDynamax = canDynamax;
    this.maxMoves = maxMoves;
  }
}

module.exports = ActivePokemonState;
