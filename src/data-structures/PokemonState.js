/**
 * @typedef {import('./typedefs').HP} HP
 * @typedef {import('./typedefs').Spread} Spread
 * @typedef {import('./typedefs').StatChanges} StatChanges
 * @typedef {import('./PokemonBuild')} PokemonBuild
 * @typedef {import('./Move')} Move
 */

const SharedPokemonState = require('./SharedPokemonState');

/**
 * Current pokemon state.
 */
class PokemonState extends SharedPokemonState {
  /**
   * Creates a Pokemon state.
   * @param {PokemonBuild} build
   * @param {HP} hp
   * @param {HP} sharedHp
   * @param {any} status FIXME: missing signature
   * @param {any} volatiles FIXME: missing signature
   * @param {StatChanges} statChanges
   * @param {boolean} active
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
    active,
    moves,
    canDynamax,
    maxMoves,
  ) {
    super(
      build.getShared(),
      sharedHp,
      status,
      volatiles,
      statChanges,
    );
    this.hp = hp;
    this.build = build;
    this.active = active;
    this.moves = moves;
    this.canDynamax = canDynamax;
    this.maxMoves = maxMoves;
  }

  getShared() {
    return new SharedPokemonState(
      this.sharedBuild,
      this.sharedHp,
      this.status,
      this.volatiles,
      this.statChanges,
    );
  }
}

module.exports = PokemonState;
