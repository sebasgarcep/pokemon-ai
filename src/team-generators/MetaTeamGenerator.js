const bent = require('bent')('json');
const fs = require('fs-extra');
const path = require('path');
const AbstractTeamGenerator = require('./AbstractTeamGenerator');
const { weightedRandomPicks } = require('../utils');

class MetaTeamGenerator extends AbstractTeamGenerator {
  constructor() {
    super();
    this.datafilePath = path.join(__dirname, '..', '..', 'data', 'meta.json');
    this.collectionSource = 'https://www.pikalytics.com/api/p/2020-03/ss-1760';
    this.data = null;
  }

  async init({ local = true } = {}) {
    const fileExists = await fs.pathExists(this.datafilePath);
    if (local && fileExists) {
      const contents = await fs.readFile(this.datafilePath);
      this.data = JSON.parse(contents);
    } else {
      this.data = await bent(this.collectionSource);
      await fs.createFile(this.datafilePath);
      fs.writeFile(this.datafilePath, JSON.stringify(this.data));
    }
  }

  /* FIXME: We should use the team to favor some Pokemon over other. */
  // eslint-disable-next-line no-unused-vars
  generatePokemon(_team) {
    const [details] = weightedRandomPicks(this.data, { weights: 'raw_count' });
    const pokemon = {
      name: '',
      species: '',
      gender: '',
      moves: ['', '', '', ''],
      ability: '',
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }, // FIXME: This IV spread does not work for Trick Room, 0 Atk Pokemon
      item: '',
      level: 50,
      shiny: false,
      nature: ''
    };
    pokemon.name = details.name;
    pokemon.species = this.pickSpecies(details);
    pokemon.moves = this.pickMoves(details);
    pokemon.ability = this.pickAbility(details);
    const { nature, evs } = this.pickNatureEVs(details);
    pokemon.evs = evs;
    pokemon.item = this.pickItem(details);
    pokemon.nature = nature;
    return pokemon;
  }

  pickSpecies(details) {
    const name = details.name;
    if (this.speciesNumber[name + '-Gmax']) { return name + '-Gmax'; }
    return name;
  }

  pickMoves(details) {
    const collection = details.moves.filter(item => item.move.trim() !== 'Other' && item.move.trim() !== 'Nothing');
    const selection = weightedRandomPicks(collection, { picks: 4, weights: 'percent' });
    return selection.map(item => item.move);
  }

  pickAbility(details) {
    const [item] = weightedRandomPicks(details.abilities, { weights: 'percent' });
    return item.ability;
  }

  pickNatureEVs(details) {
    const [item] = weightedRandomPicks(details.spreads, { weights: 'percent' });
    const spread = item.ev.split('/').map(value => Number.parseInt(value, 10));
    const evs = {
      hp: spread[0],
      atk: spread[1],
      def: spread[2],
      spa: spread[3],
      spd: spread[4],
      spe: spread[5]
    };
    return { nature: item.nature, evs };
  }

  pickItem(details) {
    const collection = details.items.filter(item => item.item.trim() !== 'Other');
    const [item] = weightedRandomPicks(collection, { weights: 'percent' });
    return item.item;
  }
}

module.exports = MetaTeamGenerator;
