/**
 * @typedef {import('./typedefs').HP} HP
 * @typedef {import('./typedefs').Spread} Spread
 * @typedef {import('./PokemonBuild')} PokemonBuild
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
   * @param {Spread} statChanges
   */
  constructor(
    build,
    hp,
    sharedHp,
    status,
    volatiles,
    statChanges,
  ) {
    super(
      build,
      sharedHp,
      status,
      volatiles,
      statChanges
    );
    this.hp = hp;
    this.build = build;
  }
}

module.exports = PokemonState;
