const readline = require('readline');
const { Battle } = require('../../engine');
const moveData = require('../../engine/data/moves');
const pokemonData = require('../../engine/data/pokemon');

class TerminalGame {
  constructor(p1, p2) {
    this.queue = Promise.resolve();
    this.teams = { p1, p2 };
    this.battle = new Battle();
    this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    // methods
    for (const key in Object.keys(this)) {
      if (typeof this[key] === 'function') {
        this[key] = this[key].bind(this);
      }
    }
  }

  start() {
    for (const id of ['p1', 'p2']) {
      this.battle.setPlayer(
        id,
        this.teams[id],
        this.onTeamPreview.bind(this, id),
        this.onMove.bind(this, id),
        this.onForceSwitch.bind(this, id),
        this.onEnd.bind(this, id),
      );
    }
    this.battle.start();
  }

  async prompt(message, callback) {
    const job = this.queue.then(async () => {
      let unfinished = true;
      while (unfinished) {
        try {
          const response = await new Promise((resolve) => this.rl.question(message.trim() + '\n> ', resolve));
          const result = await callback(response);
          unfinished = result || false;
        } catch (error) {
          console.log(error);
        }
      }
    });
    this.queue = job;
    return job;
  }

  onTeamPreview(id, select, playerTeam, rivalTeam) {
    let message = `${id} team: ${playerTeam.map(item => item.species).join(', ')}\n`;
    message += `rival: ${rivalTeam.map(item => item.species).join(', ')}\n`;
    return this.prompt(message, response => {
      const choices = response.replace(/\D/g, '').split('');
      select(choices);
    });
  }

  printLineBreak() {
    console.log('----------');
  }

  formatPokemonState(state, full = false) {
    if (state === null) { return 'fnt'; }
    let message = `${pokemonData[state.build.species].name}`;
    if (state.build.gender !== 'N') { message += ` (${state.build.gender})`; }
    message += ` ${state.hp}/${state.maxhp}`;
    if (full) {
      message += `\n${state.moves.map(item => this.formatMoveState(item)).join(' / ')}`;
    }
    return message;
  }

  formatMoveState(state, full = false) {
    if (!state) { return 'Empty'; }
    const data = moveData[state.id];
    let message = `${data.name}${state.disabled ? ' (disabled)' : ''} ${state.pp}/${state.maxpp}`;
    if (full) {
      message += `\nType: ${data.type} / Power: ${data.basePower}`;
      message += `\n${data.desc}`;
    }
    return message;
  }

  showMoves(input, active) {
    const target = Number.parseInt(input[1]);
    if (
      Number.isNaN(target) ||
      target < 1 ||
      target > this.battle.format.active
    ) {
      throw new Error('Invalid target to show moves.');
    }
    const { moves: moveState } = active[target - 1];
    for (const state of moveState) {
      console.log(this.formatMoveState(state, true));
      this.printLineBreak();
    }
  }

  showTeam(active, passive) {
    const team = [...active, ...passive.filter(item => item !== null)];
    for (const member of team) {
      console.log(this.formatPokemonState(member, true));
      this.printLineBreak();
    }
  }

  onMove(id, move, change, playerActive, playerPassive, rivalActive, rivalPassive, field) {
    const playerActiveMessage = playerActive.map(item => this.formatPokemonState(item)).join(' / ');
    const rivalActiveMessage = rivalActive.map(item => this.formatPokemonState(item)).join(' / ');
    let message = `${id} team: ${playerActiveMessage}\n`;
    message += `rival: ${rivalActiveMessage}\n`;
    return this.prompt(message, response => {
      const [type, ...input] = response.split(' ');
      if (type === 'move') {
        const values = input.map(item => Number.parseInt(item, 10));
        move(...values);
      } else if (type === 'switch') {
        const values = input.map(item => Number.parseInt(item, 10));
        change(...values);
      } else if (type === 'show') {
        const key = input[0];
        if (key === 'moves') {
          this.showMoves(input, playerActive);
        } else if (key === 'team') {
          this.showTeam(playerActive, playerPassive);
        } else if (key === 'field') {
          throw new Error('Not implemented.');
        } else if (key === 'state') {
          throw new Error('Not implemented.');
        } else if (key === 'pokemon') {
          throw new Error('Not implemented.');
        } else {
          throw new Error('Only moves, team, field, state, and pokemon are valid options to show.');
        }
      } else {
        throw new Error('Only move and switch are recognized commands');
      }
      if (this.battle.getSlotsMissingAction().find(item => item.id === id)) {
        return true;
      }
    });
  }

  onForceSwitch(id) {
    return ;
  }

  onEnd(id) {
    return ;
  }
}

module.exports = TerminalGame;
