import assert from 'assert';
import { matchSchema, playerSchema } from '../validation/schemas';

const tiedMatch = matchSchema.safeParse({
  seasonId: 1,
  homeTeamId: 1,
  awayTeamId: 2,
  homeScore: 2,
  awayScore: 2
});

assert.equal(tiedMatch.success, true, 'Schema accepts tied score; business service rejects it later.');

const invalidRating = playerSchema.safeParse({
  firstName: 'Test',
  lastName: 'Player',
  position: 'igrac',
  shirtNumber: 9,
  teamId: 1,
  seasonId: 1,
  pac: 120,
  sho: 50,
  pas: 50,
  dri: 50,
  def: 50,
  phy: 50
});

assert.equal(invalidRating.success, false, 'Player rating over 99 must fail validation.');

console.log('Smoke tests passed.');
