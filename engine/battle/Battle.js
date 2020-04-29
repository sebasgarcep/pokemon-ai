const { Map, List } = require('immutable');

const initalState = Map({
  phase: 'setplayers',
  p1: null,
  p2: null,
  field: null,
});

class Battle {
  constructor({ p1 = null, p2 = null, state = initalState } = {}) {
    // attributes
    this.p1 = p1;
    this.p2 = p2;
    this.state = state;

    // methods
    this.setPlayer = this.setPlayer.bind(this);
    this.commit = this.commit.bind(this);
    this.clone = this.clone.bind(this);
  }

  setPlayer(team, onTeamPreview, onMove, onForceSwitch, onEnd) {
    const id = this.p1 === null ? 'p1' : 'p2';

    const opts = {
      onTeamPreview,
      onMove,
      onForceSwitch,
      onEnd,
      select: this.select.bind(this, id),
      move: this.move.bind(this, id),
      switch: this.switch.bind(this, id),
    };

    this[id] = opts;
  }

  start() {
    if (this.p1 === null || this.p2 === null) { throw new Error('Both players must be set for the battle to begin.'); }
    this.state.set('phase', 'teampreview');
    this.p1.onTeamPreview(this.p1);
    this.p2.onTeamPreview(this.p2);
  }

  select(id) {
    if (this.state.get('p1') !== null && this.state.get('p2') !== null) {
      this.state.set('phase', 'battle');
      this.p1.onMove(this.p1);
      this.p2.onMove(this.p2);
    }
  }

  move(id) {
    this.commit();
  }

  switch(id) {
    this.commit();
  }

  commit() {}

  clone(opts) {
    return new Battle({
      p1: this.p1,
      p2: this.p2,
      state: this.state,
      ...opts,
    });
  }
}

module.exports = Battle;
