/**
 * FIXME: keep like an event log that details all events that happen and
 * use a hook to report them to players. This will be useful when building
 * an information model.
 */

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
  players: {},
  field: null,
  order: [],
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

  setPlayer(id, team, onTeamPreview, onMove, onForceSwitch, onEnd) {
    if (this.getIds().length >= 2) { throw new Error('Cannot set more than two players.'); }

    const opts = {};
    // Hooks
    opts.onTeamPreview = (...args) => onTeamPreview(opts, ...args);
    opts.onMove = (...args) => onMove(opts, ...args);
    opts.onForceSwitch = (...args) => onForceSwitch(opts, ...args);
    opts.onEnd = (...args) => onEnd(opts, ...args);
    // Methods
    opts.select = this.select.bind(this, id);
    opts.move = this.move.bind(this, id);
    opts.switch = this.switch.bind(this, id);

    this.hooks[id] = opts;

    this.setPlayerData(id, {
      id,
      team,
      active: null,
      passive: null,
      actions: null,
    });
  }

  getIds() {
    return Object.keys(this.hooks);
  }

  getPlayerData(id, ...keys) {
    return this.getData(['players', id, ...keys]);
  }

  setPlayerData(id, data, ...keys) {
    return this.setData(data, ['players', id, ...keys]);
  }

  getData(...keys) {
    const data = this.state.getIn(keys);
    if (data && data.toJS) { return data.toJS(); }
    return data;
  }

  setData(data, ...keys) {
    this.state = this.state.setIn(keys, fromJS(data));
    return this.state;
  }

  start() {
    const ids = this.getIds();
    if (ids.length < 2) { throw new Error('Both players must be set for the battle to begin.'); }
    this.setData('teampreview', 'phase');
    for (const playerId of ids) {
      this.hooks[playerId].onTeamPreview();
    }
  }

  select(id, choices) {
    choices = choices.filter(item => 1 <= item && item <= 6);
    if (choices.length !== this.format.total) {
      throw new Error(`You must select exactly ${this.format.total} pokemon.`);
    }
    const team = this.getPlayerData(id, 'team');
    const pokemon = choices.map(index => PokemonState.create(team[index - 1]));
    const active = pokemon.slice(0, this.format.active);
    const passive = pokemon.slice(this.format.active, this.format.total - this.format.active);
    this.setPlayerData(id, active, 'active', );
    this.setPlayerData(id, passive, 'passive');
    this.setPlayerData(id, active.map(() => null), 'actions');
    // Check for Team Preview end
    const ids = this.getIds();
    if (ids.every(playerId => !!this.getPlayerData(playerId, 'active'))) {
      this.beginBattle();
    }
  }

  beginBattle() {
    this.setData('battle', 'phase');
    const ids = this.getIds();
    for (const playerId of ids) {
      this.hooks[playerId].onMove();
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
  move(id, activePos, movePos, targetPos = 0) {
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
    const move = this.getMove(id, 'active', activePos, movePos);
    if (!move) { throw new Error('There is no move in this slot.'); }
    if (move.disabled) { throw new Error('This move has been disabled.'); }
    if (move.pp === 0) { throw new Error('There is no PP left in this move.'); }
    // FIXME: Add Target types valid check
    this.setAction(id, activePos, { type: 'move', move: movePos, target: targetPos });
  }

  // FIXME: missing more checks
  switch(id, activePos, passivePos) {
    if (
      activePos < 1
      || activePos > this.format.active
      || passivePos < 1
      || passivePos > this.format.total - this.format.active) {
      throw new Error('Invalid switch input.');
    }
    const passive = this.getPokemon(id, 'passive', passivePos);
    if (passive.hp === 0) { throw new Error('Cannot switch into a fainted Pokemon.'); }
    this.setAction(id, activePos, { type: 'switch', passive: passivePos });
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
    return this.getPlayerData(id, location, pos - 1);
  }

  /**
   * Gets a Pokemon from a certain slot.
   * @param {string} id
   * @param {'active' | 'passive'} location
   * @param {number} pos
   */
  setPokemon(id, location, pos, pokemon) {
    return this.setPlayerData(id, pokemon, location, pos - 1);
  }

  getMove(id, location, pokemonPos, movePos) {
    return this.getPlayerData(id, location, pokemonPos - 1, 'moves', movePos - 1);
  }

  /**
   * Gets the action associated with a player and an active position.
   * @param {string} id
   * @param {number} pos
   */
  getAction(id, pos) {
    return this.getPlayerData(id, 'actions', pos - 1);
  }

  setAction(id, pos, action) {
    this.setPlayerData(id, action, 'active', pos - 1);
    this.commit();
  }

  clearAction(id, pos) {
    return this.setPlayerData(id, null, 'actions', pos);
  }

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
    const activeIds = this.getActiveIds();
    // Check if commands are complete
    for (const { id, pos } of activeIds) {
      if (this.getAction(id, pos) === null) { return; }
    }
    // Execute commands
    this.runActions();
    // Clean up actions
    for (const { id, pos } of activeIds) {
      if (this.getPokemon(id, 'active', pos) === null) {
        this.setAction(id, pos, { type: 'pass' });
      } else {
        this.clearAction(id, pos);
      }
    }
  }

  runActions() {
    this.performPassActions();
    this.performSwitchActions();
    this.performMoveActions();
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
      const active = this.getPokemon(id, 'active', pos);
      const passive = this.getPokemon(id, 'passive', action.passive);
      // FIXME: do some cleanup like clear volatiles, boosts, etc.
      this.setPokemon(id, 'active', pos, passive);
      this.setPokemon(id, 'passive', action.passive, active);
      this.clearAction(id, pos);
    }
  }

  getBoostedStat(id, pos, key, value) {
    value = value !== undefined ? value : this.getPlayerData(id, 'active', pos - 1, 'stats', key);
    const boost = this.getPlayerData(id, 'active', pos - 1, 'boosts', key);
    return getBoostedValue(key, boost, value);
  }

  performMoveActions() {
    while (this.missingAnyAction()) {
      this.setOrder();
      const [{ id, pos }] = this.getData('order');
      this.executeMoveAction(id, pos);
    }
  }

  executeMoveAction(id, pos) {
    const action = this.getAction(id, pos);
    // FIXME: check if can move, sleep, frozen, volatiles, etc.
    const { id: moveId } = this.getMove(id, 'active', pos, action.move);
    const move = moves[moveId];
    let accuracy;
    if (move.accuracy === true) {
      accuracy = 100;
    } else {
      accuracy = this.getBoostedStat(id, pos, 'accuracy', move.accuracy);
    }
    // FIXME: update PP
    this.clearAction(id, pos);
  }

  missingAnyAction() {
    const activeIds = this.getActiveIds();
    for (const { id, pos } of activeIds) {
      if (this.getAction(id, pos) !== null) { return true; }
    }
    return false;
  }

  /**
   * Sets a move order for the Pokemon let to move.
   */
  setOrder() {
    const activeIds = this.getActiveIds();
    const order = activeIds
      .map(item => {
        const action = this.getAction(item.id, item.pos);
        if (!action || action.type !== 'move') { return null; }
        const { id: moveId } = this.getMove(item.id, 'active', item.pos, action.movePos);
        const priority = moves[moveId].priority;
        const speed = this.getBoostedStat(item.id, item.pos, 'spe');
        // FIXME: do some speed modifications here, like trick room
        return { ...item, priority, speed };
      })
      .filter(item => item !== null)
      .sort((a, b) => a.priority === b.priority ? b.speed - a.speed : b.priority - a.priority);
    this.setData(order, 'order');
  }
}

module.exports = Battle;
