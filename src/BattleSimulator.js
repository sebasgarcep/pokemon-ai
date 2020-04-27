// eslint-disable-next-line no-unused-vars
const Agent = require('./Agent');
// eslint-disable-next-line no-unused-vars
const { Battle, Side } = require('./simulator');
const { formatid } = require('./constants');

/**
 * Battle simulator.
 * @public
 */
class BattleSimulator {
  /**
   * Creates a Battle Simulator.
   * @param {Agent} p1
   * @param {Agent} p2
   */
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.options = {
      debug: true,
      formatid,
      send: (type, data) => {
        if (typeof data === 'string') { data = data.split('\n').filter(line => !!line); }
        this.sendRequest(type, data);
      }
    };
  }

  start() {
    this.battle = new Battle(this.options);
    this.battle.setPlayer('p1', { team: this.p1.team });
    this.battle.setPlayer('p2', { team: this.p2.team });
  }

  /**
   * Gets preview information for player team.
   * @param {Agent} player
   */
  getPreviewTeam(player) {
    return player.team.map(item => ({
      species: item.species.replace('-Gmax', ''),
      gender: item.gender
    }));
  }

  getStringMatchup(matchup) {
    return matchup.slice(0, 4).join('');
  }

  /**
   * Gets agent object associated with id.
   * @param {string} id
   * @returns {Agent}
   */
  getAgent(id) {
    return this[id];
  }

  /**
   * Returns side object associated with id.
   * @param {string} id
   * @returns {Side}
   */
  getSide(id) {
    return this.battle.getSide(id);
  }

  sendRequest(type, data) {
    if (type !== 'sideupdate') { console.log('Unrecognized', type, data); return; }
    const playerId = data[0];
    const rivalId = playerId === 'p1' ? 'p2' : 'p1';
    const message = data[1];
    if (message.startsWith('|error|')) { throw new Error(message.replace('|error|')); }
    const player = this.getAgent(playerId);
    const rival = this.getAgent(rivalId);
    const playerSide = this.getSide(playerId);
    const rivalSide = this.getSide(rivalId);
    const request = JSON.parse(message.replace('|request|', ''));
    process.nextTick(() => {
      if (request.teamPreview) {
        const matchup = this.getStringMatchup(player.matchup(this.getPreviewTeam(rival)));
        playerSide.chooseTeam(matchup);
        this.commitDecisions();
      } else if (request.forceSwitch) {
        // pass
        const actions = player.switch(
          request.side.pokemon,
          request.forceSwitch,
        );
      } else if (request.wait) {
        // pass
      } else if (request.active) {
        const actions = player.battle(
          request.side.pokemon,
          request.active.map((item, index) => {
            return { ...item, pokemon: this.getSecretPokemonDetails(playerSide.active[index]) };
          }),
          rivalSide.active.map((item) => {
            return this.getSharedPokemonDetails(item);
          }),
          this.battle.field,
        );
        for (const action of actions) {
          if (action.type === 'move') {
            playerSide.chooseMove(action.move, action.target);
          }
        }
        this.commitDecisions();
      } else {
        console.log(request);
        throw new Error('This should never happen.');
      }
    });
  }

  commitDecisions() {
    if (this.battle.allChoicesDone()) { this.battle.commitDecisions(); }
  }

  getHealthValues(input) {
    const [current, max] = input.split('/').map(item => Number.parseInt(item, 10));
    return { current, max };
  }

  getSharedPokemonDetails(pokemon) {
    const sharedHealth = this.getHealthValues(pokemon.getHealth().shared);
    return {
      forme: pokemon.forme,
      species: pokemon.speciesid,
      name: pokemon.name,
      id: pokemon.id,
      level: pokemon.level,
      gender: pokemon.gender,
      pokeball: pokemon.pokeball,
      status: pokemon.status,
      statusData: pokemon.statusData,
      volatiles: pokemon.volatiles,
      sharedHealth,
    };
  }

  getSecretPokemonDetails(pokemon) {
    const shared = this.getSharedPokemonDetails(pokemon);
    const health = this.getHealthValues(pokemon.getHealth().secret);
    return {
      ...shared,
      health,
      item: pokemon.item,
    };
  }
}

module.exports = BattleSimulator;
