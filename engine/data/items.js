/**
 * @typedef {import('./typedefs').Item} Item
 */

/**
 * @type {Object<string, Item>}
 */
const items = {
  charcoal: {
    id: 'charcoal',
    name: 'Charcoal',
    num: 249,
    desc: 'Holder\'s Fire-type attacks have 1.2x power.',
  },
  widelens: {
    id: 'widelens',
    name: 'Wide Lens',
    num: 265,
    desc: 'The accuracy of attacks by the holder is 1.1x.',
  },
  lifeorb: {
    id: 'lifeorb',
    name: 'Life Orb',
    num: 270,
    desc: 'Holder\'s attacks do 1.3x damage, and it loses 1/10 its max HP after the attack.',
  },
  focussash: {
    id: 'focussash',
    name: 'Focus Sash',
    num: 275,
    desc: 'If holder\'s HP is full, will survive an attack that would KO it with 1 HP. Single use.',
  },
  eviolite: {
    id: 'eviolite',
    name: 'Eviolite',
    num: 538,
    desc: 'If holder\'s species can evolve, its Defense and Sp. Def are 1.5x.',
  },
  assaultvest: {
    id: 'assaultvest',
    name: 'Assault Vest',
    num: 640,
    desc: 'Holder\'s Sp. Def is 1.5x, but it can only select damaging moves.',
  }
};

module.exports = items;
