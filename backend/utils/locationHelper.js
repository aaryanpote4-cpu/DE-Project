/**
 * Helper to look up an integer ID if the caller passed a code (e.g. 'DL') or name string
 */
async function resolveLocationId(identifier, locations) {
  const numeric = parseInt(identifier, 10);
  if (!isNaN(numeric)) return numeric;
  const match = locations.find(l => 
    (l.code && l.code.toUpperCase() === String(identifier).toUpperCase()) || 
    l.name === identifier
  );
  return match ? match.id : numeric;
}

module.exports = {
  resolveLocationId
};
