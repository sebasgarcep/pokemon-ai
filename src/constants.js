/**
 * @typedef {Object} Nature
 * @property {string} name
 * @property {string} plus
 * @property {string} minus
 */

const { Dex } = require('./simulator');

/**
 * @type {string}
 */
module.exports.formatid = Dex.validateFormat('vgc');

/**
 * @type {Object<string, Nature>}
 */
module.exports.natures = Dex.data.Natures;
