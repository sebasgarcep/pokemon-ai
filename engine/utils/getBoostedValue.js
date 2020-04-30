function getBoostedValue(key, boost, value) {
  const base = key === 'accuracy' || key === 'evasion' ? 3 : 2;
  const sign = key === 'evasion' ? -1 : 1;
  const num = Math.min(base, base + sign * boost);
  const den = Math.min(base, base - sign * boost);
  return Math.floor(value * num / den);
}

module.exports = getBoostedValue;
