function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function weightedRandomPicks(userCollection, { picks = 1, weights: userWeights } = {}) {
  const result = [];
  if (userCollection.length <= picks) { return userCollection; }
  let collection = userCollection;
  let weights;
  if (Array.isArray(userWeights)) {
    weights = userWeights.map(item => Number.parseInt(item, 10));
  } else if (typeof weights === 'string') {
    weights = collection.map(item => Number.parseInt(item[userWeights], 10));
  } else {
    weights = collection.map(() => 1);
  }
  if (collection.length !== weights.length) { return result; }
  for (let idx = 0; idx < picks; idx += 1) {
    let pos = -1;
    let current = 0;
    const value = Math.random();
    const total = weights.reduce((total, item) => total + item, 0);
    const threshold = total * value;
    do { pos += 1; current += Number.parseInt(weights[pos], 10); } while (current < threshold);
    result.push(collection[pos]);
    if (picks > 1) {
      collection = [...collection.slice(0, pos), ...collection.slice(pos + 1)];
      weights = [...weights.slice(0, pos), ...weights.slice(pos + 1)];
    }
  }
  return result;
}

module.exports.sleep = sleep;
module.exports.weightedRandomPicks = weightedRandomPicks;
