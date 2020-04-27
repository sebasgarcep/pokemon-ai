const { Dex, BattlePokedex } = require('./simulator');

/**
 * Returns a Promise that resolves after a set number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Randomly samples with weights from an ordered collection.
 * @template T
 * @param {T[]} userCollection
 * @param {*} options
 * @returns {T[]}
 */
function sample(userCollection, { picks = 1, weights: userWeights } = {}) {
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
    do { pos += 1; current += weights[pos]; } while (current < threshold);
    result.push(collection[pos]);
    if (picks > 1) {
      collection = [...collection.slice(0, pos), ...collection.slice(pos + 1)];
      weights = [...weights.slice(0, pos), ...weights.slice(pos + 1)];
    }
  }
  return result;
}

/**
 * Gets the base species from the species name.
 * @param {string} species
 * @returns {string}
 */
function getBaseSpecies(species) {
  const speciesId = Dex.getId(species);
  const speciesData = BattlePokedex[speciesId];
  return (speciesData && (speciesData.baseSpecies || speciesData.name)) || null;
}

/**
 * Gets a species number.
 * @param {string} species
 * @returns {number}
 */
function getSpeciesNumber(species) {
  const speciesId = Dex.getId(species);
  const speciesData = BattlePokedex[speciesId];
  return  (speciesData && speciesData.num) || null;
}

/**
 * Gets a species number.
 * @param {string} species
 * @returns {string}
 */
function getSpeciesGender(species) {
  const speciesId = Dex.getId(species);
  const speciesData = BattlePokedex[speciesId];
  return  (speciesData && speciesData.gender) || null;
}

module.exports.sleep = sleep;
module.exports.sample = sample;
module.exports.getBaseSpecies = getBaseSpecies;
module.exports.getSpeciesNumber = getSpeciesNumber;
module.exports.getSpeciesGender = getSpeciesGender;
