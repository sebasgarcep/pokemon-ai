const range = require('lodash.range');
const { fromJS } = require('immutable');
const PokemonState = require('./PokemonState');

const initalState = fromJS({
  phase: 'setplayers',
  players: {},
  field: null,
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
    const data = this.state.getIn(['players', id, ...keys]);
    if (data && data.toJS) { return data.toJS(); }
    return data;
  }

  setPlayerData(id, data, ...keys) {
    this.state = this.state.setIn(['players', id, ...keys], fromJS(data));
    return this.state;
  }

  start() {
    const ids = this.getIds();
    if (ids.length < 2) { throw new Error('Both players must be set for the battle to begin.'); }
    this.state = this.state.set('phase', 'teampreview');
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
    this.state = this.state.set('phase', 'battle');
    const ids = this.getIds();
    for (const playerId of ids) {
      this.hooks[playerId].onMove();
    }
  }

  /**
   *
   * @param {string} id
   * @param {number} activePos
   * @param {number} movePos
   * @param {number} targetPos - 0 = No Target, Positive = Foe Target, Negative = Ally Target
   */
  move(id, activePos, movePos, targetPos = 0) {
    if (
      activePos < 1
      || activePos > this.format.active
      || movePos < 1
      || movePos > this.format.total - this.format.active
      || targetPos < -this.format.active
      || targetPos > this.format.active
    ) {
      throw new Error('Invalid move positions');
    }
    // Move is Valid checks
    const move = this.getPlayerData(id, 'active', activePos, 'moves', movePos);
    if (!move) { throw new Error('There is no move in this slot.'); }
    if (move.disabled) { throw new Error('This move has been disabled.'); }
    if (move.pp === 0) { throw new Error('There is no PP left in this move.'); }
    // FIXME: Add Target types valid check
    this.setPlayerData(id, { type: 'move', active: activePos, move: movePos, target: targetPos }, 'active', activePos - 1);
    this.commit();
  }

  switch(id, activePos, passivePos) {
    if (
      activePos < 1
      || activePos > this.format.active
      || passivePos < 1
      || passivePos > this.format.total - this.format.active) {
      throw new Error('Invalid switch positions.');
    }
    const passiveHP = this.getPlayerData(id, 'passive', passivePos - 1);
    if (passiveHP === 0) { throw new Error('Cannot switch into a fainted Pokemon.'); }
    this.setPlayerData(id, { type: 'switch', passive: passivePos }, 'active', activePos - 1);
    this.commit();
  }

  commit() {
    const ids = this.getIds();
    // Check if commands are complete
    for (const playerId of ids) {
      for (const pos of range(this.format.active)) {
        if (this.getPlayerData(playerId, 'active', pos) === null) { return; }
      }
    }
    // Execute commands
    // FIXME: missing
    // Clean up actions
    for (const playerId of ids) {
      const actions = range(this.format.active)
        .map(pos => {
          // Empty positions should pass by default.
          if (this.getPlayerData(playerId, 'active', pos) === null) {
            return { type: 'pass' };
          } else {
            return null;
          }
        });
      this.setPlayerData(playerId, actions, 'actions');
    }
  }

  clone(opts) {
    return new Battle({
      state: this.state,
      format: this.format.id,
      ...opts,
    });
  }
}

module.exports = Battle;
