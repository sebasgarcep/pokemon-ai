const { formatid } = require('../constants');
const { Dex } = require('../simulator');
const AbstractTeamGenerator = require('./AbstractTeamGenerator');

class RandomTeamGenerator extends AbstractTeamGenerator {
  constructor() {
    super();
    this.sampleTeam = [];
  }

  generatePokemon() {
    if (this.sampleTeam.length === 0) { this.sampleTeam = Dex.generateTeam(formatid); }
    return this.sampleTeam.pop();
  }
}

module.exports = RandomTeamGenerator;
