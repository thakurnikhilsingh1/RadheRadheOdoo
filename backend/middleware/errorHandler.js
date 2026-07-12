/**
 * Postgres error codes we expect to hit routinely and want to surface
 * as clean 4xx responses (instead of a raw 500 + stack trace):
 *   23505 - unique_violation           (e.g. duplicate registration_number)
 *   23503 - foreign_key_violation      (e.g. vehicle_id that doesn't exist)
 *   23514 - check_violation            (e.g. cargo_weight <= 0)
 *   P0001 - raise_exception            (our custom trigger messages, e.g.
 *                                       "Cargo weight exceeds vehicle max capacity")
 */
function errorHandler(err, req, res, next) {
  console.error(err);

  const pgCode = err.code;

  if (pgCode === '23505') {
    return res.status(409).json({ error: 'Duplicate value violates a unique constraint', detail: err.detail });
  }
  if (pgCode === '23503') {
    return res.status(400).json({ error: 'Referenced record does not exist', detail: err.detail });
  }
  if (pgCode === '23514') {
    return res.status(400).json({ error: 'Value violates a check constraint', detail: err.detail });
  }
  if (pgCode === 'P0001') {
    // This is our own RAISE EXCEPTION text from the trigger functions —
    // it's already a human-readable business-rule message.
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;