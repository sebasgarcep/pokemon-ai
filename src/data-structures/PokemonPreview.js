/**
 * Holds preview information visible to the opposing user during Team Preview.
 * @public
 */
class PokemonPreview {
  /**
   *  Creates a Pokemon Preview.
   *  @param {string} baseSpecies
   *  @param {string} gender
   */
  constructor(baseSpecies, gender) {
    this.baseSpecies = baseSpecies;
    this.gender = gender;
  }
}

module.exports = PokemonPreview;
