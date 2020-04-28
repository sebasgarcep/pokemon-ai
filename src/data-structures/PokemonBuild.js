/**
 * @typedef {import('./typedefs').Spread} Spread
 */

const SharedPokemonBuild = require('./SharedPokemonBuild');

/**
 * Details a Pokemon build (e.g. EVs, nature, items, etc.)
 * @public
 */
class PokemonBuild extends SharedPokemonBuild {
  /**
   * Creates a Pokemon Build.
   * @param {string} name
   * @param {string} species
   * @param {string} gender
   * @param {string[]} moves
   * @param {string} ability
   * @param {Spread} evs
   * @param {Spread} ivs
   * @param {string} item
   * @param {number} level
   * @param {boolean} shiny
   * @param {string} nature
   */
  constructor(
    name,
    species,
    gender,
    moves,
    ability,
    evs,
    ivs,
    item,
    level,
    shiny,
    nature
  ) {
    super(
      name,
      species,
      gender,
      level,
      shiny,
    );
    this.moves = moves;
    this.ability = ability;
    this.evs = evs;
    this.ivs = ivs;
    this.item = item;
    this.nature = nature;
  }
}

module.exports = PokemonBuild;
