const { formatid, natures } = require('../constants');
const { Dex } = require('../simulator');
const { sample } = require('../utils');
const AbstractTeamGenerator = require('./AbstractTeamGenerator');
const PokemonBuild = require('../data-structures/PokemonBuild');

class RandomTeamGenerator extends AbstractTeamGenerator {
  constructor() {
    super();
    this.sampleTeam = [];
  }

  generatePokemon() {
    if (this.sampleTeam.length === 0) { this.sampleTeam = Dex.generateTeam(formatid); }
    const pokemon = this.sampleTeam.pop();
    const [nature] = sample(Object.keys(natures));
    return new PokemonBuild(
      pokemon.name,
      pokemon.species,
      pokemon.gender,
      pokemon.moves,
      pokemon.ability,
      pokemon.evs,
      pokemon.ivs,
      pokemon.item,
      pokemon.level,
      pokemon.shiny,
      nature
    );
  }
}

module.exports = RandomTeamGenerator;
