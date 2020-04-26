const { formatid } = require('../constants');
const { BattlePokedex, TeamValidator } = require('../simulator');

class AbstractTeamGenerator {
  constructor() {
    this.validator = new TeamValidator(formatid);
    this.speciesNumber = {};
    for (const pokemonId of Object.keys(BattlePokedex)) {
      const pokemon = BattlePokedex[pokemonId];
      this.speciesNumber[pokemon.name] = pokemon.num;
    }
  }

  async init() {}

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

  generatePokemon() {
    return null;
  }

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
