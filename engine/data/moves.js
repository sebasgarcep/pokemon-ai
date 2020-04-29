/**
 * @typedef {import('./typedefs').Move} Move
 */

/**
 * @type {Object<string, Move>}
 */
const moves = {
  sleeppowder: {
    id: 'sleeppowder',
    name: 'Sleep Powder',
    num: 79,
    accuracy: 75,
    basePower: 0,
    category: 'status',
    desc: 'Causes the target to fall asleep.',
    target: 'normal',
    type: 'grass',
    priority: 0,
    status: 'slp',
    volatile: null,
    secondary: null,
    self: {
      boosts: null,
    },
    flags: {
      bullet: 1,
      mirror: 1,
      protect: 1,
      powder: 0,
      reflectable: 0,
    },
  },
  protect: {
    id: 'protect',
    name: 'Protect',
    num: 182,
    accuracy: true,
    basePower: 0,
    category: 'status',
    desc: 'Prevents moves from affecting the user this turn.',
    target: 'self',
    type: 'normal',
    priority: 4,
    status: null,
    volatile: 'protect',
    secondary: null,
    self: {
      boosts: null,
    },
    flags: {
      bullet: 0,
      mirror: 0,
      protect: 0,
      powder: 0,
      reflectable: 0,
    },
  },
  sludgebomb: {
    id: 'sludgebomb',
    name: 'Sludge Bomb',
    num: 188,
    accuracy: 100,
    basePower: 90,
    category: 'special',
    desc: 'Has a 30% chance to poison the target.',
    target: 'normal',
    type: 'poison',
    priority: 0,
    status: null,
    volatile: null,
    secondary: {
      chance: 30,
      status: 'psn',
    },
    self: {
      boosts: null,
    },
    flags: {
      bullet: 0,
      mirror: 1,
      protect: 1,
      powder: 1,
      reflectable: 1,
    },
  },
  leafstorm: {
    id: 'leafstorm',
    name: 'Leaf Storm',
    num: 437,
    accuracy: 90,
    basePower: 130,
    category: 'special',
    desc: 'Lowers the user\'s Special Attack by 2 stages.',
    target: 'normal',
    type: 'grass',
    priority: 0,
    status: null,
    volatile: null,
    secondary: null,
    self: {
      boosts: {
        atk: 0,
        def: 0,
        spa: -2,
        spd: 0,
        spe: 0,
        accuracy: 0,
        evasion: 0,
      },
    },
    flags: {
      bullet: 0,
      mirror: 1,
      protect: 1,
      powder: 0,
      reflectable: 0,
    },
  },
};

module.exports = moves;
