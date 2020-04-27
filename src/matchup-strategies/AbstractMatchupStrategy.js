/* eslint-disable no-unused-vars */

/**
 * @typedef {import('../data-structures/PokemonBuild')} PokemonBuild
 * @typedef {import('../data-structures/PokemonPreview')} PokemonPreview
 */

/**
 * Abstract interface for Team Preview Matchup generation.
 * @public
 */
class AbstractMatchupStrategy {
  /**
   * Creates a matchup.
   * @abstract
   * @param {PokemonBuild[]} playerTeam
   * @param {PokemonPreview[]} rivalPreview
   * @returns {number[]}
   */
  matchup(playerTeam, rivalPreview) {
    throw new Error('Not implemented.');
  }
}

module.exports = AbstractMatchupStrategy;
