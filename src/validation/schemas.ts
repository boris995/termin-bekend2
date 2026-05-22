import { z } from 'zod';

const optionalString = z.string().trim().optional().nullable();
const id = z.coerce.number().int().positive();
const rating = z.coerce.number().int().min(0).max(99);

export const seasonSchema = z.object({
  number: z.coerce.number().int().positive().optional(),
  name: z.string().trim().optional().nullable(),
  winsToWinSeason: z.coerce.number().int().positive().default(8),
  status: z.enum(['active', 'completed']).optional()
});

export const teamSchema = z.object({
  name: z.string().trim().min(1),
  shortName: z.string().trim().min(1).max(4),
  logoUrl: optionalString,
  representativeName: optionalString,
  primaryColor: optionalString
});

export const playerSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  nickname: optionalString,
  position: z.enum(['golman', 'igrac', 'golman-igrac']),
  shirtNumber: z.coerce.number().int().positive(),
  teamId: id,
  seasonId: id,
  cardImageUrl: optionalString,
  galleryImages: z.array(z.string()).default([]),
  showOnHome: z.coerce.boolean().default(false),
  pac: rating.default(50),
  sho: rating.default(50),
  pas: rating.default(50),
  dri: rating.default(50),
  def: rating.default(50),
  phy: rating.default(50)
});

export const playerUpdateSchema = playerSchema.partial();

export const playerStatSchema = z.object({
  playerId: id,
  teamId: id,
  goals: z.coerce.number().int().min(0).default(0),
  assists: z.coerce.number().int().min(0).default(0)
});

export const matchTimelineEventSchema = z.object({
  minute: z.string().trim().min(1).max(8),
  type: z.enum(['goal', 'yellow-card', 'red-card', 'note']).default('goal'),
  teamId: id.optional().nullable(),
  playerId: id.optional().nullable(),
  assistPlayerId: id.optional().nullable(),
  description: optionalString
});

export const matchSchema = z.object({
  seasonId: id,
  homeTeamId: id,
  awayTeamId: id,
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
  playedAt: z.coerce.date().optional(),
  startedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional(),
  votingEnabled: z.coerce.boolean().default(true),
  reportSummary: optionalString,
  timelineEvents: z.array(matchTimelineEventSchema).optional().default([]),
  playerStats: z.array(playerStatSchema).optional().default([])
});

export const finishNextMatchSchema = z.object({
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
  endedAt: z.coerce.date().optional(),
  votingEnabled: z.coerce.boolean().default(true),
  reportSummary: optionalString,
  timelineEvents: z.array(matchTimelineEventSchema).optional().default([]),
  playerStats: z.array(playerStatSchema).min(1)
});

export const playerRatingSchema = z.object({
  playerId: id,
  rating: z.coerce.number().int().min(1).max(10),
  voterKey: z.string().trim().min(12).max(80)
});

export const playerVoteSchema = z.object({
  playerId: id,
  voterKey: z.string().trim().min(12).max(80)
});

export const cmsBlockSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  type: z.enum(['text', 'news', 'announcement']).default('text'),
  imageUrl: optionalString,
  sortOrder: z.coerce.number().int().default(0),
  isPublished: z.coerce.boolean().default(true)
});

export const cmsBlockUpdateSchema = cmsBlockSchema.partial();

export const nextMatchSchema = z.object({
  seasonId: id,
  homeTeamId: id,
  awayTeamId: id,
  scheduledAt: z.coerce.date(),
  venue: optionalString,
  note: optionalString,
  status: z.enum(['scheduled', 'live', 'completed', 'cancelled']).optional()
});

export const nextMatchUpdateSchema = nextMatchSchema.partial();

export const donationPageSchema = z.object({
  eyebrow: z.string().trim().min(1),
  title: z.string().trim().min(1),
  intro: z.string().trim().min(1),
  impactTitle: z.string().trim().min(1),
  impactBody: z.string().trim().min(1),
  paymentTitle: z.string().trim().min(1),
  paymentBody: z.string().trim().min(1),
  bankAccount: optionalString,
  recipientName: optionalString,
  paymentPurpose: optionalString,
  ctaLabel: optionalString,
  ctaUrl: optionalString,
  imageUrl: optionalString,
  isPublished: z.coerce.boolean().default(true)
});
