// eslint-disable-next-line no-unused-vars
const PokemonBuild = require('./data-structures/PokemonBuild');
// eslint-disable-next-line no-unused-vars
const PokemonPreview = require('./data-structures/PokemonPreview');
// eslint-disable-next-line no-unused-vars
const AbstractMatchupStrategy = require('./matchup-strategies/AbstractMatchupStrategy');
// eslint-disable-next-line no-unused-vars
const AbstractBattleStrategy = require('./battle-strategies/AbstractBattleStrategy');

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
   * Returns
   * @param {PokemonPreview[]} rivalTeam
   * @returns {number[]}
   */
  matchup(rivalTeam) {
    return this.matchupStrategy.matchup(this.team, rivalTeam);
  }

  battle(playerTeam, playerActive, rivalActive, field) {
    return this.battleStrategy.battle(playerTeam, playerActive, rivalActive, field);
  }

  switch(playerTeam, switches) {
    return this.battleStrategy.switch(playerTeam, switches);
  }
}

module.exports = Agent;
