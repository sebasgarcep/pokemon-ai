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
  simulator.start();
}

start();
// .then(() => process.exit(0))
// .catch((err) => { console.log(err); process.exit(1); });
