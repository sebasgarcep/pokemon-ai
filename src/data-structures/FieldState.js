/**
 * Encloses all information about the battle field.
 */
class FieldState {
  /**
   * Create a field state.
   * @param {string} weather
   * @param {string} terrain
   * @param {any} effects FIXME: missing signature
   */
  constructor(
    weather,
    terrain,
    effects,
  ) {
    this.weather = weather;
    this.terrain = terrain;
    this.effects = effects;
  }
}

module.exports = FieldState;
