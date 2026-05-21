import { Request, Response } from 'express';
import { Match, MatchComment } from '../models';
import { createMatch, deleteMatch, getMatchVotingSummary, rateMatchPlayer, updateMatch, voteMatchPlayer } from '../services/matchService';
import { fail, ok } from '../utils/http';

const matchInclude = ['homeTeam', 'awayTeam', 'winnerTeam', { association: 'playerStats', include: ['player', 'team'] }];
const matchDetailInclude = [...matchInclude, { association: 'comments' }];

export const getSeasonMatches = async (req: Request, res: Response) => {
  const matches = await Match.findAll({ where: { seasonId: req.params.seasonId }, include: matchInclude, order: [['matchNumber', 'DESC']] });
  return ok(res, matches);
};

export const getMatch = async (req: Request, res: Response) => {
  const match = await Match.findByPk(Number(req.params.id), { include: matchDetailInclude, order: [[{ model: MatchComment, as: 'comments' }, 'createdAt', 'DESC']] });
  if (!match) return fail(res, 'Utakmica nije pronadjena.', 404);
  const voting = await getMatchVotingSummary(match.id);
  return ok(res, { ...match.toJSON(), ...voting });
};

export const postMatchComment = async (req: Request, res: Response) => {
  const match = await Match.findByPk(Number(req.params.id));
  if (!match) return fail(res, 'Utakmica nije pronadjena.', 404);
  const comment = await MatchComment.create({
    matchId: match.id,
    authorName: req.body.authorName || null,
    body: req.body.body
  });
  return ok(res, comment, 201);
};

export const postMatch = async (req: Request, res: Response) => {
  try {
    const match = await createMatch(req.body);
    return ok(res, match, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Utakmica nije kreirana.');
  }
};

export const putMatch = async (req: Request, res: Response) => {
  try {
    const match = await updateMatch(Number(req.params.id), req.body);
    return ok(res, match);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Utakmica nije izmijenjena.');
  }
};

export const removeMatch = async (req: Request, res: Response) => {
  try {
    await deleteMatch(Number(req.params.id));
    return ok(res, { id: Number(req.params.id) });
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Utakmica nije obrisana.');
  }
};

export const postPlayerRating = async (req: Request, res: Response) => {
  try {
    const rating = await rateMatchPlayer(Number(req.params.id), Number(req.body.playerId), Number(req.body.rating), req.body.voterKey);
    return ok(res, rating, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Ocjena nije sacuvana.');
  }
};

export const postPlayerVote = async (req: Request, res: Response) => {
  try {
    const vote = await voteMatchPlayer(Number(req.params.id), Number(req.body.playerId), req.body.voterKey);
    return ok(res, vote, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Glas nije sacuvan.');
  }
};
