const { Battle } = require('../pokemon-showdown/.sim-dist/battle');
const { BattlePokedex } = require('../pokemon-showdown/.data-dist/pokedex');
const { Dex } = require('../pokemon-showdown/.sim-dist/dex');
const { Side } = require('../pokemon-showdown/.sim-dist/side');
const { TeamValidator } = require('../pokemon-showdown/.sim-dist/team-validator');

module.exports.Battle = Battle;
module.exports.BattlePokedex = BattlePokedex;
module.exports.Dex = Dex;
module.exports.Side = Side;
module.exports.TeamValidator = TeamValidator;
