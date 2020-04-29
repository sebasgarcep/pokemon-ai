/**
 * @typedef {Object} Item
 * @property {string} id
 * @property {string} name
 * @property {number} num
 * @property {string} desc
 */

/**
  * @typedef {Object} Move
  * @property {string} id
  * @property {string} name
  * @property {number} num
  * @property {number | true} accuracy
  * @property {number} basePower
  * @property {string} category
  * @property {string} desc
  * @property {string} target
  * @property {string} type
  * @property {number} priority
  * @property {string | null} status
  * @property {string | null} volatile
  * @property {SecondaryEffects | null} secondary
  * @property {{ boosts: Boosts | null }} self
  * @property {MoveFlags} flags
  */

/**
 * @typedef {Object} MoveFlags
 * @property {number} bullet
 * @property {number} mirror
 * @property {number} powder
 * @property {number} protect
 * @property {number} reflectable
 */

/**
 * @typedef {Object} SecondaryEffects
 * @property {number} chance
 * @property {string} status
 */

/**
 * @typedef {Object} Pokemon
 * @property {string} id
 * @property {string} name
 * @property {number} num
 * @property {string[]} types
 * @property {Spread} baseStats
 * @property {number} height
 * @property {number} weight
 * @property {boolean} canEvolve
 */

/**
 * @typedef {Object} Nature
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} Spread
 * @property {number} hp
 * @property {number} atk
 * @property {number} def
 * @property {number} spa
 * @property {number} spd
 * @property {number} spe
 */

/**
 * @typedef {Object} Boosts
 * @property {number} atk
 * @property {number} def
 * @property {number} spa
 * @property {number} spd
 * @property {number} spe
 * @property {number} accuracy
 * @property {number} evasion
 */

module.exports = null;
