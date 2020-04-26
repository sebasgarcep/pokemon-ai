const MetaTeamGenerator = require('./team-generators/MetaTeamGenerator');
const RandomTeamGenerator = require('./team-generators/RandomTeamGenerator');

async function start() {
  const randomGen = new RandomTeamGenerator();
  await randomGen.init();
  console.log(randomGen.generateTeam());

  const metaGen = new MetaTeamGenerator();
  await metaGen.init();
  console.log(metaGen.generateTeam());
}

start()
  .then(() => process.exit(0))
  .catch((err) => { console.log(err); process.exit(1); });
