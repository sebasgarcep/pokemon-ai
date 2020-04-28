/**
 * @typedef {import('./data-structures/PokemonBuild')} PokemonBuild
 * @typedef {import('./data-structures/PokemonPreview')} PokemonPreview
 * @typedef {import('./data-structures/PokemonState')} PokemonState
 * @typedef {import('./data-structures/ActivePokemonState')} ActivePokemonState
 * @typedef {import('./data-structures/SharedPokemonState')} SharedPokemonState
 * @typedef {import('./data-structures/FieldState')} FieldState
 * @typedef {import('./matchup-strategies/AbstractMatchupStrategy')} AbstractMatchupStrategy
 * @typedef {import('./battle-strategies/AbstractBattleStrategy')} AbstractBattleStrategy
 */

const { Dex } = require('./simulator');

/**
 * Agent capable of decision-making.
 * @public
 */
class Agent {
  /**
   * Creates an Agent.
   * @param {PokemonBuild[]} team
   * @param {AbstractMatchupStrategy} matchupStrategy
   * @param {AbstractBattleStrategy} battleStrategy
   */
  constructor(team, matchupStrategy, battleStrategy) {
    this.team = team;
    this.matchupStrategy = matchupStrategy;
    this.battleStrategy = battleStrategy;
  }

  /**
   * Returns a matchup for a given rival team.
   * @param {PokemonPreview[]} rivalTeam
   * @returns {number[]}
   */
  matchup(rivalTeam) {
    return this.matchupStrategy.matchup(this.team, rivalTeam);
  }

  /**
   * Returns a choice for each active pokemon.
   * @param {PokemonState[]} playerTeam
   * @param {ActivePokemonState[]} playerActive
   * @param {SharedPokemonState[]} rivalActive
   * @param {FieldState} field
   */
  battle(playerTeam, playerActive, rivalActive, field) {
    return this.battleStrategy.battle(playerTeam, playerActive, rivalActive, field);
  }

  /**
   * Returns a choice for each active pokemon.
   * @param {PokemonState[]} playerTeam
   * @param {ActivePokemonState[]} playerActive
   * @param {SharedPokemonState[]} rivalActive
   * @param {FieldState} field
   * @param {boolean[]} switches
   */
  forceSwitch(playerTeam, playerActive, rivalActive, field, switches) {
    return this.battleStrategy.forceSwitch(playerTeam, playerActive, rivalActive, field, switches);
  }

  /**
   * Returns a Pokemon using its species to find it.
   * @param {string} species
   * @returns {PokemonBuild}
   */
  getPokemon(species) {
    const speciesId = Dex.getId(species);
    return this.team.find((entity) => {
      const entitySpeciesId = Dex.getId(entity.species);
      return entitySpeciesId === speciesId;
    });
  }
}

module.exports = Agent;
