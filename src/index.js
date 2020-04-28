const MetaTeamGenerator = require('./team-generators/MetaTeamGenerator');
const RandomTeamGenerator = require('./team-generators/RandomTeamGenerator');
const RandomMatchupStrategy = require('./matchup-strategies/RandomMatchupStrategy');
const RandomBattleStrategy = require('./battle-strategies/RandomBattleStrategy');
const Agent = require('./Agent');
const BattleSimulator = require('./BattleSimulator');

async function start() {
  const randomGen = new RandomTeamGenerator();
  await randomGen.init();

  const metaGen = new MetaTeamGenerator();
  await metaGen.init();

  let index = 0;
  while (true) {
    const p1 = new Agent(
      randomGen.generateTeam(),
      new RandomMatchupStrategy(),
      new RandomBattleStrategy()
    );

    const p2 = new Agent(
      metaGen.generateTeam(),
      new RandomMatchupStrategy(),
      new RandomBattleStrategy()
    );

    const simulator = new BattleSimulator(p1, p2);
    const winner = await simulator.run();
    index += 1;
    console.log(index, winner);
  }
}

start();
// .then(() => process.exit(0))
// .catch((err) => { console.log(err); process.exit(1); });
