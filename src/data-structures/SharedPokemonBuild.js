const { getBaseSpecies } = require('../utils');

/**
 * Encloses the build information visible to all players.
 */
class SharedPokemonBuild {
  /**
   * Creates a shared pokemon build.
   * @param {string} name
   * @param {string} species
   * @param {string} gender
   * @param {number} level
   * @param {boolean} shiny
   */
  constructor(
    name,
    species,
    gender,
    level,
    shiny,
  ) {
    this.name = name;
    this.baseSpecies = getBaseSpecies(species);
    this.species = species;
    this.gender = gender;
    this.level = level;
    this.shiny = shiny;
  }
}

module.exports = SharedPokemonBuild;
