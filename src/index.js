const MetaTeamGenerator = require('./team-generators/MetaTeamGenerator');
const RandomTeamGenerator = require('./team-generators/RandomTeamGenerator');
const { Battle } = require('./simulator');
const { formatid } = require('./constants');

async function start() {
  const randomGen = new RandomTeamGenerator();
  await randomGen.init();
  const p1 = randomGen.generateTeam();
  console.log(p1);

  const metaGen = new MetaTeamGenerator();
  await metaGen.init();
  const p2 = metaGen.generateTeam();
  console.log(p2);

  const options = {
    debug: true,
    formatid,
    send: (type, data) => {
      if (Array.isArray(data)) data = data.join('\n');
      console.log(type, data);
      if (type === 'end') { console.log('end'); }
    }
  };

  const battle = new Battle(options);
  battle.setPlayer('p1', { team: p1 });
  battle.setPlayer('p2', { team: p2 });
  battle.choose('p1', 'team 3456');
  battle.choose('p2', 'team 3456');
  console.log(battle.sides[0].requestState);
  console.log(battle.sides[1].requestState);
}

start()
  .then(() => process.exit(0))
  .catch((err) => { console.log(err); process.exit(1); });
