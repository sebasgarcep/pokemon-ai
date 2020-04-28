/**
 * @typedef {import('./typedefs').HP} HP
 * @typedef {import('./typedefs').Spread} Spread
 * @typedef {import('./SharedPokemonBuild')} SharedPokemonBuild
 */

/**
 * Encloses the publicly avaible information to both users about a Pokemon.
 */
class SharedPokemonState {
  /**
   * Creates a shared pokemon state.
   * @param {SharedPokemonBuild} sharedBuild
   * @param {HP} sharedHp
   * @param {any} status FIXME: missing signature
   * @param {any} volatiles FIXME: missing signature
   * @param {Spread} statChanges
   */
  constructor(
    sharedBuild,
    sharedHp,
    status,
    volatiles,
    statChanges
  ) {
    this.sharedBuild = sharedBuild;
    this.sharedHp = sharedHp;
    this.status = status;
    this.volatiles = volatiles;
    this.statChanges = statChanges;
  }
}

module.exports = SharedPokemonState;
