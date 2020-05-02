const readline = require('readline');
const { Battle } = require('../../engine');

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
      let done = false;
      while (!done) {
        try {
          const response = await new Promise((resolve) => this.rl.question(message, resolve));
          await callback(response);
          done = true;
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
    return this.prompt(message, (response) => {
      const choices = response.split(/[, ]/);
      select(choices);
    });
  }

  onMove(id) {
    console.log(id);
    return ;
  }

  onForceSwitch(id) {
    return ;
  }

  onEnd(id) {
    return ;
  }
}

module.exports = TerminalGame;
