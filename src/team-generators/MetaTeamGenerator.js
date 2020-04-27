const bent = require('bent')('json');
const fs = require('fs-extra');
const path = require('path');
const AbstractTeamGenerator = require('./AbstractTeamGenerator');
const PokemonBuild = require('../data-structures/PokemonBuild');
const { getSpeciesNumber, getSpeciesGender, sample } = require('../utils');

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
      // @ts-ignore
      this.data = JSON.parse(contents);
    } else {
      this.data = await bent(this.collectionSource);
      await fs.createFile(this.datafilePath);
      fs.writeFile(this.datafilePath, JSON.stringify(this.data));
    }
  }

  /* FIXME: We should use the team to favor some Pokemon over other. */
  generatePokemon() {
    const [details] = sample(this.data, { weights: 'raw_count' });
    const name = details.name;
    const species = this.pickSpecies(details.name);
    const gender = this.pickGender(species);
    const moves = this.pickMoves(details.moves);
    const ability = this.pickAbility(details.abilities);
    const { nature, evs } = this.pickNatureEVs(details.spreads);
    const item = this.pickItem(details.items);
    return new PokemonBuild(
      name,
      species,
      gender,
      moves,
      ability,
      evs,
      { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }, // FIXME: pick viable IVs for 0 atk, 0 spe (Trick Room).
      item,
      50,
      false,
      nature
    );
  }

  pickSpecies(name) {
    const gmaxName = name + '-Gmax';
    if (getSpeciesNumber(gmaxName) !== null) { return gmaxName; }
    return name;
  }

  pickGender(species) {
    const speciesGender = getSpeciesGender(species);
    return speciesGender || sample(['M', 'F'])[0];
  }

  pickMoves(moves) {
    const collection = moves.filter(item => item.move.trim() !== 'Other' && item.move.trim() !== 'Nothing');
    const selection = sample(collection, { picks: 4, weights: 'percent' });
    return selection.map(item => item.move);
  }

  pickAbility(abilities) {
    const [item] = sample(abilities, { weights: 'percent' });
    return item.ability;
  }

  pickNatureEVs(spreads) {
    const [item] = sample(spreads, { weights: 'percent' });
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

  pickItem(items) {
    const collection = items.filter(item => item.item.trim() !== 'Other');
    const [item] = sample(collection, { weights: 'percent' });
    return item.item;
  }
}

module.exports = MetaTeamGenerator;
