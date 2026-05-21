import { Request, Response } from 'express';
import { AppSetting, CmsBlock, NextMatch, Team } from '../models';
import { activateDueNextMatches, finishNextMatch, startNextMatch } from '../services/matchService';
import { fail, ok } from '../utils/http';

const validCardDesigns = ['standard', 'gold'];
const validSiteDesigns = ['classic', 'premium'];

export const defaultDonationPage = {
  eyebrow: 'Podrzi ligu',
  title: 'Donacije za Duel Ligu',
  intro: 'Svaka donacija pomaze da utakmice imaju bolju organizaciju, kvalitetniju opremu i sadrzaj koji publika moze da prati iz kola u kolo.',
  impactTitle: 'Za sta se koristi podrska',
  impactBody: 'Donacije se koriste za termine, lopte, marker opremu, osnovnu medicinsku opremu, snimanje najzanimljivijih trenutaka i odrzavanje platforme sa rezultatima, statistikama i najavama.',
  paymentTitle: 'Kako mozes donirati',
  paymentBody: 'Uplatu mozes poslati direktno na racun lige ili kontaktirati administratore ako zelis da podrzis konkretan termin, opremu ili medijski sadrzaj.',
  bankAccount: 'RS35 0000 0000 0000 0000 00',
  recipientName: 'Duel Liga',
  paymentPurpose: 'Donacija za organizaciju lige',
  ctaLabel: 'Kontakt za donaciju',
  ctaUrl: 'mailto:admin@football.com',
  imageUrl: '',
  isPublished: true
};

const parseDonationPage = (value?: string | null) => {
  if (!value) return defaultDonationPage;
  try {
    return { ...defaultDonationPage, ...JSON.parse(value) };
  } catch {
    return defaultDonationPage;
  }
};

export const getSettings = async (_req: Request, res: Response) => {
  const [cardDesign, siteDesign] = await Promise.all([
    AppSetting.findByPk('cardDesign'),
    AppSetting.findByPk('siteDesign')
  ]);
  return ok(res, {
    cardDesign: validCardDesigns.includes(cardDesign?.value || '') ? cardDesign?.value : 'standard',
    siteDesign: validSiteDesigns.includes(siteDesign?.value || '') ? siteDesign?.value : 'classic'
  });
};

export const updateSettings = async (req: Request, res: Response) => {
  const { cardDesign, siteDesign } = req.body;
  if (cardDesign !== undefined && !validCardDesigns.includes(cardDesign)) return fail(res, 'Dizajn kartice mora biti standard ili gold.');
  if (siteDesign !== undefined && !validSiteDesigns.includes(siteDesign)) return fail(res, 'Dizajn sajta mora biti classic ili premium.');
  if (cardDesign === undefined && siteDesign === undefined) return fail(res, 'Nije poslat dizajn za cuvanje.');

  await Promise.all([
    cardDesign !== undefined ? AppSetting.upsert({ key: 'cardDesign', value: cardDesign }) : Promise.resolve(),
    siteDesign !== undefined ? AppSetting.upsert({ key: 'siteDesign', value: siteDesign }) : Promise.resolve()
  ]);

  const [savedCardDesign, savedSiteDesign] = await Promise.all([
    AppSetting.findByPk('cardDesign'),
    AppSetting.findByPk('siteDesign')
  ]);
  return ok(res, {
    cardDesign: validCardDesigns.includes(savedCardDesign?.value || '') ? savedCardDesign?.value : 'standard',
    siteDesign: validSiteDesigns.includes(savedSiteDesign?.value || '') ? savedSiteDesign?.value : 'classic'
  });
};

export const getDonationPage = async (_req: Request, res: Response) => {
  const setting = await AppSetting.findByPk('donationPage');
  return ok(res, parseDonationPage(setting?.value));
};

export const updateDonationPage = async (req: Request, res: Response) => {
  const page = { ...defaultDonationPage, ...req.body };
  await AppSetting.upsert({ key: 'donationPage', value: JSON.stringify(page) });
  return ok(res, page);
};

export const getCmsBlocks = async (_req: Request, res: Response) => {
  const blocks = await CmsBlock.findAll({ order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']] });
  return ok(res, blocks);
};

export const createCmsBlock = async (req: Request, res: Response) => {
  try {
    const { title, body, type = 'text', imageUrl, sortOrder = 0, isPublished = true } = req.body;
    if (!title || !body) return fail(res, 'Naslov i sadrzaj su obavezni.');
    const block = await CmsBlock.create({ title, body, type, imageUrl, sortOrder, isPublished });
    return ok(res, block, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'CMS sadrzaj nije kreiran.');
  }
};

export const updateCmsBlock = async (req: Request, res: Response) => {
  const block = await CmsBlock.findByPk(Number(req.params.id));
  if (!block) return fail(res, 'CMS sadrzaj nije pronadjen.', 404);
  await block.update(req.body);
  return ok(res, block);
};

export const deleteCmsBlock = async (req: Request, res: Response) => {
  const block = await CmsBlock.findByPk(Number(req.params.id));
  if (!block) return fail(res, 'CMS sadrzaj nije pronadjen.', 404);
  await block.destroy();
  return ok(res, { id: Number(req.params.id) });
};

export const getNextMatches = async (_req: Request, res: Response) => {
  await activateDueNextMatches();
  const matches = await NextMatch.findAll({ include: ['homeTeam', 'awayTeam', 'season', 'match'], order: [['scheduledAt', 'ASC']] });
  return ok(res, matches);
};

export const createNextMatch = async (req: Request, res: Response) => {
  try {
    const { seasonId, homeTeamId, awayTeamId, scheduledAt, venue, note } = req.body;
    if (!seasonId || !homeTeamId || !awayTeamId || !scheduledAt) return fail(res, 'Sezona, obje ekipe i termin su obavezni.');
    if (Number(homeTeamId) === Number(awayTeamId)) return fail(res, 'Ekipe za najavu moraju biti razlicite.');

    const teamCount = await Team.count({ where: { seasonId, id: [homeTeamId, awayTeamId] } });
    if (teamCount !== 2) return fail(res, 'Obje ekipe moraju pripadati izabranoj sezoni.');

    const match = await NextMatch.create({ seasonId, homeTeamId, awayTeamId, scheduledAt, venue, note });
    return ok(res, match, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Najava utakmice nije kreirana.');
  }
};

export const updateNextMatch = async (req: Request, res: Response) => {
  const match = await NextMatch.findByPk(Number(req.params.id));
  if (!match) return fail(res, 'Najava nije pronadjena.', 404);
  await match.update(req.body);
  return ok(res, match);
};

export const startScheduledMatch = async (req: Request, res: Response) => {
  try {
    const match = await startNextMatch(Number(req.params.id));
    return ok(res, match);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Utakmica nije pokrenuta.');
  }
};

export const finishScheduledMatch = async (req: Request, res: Response) => {
  try {
    const match = await finishNextMatch(Number(req.params.id), req.body);
    return ok(res, match);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Utakmica nije zavrsena.');
  }
};
