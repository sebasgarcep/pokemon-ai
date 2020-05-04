/**
 * FIXME: keep like an event log that details all events that happen and
 * use a hook to report them to players. This will be useful when building
 * an information model.
 */

/**
 * FIXME: perhaps a more centralized event listener will be better for the architecture.
 */

const seedrandom = require('seedrandom');
const range = require('lodash.range');
const { fromJS } = require('immutable');
const PokemonState = require('./PokemonState');
const moves = require('../data/moves');
const getBoostedValue = require('../utils/getBoostedValue');

/**
 * FIXME: document state structure
 */
const initalState = fromJS({
  phase: 'setplayers',
  turn: 0,
  players: {},
  field: null,
  order: [],
  seed: null,
});

class Battle {
  constructor({ hooks = {}, state = initalState, format = 'doubles' } = {}) {
    // attributes
    this.hooks = hooks;
    this.state = state;
    if (format === 'doubles') {
      this.format = { id: format, active: 2, total: 4 };
    } else if (format === 'singles') {
      this.format = { id: format, active: 1, total: 3 };
    } else {
      throw new Error('Format must be either doubles or singles.');
    }

    // methods
    for (const key in Object.keys(this)) {
      if (typeof this[key] === 'function') {
        this[key] = this[key].bind(this);
      }
    }
  }

  setPlayer(id, builds, onTeamPreview, onMove, onForceSwitch, onEnd) {
    if (this.getIds().length >= 2) { throw new Error('Cannot set more than two players.'); }

    const opts = {
      onTeamPreview: (...args) => onTeamPreview(this.select.bind(this, id), ...args),
      onMove: (...args) => onMove(this.move.bind(this, id), this.switch.bind(this, id), ...args),
      onForceSwitch: (...args) => onForceSwitch(this.switch.bind(this, id), ...args),
      onEnd,
    };

    this.hooks[id] = opts;

    this.setPlayerState(id, [], {
      id,
      builds,
      active: null,
      passive: null,
      actions: null,
      forcedSwitches: null,
    });
  }

  seedRandom() {
    const rng = seedrandom('test_seed', { state: true });
    const seed = rng.state();
    this.setState(['seed'], seed);
  }

  getRandom(min, max) {
    const seed = this.getState(['seed']);
    if (seed === null) { throw new Error('Seed has not been initialized,'); }
    const rng = seedrandom('', { state:seed });
    const value = rng();
    const range = max - min + 1;
    this.setState(['seed'], rng.state());
    return Math.floor(range * value) + min;
  }

  getIds() {
    return Object.keys(this.hooks);
  }

  /**
   * Gets the rival's id for a given player id.
   * @param {string} id
   * @return {string}
   */
  getRivalId(id) {
    return this.getIds().find(item => item !== id);
  }

  getTurn() {
    return this.getState(['turn']);
  }

  /**
   * Gets data deep from a player's state subtree.
   * @param {string} id
   * @param {(string | number)[]} keys
   */
  getPlayerState(id, keys) {
    return this.getState(['players', id, ...keys]);
  }

  /**
   * Sets data deep in a player's state subtree.
   * @param {string} id
   * @param {(string | number)[]} keys
   * @param {any} data
   */
  setPlayerState(id, keys, data) {
    return this.setState(['players', id, ...keys], data);
  }

  /**
   * Gets data deep in the state tree
   * @param  {(string | number)[]} keys
   */
  getState(keys) {
    const data = this.state.getIn(keys);
    if (data && data.toJS) { return data.toJS(); }
    return data;
  }

  /**
   * Sets data deep in the state tree.
   * @param {(string | number)[]} keys
   * @param {any} data
   */
  setState(keys, data) {
    this.state = this.state.setIn(keys, fromJS(data));
    return this.state;
  }

  /**
   * Sets a battle's current phase.
   * @param {'setplayers' | 'teampreview' | 'choice' | 'run' | 'switch' | 'end'} phase
   */
  setPhase(phase) {
    return this.setState(['phase'], phase);
  }

  /**
   * Gets a battle's current phase.
   * @returns {'setplayers' | 'teampreview' | 'choice' | 'run' | 'switch' | 'end'}
   */
  getPhase() {
    return this.getState(['phase']);
  }

  start() {
    const ids = this.getIds();
    if (ids.length < 2) { throw new Error('Both players must be set for the battle to begin.'); }
    this.setPhase('teampreview');
    for (const playerId of ids) {
      const playerTeam = this.getPlayerState(playerId, ['builds']);
      const rivalId = this.getRivalId(playerId);
      const rivalTeam = this.getPlayerState(rivalId, ['builds'])
        .map(item => ({ species: item.species, gender: item.gender }));
      this.hooks[playerId].onTeamPreview(playerTeam, rivalTeam);
    }
  }

  select(id, choices) {
    choices = choices.filter(item => 1 <= item && item <= 6);
    if (choices.length !== this.format.total) {
      throw new Error(`You must select exactly ${this.format.total} pokemon.`);
    }
    const builds = this.getPlayerState(id, ['builds']);
    const pokemon = choices.map(index => PokemonState.create(builds[index - 1]));
    const active = pokemon.slice(0, this.format.active);
    const passive = [
      ...pokemon.slice(this.format.active, this.format.total),
      ...range(this.format.active).map(() => null),
    ];
    this.setPlayerState(id, ['active'], active);
    this.setPlayerState(id, ['passive'], passive);
    this.setPlayerState(id, ['actions'], active.map(() => null));
    this.setPlayerState(id, ['forcedSwitches'], []);
    // Check for Team Preview end
    const ids = this.getIds();
    if (ids.every(playerId => !!this.getPlayerState(playerId, ['active']))) {
      this.beginBattle();
    }
  }

  /**
   * Initializes and begins current battle.
   */
  beginBattle() {
    this.seedRandom();
    this.initializeField();
    this.triggerOnMove();
  }

  initializeField() {
    const global = {};
    const sides = this.getIds()
      .reduce((item, id) => {
        item[id] = {};
        return item;
      }, {});
    this.setState(['field'], {
      global,
      sides,
    });
  }

  /**
   * Triggers onMove hooks.
   */
  triggerOnMove() {
    this.setPhase('choice');
    this.setState(['turn'], this.getTurn() + 1);
    const ids = this.getIds();
    for (const playerId of ids) {
      const rivalId = this.getRivalId(playerId);
      const playerActive = this.getPlayerState(playerId, ['active']);
      const playerPassive = this.getPlayerState(playerId, ['passive']);
      const rivalActive = this.getPlayerState(rivalId, ['active'])
        .map(item => ({ ...item, hp: Math.ceil( item.hp * 48 / item.maxhp ), maxhp: 48 }));
      const rivalPassive = []; // FIXME: Only show Pokemon that have come out, otherwise set to null or something else.
      const field = this.getState(['field']);
      this.hooks[playerId].onMove(playerActive, playerPassive, rivalActive, rivalPassive, field);
    }
  }

  /**
   * Sets a move action.
   * @param {string} id
   * @param {number} activePos
   * @param {number} movePos
   * @param {number} targetPos - 0 = No Target, Positive = Foe Target, Negative = Ally Target
   */
  // FIXME: missing more checks
  move(id, activePos, movePos, targetPos) {
    if (
      activePos < 1
      || activePos > this.format.active
      || movePos < 1
      || movePos > 4
      || targetPos < -this.format.active
      || targetPos > this.format.active
    ) {
      throw new Error('Invalid move input.');
    }
    // Move is Valid checks
    const moveState = this.getMove(id, 'active', activePos, movePos);
    if (!moveState) { throw new Error('There is no move in this slot.'); }
    if (moveState.disabled) { throw new Error('This move has been disabled.'); }
    if (moveState.pp === 0) { throw new Error('There is no PP left in this move.'); }
    // FIXME: Add Target types valid check
    if (moveState.target === 'normal') {
      if (targetPos <= 0) { throw new Error('You must choose a foe\'s position.'); }
    } else {
      throw new Error(`Unrecognized target type: ${moveState.target}.`);
    }
    this.setAction(id, activePos, { type: 'move', move: movePos, target: targetPos });
  }

  // FIXME: missing more checks
  switch(id, activePos, passivePos) {
    if (
      activePos < 1
      || activePos > this.format.active
      || passivePos < 1
      || passivePos > this.format.total) {
      throw new Error('Invalid switch input.');
    }
    const passive = this.getPokemon(id, 'passive', passivePos);
    if (!passive) { throw new Error('There is not Pokemon in this slot.'); }
    if (passive.hp === 0) { throw new Error('Cannot switch into a fainted Pokemon.'); }
    const phase = this.getPhase();
    if (phase === 'choice') {
      this.setAction(id, activePos, { type: 'switch', passive: passivePos });
    } else if (phase === 'run' || phase === 'switch') {
      let forcedSwitches = this.getPlayerState(id, ['forcedSwitches']);
      if (!forcedSwitches.includes(activePos)) { throw new Error('This Pokemon cannot be switched out.'); }
      forcedSwitches = forcedSwitches.filter(item => item !== activePos);
      this.executeSwitch(id, activePos, passivePos);
      this.setPlayerState(id, ['forcedSwitches'], forcedSwitches);
      if (phase === 'switch') { this.finishForcedSwitches(); }
    }
  }

  clone(opts) {
    return new Battle({
      state: this.state,
      format: this.format.id,
      ...opts,
    });
  }

  /**
   * Gets a Pokemon from a certain slot.
   * @param {string} id
   * @param {'active' | 'passive'} location
   * @param {number} pos
   */
  getPokemon(id, location, pos) {
    return this.getPlayerState(id, [location, pos - 1]);
  }

  /**
   * Gets a Pokemon from a certain slot.
   * @param {string} id
   * @param {'active' | 'passive'} location
   * @param {number} pos
   */
  setPokemon(id, location, pos, pokemon) {
    return this.setPlayerState(id, [location, pos - 1], pokemon);
  }

  /**
   * Returns a move at a particular location.
   * @param {string} id
   * @param {'active' | 'passive'} location
   * @param {number} pokemonPos
   * @param {number} movePos
   */
  getMove(id, location, pokemonPos, movePos) {
    return this.getPlayerState(id, [location, pokemonPos - 1, 'moves', movePos - 1]);
  }

  /**
   * Gets the action associated with a player and an active position.
   * @param {string} id
   * @param {number} pos
   */
  getAction(id, pos) {
    return this.getPlayerState(id, ['actions', pos - 1]);
  }

  setAction(id, pos, action) {
    this.setPlayerState(id, ['actions', pos - 1], action);
    this.commit();
  }

  clearAction(id, pos) {
    return this.setPlayerState(id, ['actions', pos - 1], null);
  }

  /**
   * Gets all active positions.
   * @return {{ id: string, pos: number }[]}
   */
  getActiveIds() {
    const ids = this.getIds();
    const activeIds = [];
    for (const id of ids) {
      for (const pos of range(1, this.format.active + 1)) {
        activeIds.push({ id, pos });
      }
    }
    return activeIds;
  }

  commit() {
    // Check if commands are complete
    if (this.getSlotsMissingAction().length > 0) { return; }
    // Execute commands
    this.setPhase('run');
    this.runActions();
  }

  runActions() {
    this.performPassActions();
    this.performSwitchActions();
    this.performMoveActions();
    this.performForcedSwitches();
  }

  performPassActions() {
    const activeIds = this.getActiveIds();
    for (const { id, pos } of activeIds) {
      const action = this.getAction(id, pos);
      if (action.type !== 'pass') { continue; }
      // Ignore Pass actions
      this.clearAction(id, pos);
    }
  }

  performSwitchActions() {
    const activeIds = this.getActiveIds();
    for (const { id, pos } of activeIds) {
      const action = this.getAction(id, pos);
      if (action.type !== 'switch') { continue; }
      this.executeSwitch(id, pos, action.passive);
      this.clearAction(id, pos);
    }
  }

  executeSwitch(id, activePos, passivePos) {
    const active = this.getPokemon(id, 'active', activePos);
    const passive = this.getPokemon(id, 'passive', passivePos);
    // FIXME: do some cleanup like clear volatiles, boosts, etc.
    this.setPokemon(id, 'active', activePos, passive);
    this.setPokemon(id, 'passive', passivePos, active);
  }

  getFirstEmptyPassivePosition(id) {
    for (const pos of range(1, this.format.total)) {
      if (this.getPlayerState(id, ['passive', pos - 1]) === null) {
        return pos;
      }
    }
    throw new Error('This should not happen');
  }

  /**
   *
   * @param {string} id
   * @param {number} pos
   * @param {'atk' | 'def' | 'spa' | 'spd' | 'spe' | 'accuracy' | 'evasion'} key
   */
  getBoost(id, pos, key) {
    return this.getPlayerState(id, ['active', pos - 1, 'boosts', key]);
  }

  /**
   *
   * @param {string} id
   * @param {number} pos
   * @param {'atk' | 'def' | 'spa' | 'spd' | 'spe'} key
   */
  getBoostedStat(id, pos, key) {
    const stat = this.getPlayerState(id, ['active', pos - 1, 'stats', key]);
    const boost = this.getBoost(id, pos, key);
    return getBoostedValue(key, boost, stat);
  }

  performMoveActions() {
    while (this.getSlotsContainingAction().length > 0) {
      this.setOrder();
      const order = this.getState(['order']);
      if (order.length === 0) { break; }
      const [{ id, pos }] = order;
      this.executeMoveAction(id, pos);
    }
  }

  performForcedSwitches() {
    this.setPhase('switch');
    for (const id of this.getIds()) {
      const active = this.getPlayerState(id, ['active']);
      const nullPositions = [];
      for (let pos = 1; pos <= this.format.active; pos += 1) {
        if (active[pos - 1] === null) {
          nullPositions.push(pos);
        }
      }
      if (nullPositions.length === 0) { continue; }
      const passive = this.getPlayerState(id, ['passive']);
      if (passive.find(item => item && item.hp > 0) === undefined) {
        continue;
      }
      this.setPlayerState(id, ['forcedSwitches'], nullPositions);
      this.hooks[id].onForceSwitch();
    }
    this.finishForcedSwitches();
  }

  finishForcedSwitches() {
    for (const id of this.getIds()) {
      const numForcedSwitches = this.getPlayerState(id, ['forcedSwitches', 'length']);
      if (numForcedSwitches > 0) { return; }
    }
    this.finishRunActions();
  }

  finishRunActions() {
    // Clean up actions
    const activeIds = this.getActiveIds();
    for (const { id, pos } of activeIds) {
      if (this.getPokemon(id, 'active', pos) === null) {
        this.setAction(id, pos, { type: 'pass' });
      } else {
        this.clearAction(id, pos);
      }
    }
    // Start next turn
    this.triggerOnMove();
  }

  /**
   * @param {string} id
   * @param {number} pos
   */
  executeMoveAction(id, pos) {
    const action = this.getAction(id, pos);
    // FIXME: check if can move, sleep, frozen, volatiles, etc.
    // FIXME: update PP
    const moveState = this.getMove(id, 'active', pos, action.move);
    const move = moves[moveState.id];
    const rivalId = this.getRivalId(id);
    // Get Targets
    const targetPositions = [];
    if (moveState.target === 'normal') {
      // FIXME: if target has fainted then target must be replaced
      targetPositions.push({ id: rivalId, pos: action.target });
    }
    // Execute each move
    const active = this.getPokemon(id, 'active', pos);
    for (const { id: targetId, pos: targetPos } of targetPositions) {
      let accuracy;
      if (move.accuracy === true) {
        accuracy = 100;
      } else {
        const accuracyBoost = this.getBoost(id, pos, 'accuracy');
        const evasionBoost = this.getBoost(targetId, targetPos, 'evasion');
        const boost = Math.max(-6, Math.min(6, accuracyBoost - evasionBoost));
        accuracy = getBoostedValue('accuracy', boost, move.accuracy);
      }
      // FIXME: add accuracy modifications
      const hitValue = this.getRandom(1, 100);
      if (hitValue > accuracy) {
        // FIXME: hit misses
        continue;
      }
      if (move.category === 'status') {
        // FIXME: does not damage
        continue;
      }
      const level = active.build.level;
      /** @type {'atk' | 'spa'} */
      let offenseKey = move.category === 'physical' ? 'atk' : 'spa';
      /** @type {'def' | 'spd'} */
      let defenseKey = move.category === 'physical' ? 'def' : 'spd';
      const offenseStat = this.getBoostedStat(id, pos, offenseKey);
      const defenseStat = this.getBoostedStat(targetId, targetPos, defenseKey);
      let damage = (((2 * level / 5 + 2) * move.basePower * offenseStat / defenseStat) / 50 + 2);
      // FIXME: implement other modifiers
      damage = Math.floor(damage);
      const target = this.getPokemon(targetId, 'active', targetPos);
      target.hp = Math.max(0, target.hp - damage);
      this.setPokemon(targetId, 'active', targetPos, target);
      if (target.hp > 0) {
        // FIXME: trigger secondary effects
      } else {
        const swithoutPos = this.getFirstEmptyPassivePosition(targetId);
        this.executeSwitch(targetId, targetPos, swithoutPos);
      }
    }
    this.clearAction(id, pos);
  }

  /**
   * Gets all active slots containing an action.
   */
  getSlotsContainingAction() {
    return this.getActiveIds()
      .filter(({ id, pos }) => {
        return this.getAction(id, pos) !== null;
      });
  }

  /**
   * Gets all active slots missing an action.
   */
  getSlotsMissingAction() {
    return this.getActiveIds()
      .filter(({ id, pos }) => {
        return this.getAction(id, pos) === null;
      });
  }

  /**
   * Gets all active positions currently occupied.
   */
  getOccupiedActivePositions() {
    return this.getActiveIds()
      .filter(({ id, pos }) => !!this.getPokemon(id, 'active', pos));
  }

  // FIXME: this should set the move order according to speed.
  // Priority ties should be handled elsewhere.
  /**
   * Sets a move order for the Pokemon left to move.
   */
  setOrder() {
    const activeIds = this.getOccupiedActivePositions();
    const order = activeIds
      .map(item => {
        const action = this.getAction(item.id, item.pos);
        if (!action || action.type !== 'move') { return null; }
        const { id: moveId } = this.getMove(item.id, 'active', item.pos, action.move);
        const priority = moves[moveId].priority;
        const speed = this.getBoostedStat(item.id, item.pos, 'spe');
        // FIXME: do some speed modifications here, like trick room
        return { ...item, priority, speed };
      })
      .filter(item => item !== null)
      .sort((a, b) => a.priority === b.priority ? b.speed - a.speed : b.priority - a.priority);
    this.setState(['order'], order);
  }
}

module.exports = Battle;
