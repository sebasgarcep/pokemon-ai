/* eslint-disable no-unused-vars */

/**
 * @typedef {import('../data-structures/PokemonBuild')} PokemonBuild
 */

const { formatid } = require('../constants');
const { BattlePokedex, TeamValidator } = require('../simulator');

/**
 * Creates a Pokemon team.
 * @public
 */
class AbstractTeamGenerator {
  /**
   * Creates a Team Generator.
   */
  constructor() {
    this.validator = new TeamValidator(formatid);
    /**
     * @type {Object<string, number>}
     */
    this.speciesNumber = {};
    for (const pokemonId of Object.keys(BattlePokedex)) {
      const pokemon = BattlePokedex[pokemonId];
      this.speciesNumber[pokemon.name] = pokemon.num;
    }
  }

  /**
   * Prepares the Team Generator if it requires external input.
   */
  async init() {}

  /**
   * Generated a viable Pokemon Team.
   * @returns {PokemonBuild[]}
   */
  generateTeam() {
    let team;
    do {
      team = [];
      while(team.length < 6) {
        const pokemon = this.generatePokemon(team);
        if (pokemon === null) { throw new Error('This team cannot be completed.'); }
        if (this.validator.validateSet(pokemon) !== null) { continue; }
        if (this.isCompatible(team, pokemon)) { team.push(pokemon); }
      }
    } while(this.validator.validateTeam(team) !== null);
    return team;
  }

  /**
   * Generate a single Pokemon.
   * @abstract
   * @param {PokemonBuild[]} team
   * @returns {PokemonBuild}
   */
  generatePokemon(team) {
    throw new Error('Not implemented.');
  }

  /**
   * Determines whether a pokemon is compatible with the rest of the team,
   * taking into account the unique species clause and unique items clause.
   * @param {PokemonBuild[]} team
   * @param {PokemonBuild} pokemon
   * @returns {boolean}
   */
  isCompatible(team, pokemon) {
    for (const peer of team) {
      if (
        this.speciesNumber[peer.species] === this.speciesNumber[pokemon.species] ||
        peer.item === pokemon.item
      ) {
        return false;
      }
    }
    return true;
  }
}

module.exports = AbstractTeamGenerator;
