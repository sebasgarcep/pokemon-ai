const { getBaseSpecies } = require('../utils');

/**
 * Holds preview information visible to the opposing user during Team Preview.
 * @public
 */
class PokemonPreview {
  /**
   *  Creates a Pokemon Preview.
   *  @param {string} species
   *  @param {string} gender
   */
  constructor(species, gender) {
    this.baseSpecies = getBaseSpecies(species);
    this.gender = gender;
  }
}

module.exports = PokemonPreview;
