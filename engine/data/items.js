/**
 * @typedef {import('./typedefs').Item} Item
 */

/**
 * @type {Object<string, Item>}
 */
const items = {
  focussash: {
    id: 'focussash',
    name: 'Focus Sash',
    num: 275,
    desc: 'If holder\'s HP is full, will survive an attack that would KO it with 1 HP. Single use.',
  },
};

module.exports = items;
