/**
 * @typedef {Object} Spread
 * @property {number} hp
 * @property {number} atk
 * @property {number} def
 * @property {number} spa
 * @property {number} spd
 * @property {number} spe
 */

const { getBaseSpecies } = require('../utils');

/**
 * Details a Pokemon build (e.g. EVs, nature, items, etc.)
 * @public
 */
class PokemonBuild {
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
  constructor(name, species, gender, moves, ability, evs, ivs, item, level, shiny, nature) {
    this.name = name;
    this.baseSpecies = getBaseSpecies(species);
    this.species = species;
    this.gender = gender;
    this.moves = moves;
    this.ability = ability;
    this.evs = evs;
    this.ivs = ivs;
    this.item = item;
    this.level = level;
    this.shiny = shiny;
    this.nature = nature;
  }
}

module.exports = PokemonBuild;
