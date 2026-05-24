// campaignController.js — CRUD for campaigns.
//
// Read endpoints (list, getById) are PUBLIC.
// Write endpoints (create, update, delete) require auth, and update/delete
// also check that req.user is the campaign's creator.

import Campaign from '../models/Campaign.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/campaigns
// Supports:  ?category=tech&search=foo&page=1&limit=12&status=active
//
// Pagination uses skip/limit. For larger datasets you'd switch to
// cursor-based pagination, but skip/limit is fine up to ~10k rows.
export const listCampaigns = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    status = 'active',     // only show active by default; admin UI can override
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { status };
  if (category) filter.category = category;
  if (search) {
    // Case-insensitive partial match on title.
    // The 'i' flag = case-insensitive. Escaping user input prevents regex injection.
    filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Run count and fetch in parallel so the slower of the two is the total wait.
  const [items, total] = await Promise.all([
    Campaign.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('creator', 'name avatar'), // only pull these fields from User
    Campaign.countDocuments(filter),
  ]);

  res.json({
    items,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)),
  });
});

// GET /api/campaigns/:id
export const getCampaignById = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id)
    .populate('creator', 'name avatar email');

  if (!campaign) {
    return res.status(404).json({ message: 'campaign not found' });
  }
  res.json({ campaign });
});

// POST /api/campaigns  (multipart/form-data — Multer parses req.file)
export const createCampaign = asyncHandler(async (req, res) => {
  const { title, story, goalAmount, deadline, category } = req.body;

  if (!title || !story || !goalAmount || !deadline || !category) {
    return res.status(400).json({ message: 'all fields are required' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'cover image is required' });
  }
  if (new Date(deadline) <= new Date()) {
    return res.status(400).json({ message: 'deadline must be in the future' });
  }

  const campaign = await Campaign.create({
    creator: req.user._id,
    title,
    story,
    coverImage: req.file.path, // multer-storage-cloudinary puts the URL here
    goalAmount: Number(goalAmount),
    deadline,
    category,
    status: 'active', // MVP: auto-approve. For admin moderation, default to 'pending'.
  });

  res.status(201).json({ campaign });
});

// PATCH /api/campaigns/:id
export const updateCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ message: 'campaign not found' });
  }

  // Ownership check — only the creator can edit.
  // .equals() handles ObjectId vs string comparison safely.
  if (!campaign.creator.equals(req.user._id)) {
    return res.status(403).json({ message: 'not allowed' });
  }

  // Whitelist editable fields — never spread req.body blindly into a Mongoose
  // update or users could set their own status to 'active' / raisedAmount, etc.
  const editable = ['title', 'story', 'category', 'deadline', 'goalAmount'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) campaign[field] = req.body[field];
  });

  await campaign.save();
  res.json({ campaign });
});

// DELETE /api/campaigns/:id
// For MVP we hard-delete. In production with donations attached, you'd
// soft-delete (set status: 'banned' or 'archived') to preserve audit trail.
export const deleteCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ message: 'campaign not found' });
  }
  if (!campaign.creator.equals(req.user._id)) {
    return res.status(403).json({ message: 'not allowed' });
  }

  await campaign.deleteOne();
  res.json({ message: 'campaign deleted' });
});

// GET /api/campaigns/mine  — campaigns owned by req.user
export const listMyCampaigns = asyncHandler(async (req, res) => {
  const items = await Campaign.find({ creator: req.user._id }).sort({ createdAt: -1 });
  res.json({ items });
});
