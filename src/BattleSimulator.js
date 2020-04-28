/**
 * @typedef {import('./Agent')} Agent
 * @typedef {import('./simulator').Side} Side
 * @typedef {import('./data-structures/BattleAction').BattleAction} BattleAction
 */

const PokemonPreview = require('./data-structures/PokemonPreview');
const PokemonState = require('./data-structures/PokemonState');
const SharedPokemonState = require('./data-structures/SharedPokemonState');
const FieldState = require('./data-structures/FieldState');
const Move = require('./data-structures/Move');
const { Battle } = require('./simulator');
const { formatid } = require('./constants');
const { MoveAction, SwitchAction } = require('./data-structures/BattleAction');

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
    const win = this.battle.win.bind(this.battle);
    this.battle.win = (...args) => {
      const side = args[0];
      console.log('win', side.id);
      return win(...args);
    };
    this.battle.setPlayer('p1', { team: this.p1.team });
    this.battle.setPlayer('p2', { team: this.p2.team });
  }

  sendRequest(type, data) {
    if (type !== 'sideupdate') { console.log('Unrecognized', type, data); return; }
    const playerId = data[0];
    const rivalId = playerId === 'p1' ? 'p2' : 'p1';
    const message = data[1];
    if (message.startsWith('|error|')) { throw new Error(message.replace('|error|')); }
    const request = JSON.parse(message.replace('|request|', ''));
    process.nextTick(() => {
      if (request.teamPreview) {
        this.teamPreview(playerId, rivalId);
      } else if (request.forceSwitch) {
        this.forceSwitch(playerId, rivalId, request);
      } else if (request.active) {
        this.chooseAction(playerId, rivalId, request);
      } else if (request.wait) {
        // pass
      } else {
        console.log(request);
        throw new Error('This should never happen.');
      }
    });
  }

  /**
   * Gets preview information for player team.
   * @param {Agent} player
   */
  getPreviewTeam(player) {
    return player.team.map(item => new PokemonPreview(item.species, item.gender));
  }

  /**
   * Creates a stringified version of the matchups generated by the player.
   * @param {Agent} player
   * @param {Agent} rival
   * @returns {string}
   */
  getStringMatchup(player, rival) {
    const matchup = player.matchup(this.getPreviewTeam(rival));
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

  /**
   * Generates a matchup for this pair.
   * @param {string} playerId
   * @param {string} rivalId
   */
  teamPreview(playerId, rivalId) {
    const player = this.getAgent(playerId);
    const rival = this.getAgent(rivalId);
    const playerSide = this.getSide(playerId);

    const matchup = this.getStringMatchup(player, rival);
    playerSide.chooseTeam(matchup);

    this.commitDecisions();
  }

  /**
   * Choose an action for a player.
   * @param {string} playerId
   * @param {string} rivalId
   * @param {any} request
   */
  chooseAction(playerId, rivalId, request) {
    const player = this.getAgent(playerId);

    const playerTeam = this.getPlayerTeam(playerId);
    const playerActive = playerTeam
      .filter(item => item.active)
      .map((entity, index) => {
        if (request.active[index].maxMoves) {
          entity.maxMoves = this.getParsedMoves(request.active[index].maxMoves.maxMoves);
        } else {
          entity.maxMoves = [];
        }
        return entity;
      });
    const rivalActive = this.getRivalActivePokemon(rivalId);
    const field = this.getField();

    const actions = player.battle(
      playerTeam,
      playerActive,
      rivalActive,
      field,
    );

    this.choose(playerId, actions);
  }

  /**
   * @param {string} playerId
   * @param {string} rivalId
   * @param {any} request
   */
  forceSwitch(playerId, rivalId, request) {
    const player = this.getAgent(playerId);

    const playerTeam = this.getPlayerTeam(playerId);
    const playerActive = playerTeam.filter(item => item.active);
    const rivalActive = this.getRivalActivePokemon(rivalId);
    const field = this.getField();

    const actions = player.forceSwitch(
      playerTeam,
      playerActive,
      rivalActive,
      field,
      request.forceSwitch,
    );

    this.choose(playerId, actions);
  }

  /**
   * @param {string} id
   * @param {BattleAction[]} actions
   */
  choose(id, actions) {
    const side = this.getSide(id);

    for (const action of actions) {
      if (action instanceof MoveAction) {
        side.chooseMove(action.move.id, action.target);
      }
      if (action instanceof SwitchAction) {
        side.chooseSwitch(action.outgoing.sharedBuild.name);
      }
    }

    this.commitDecisions();
  }

  commitDecisions() {
    if (this.battle.allChoicesDone()) { this.battle.commitDecisions(); }
  }

  getHealthValues(input) {
    const [current, max] = input.split('/').map(item => Number.parseInt(item, 10));
    return { current, max };
  }

  /**
   * Obtain current player's team.
   * @param {string} playerId
   * @returns {PokemonState[]}
   */
  getPlayerTeam(playerId) {
    const player = this.getAgent(playerId);
    const playerSide = this.getSide(playerId);
    return playerSide.pokemon.map(entity => {
      const { secret, shared } = entity.getHealth();
      return new PokemonState(
        player.getPokemon(entity.speciesid),
        this.getHealthValues(secret),
        this.getHealthValues(shared),
        entity.statusData,
        entity.volatiles,
        entity.boosts,
        entity.isActive,
        this.getParsedMoves(entity.moveSlots),
        entity.canDynamax,
        this.getParsedMoves(entity.moveSlots), // FIXME: what should we do about this ?
      );
    });
  }

  /**
   * Transform moves to interface.
   * @param {any[]} moves
   * @returns {Move[]}
   */
  getParsedMoves(moves) {
    return moves.map(item => {
      return new Move(
        item.id,
        item.name,
        { current: item.pp, max: item.maxpp },
        item.target,
        item.disabled,
      );
    });
  }

  /**
   * Obtain current rival's active pokemon.
   * @param {string} rivalId
   * @returns {SharedPokemonState[]}
   */
  getRivalActivePokemon(rivalId) {
    const rival = this.getAgent(rivalId);
    const rivalSide = this.getSide(rivalId);
    return rivalSide.active.filter(entity => {
      const pokemon = rival.getPokemon(entity.speciesid);
      const { shared } = entity.getHealth();
      return new SharedPokemonState(
        pokemon.getShared(),
        this.getHealthValues(shared),
        entity.statusData,
        entity.volatiles,
        entity.boosts,
      );
    });
  }

  getField() {
    return new FieldState(
      this.battle.field.terrain,
      this.battle.field.weather,
      this.battle.field.pseudoWeather,
    );
  }
}

module.exports = BattleSimulator;