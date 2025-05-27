const express = require('express');
const router = express.Router();
const Compound = require('../models/compound');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');

// Search compounds - This route must come before /:id to prevent conflicts
router.get('/search/:query', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Compound.findAndCountAll({
      where: {
        [Op.or]: [
          { CompoundName: { [Op.like]: `%${req.params.query}%` } },
          { CompoundDescription: { [Op.like]: `%${req.params.query}%` } }
        ]
      },
      limit,
      offset,
      order: [['CompoundName', 'ASC']]
    });

    res.json({
      compounds: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get paginated compounds
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Compound.findAndCountAll({
      limit,
      offset,
      order: [['CompoundName', 'ASC']]
    });

    res.json({
      compounds: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single compound
router.get('/:id', async (req, res) => {
  try {
    const compound = await Compound.findByPk(req.params.id);
    if (!compound) {
      return res.status(404).json({ error: 'Compound not found' });
    }
    res.json(compound);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create compound
router.post('/', authMiddleware, async (req, res) => {
  try {
    const compound = await Compound.create({
      CompoundName: req.body.CompoundName,
      CompoundDescription: req.body.CompoundDescription,
      strImageSource: req.body.strImageSource,
      strImageAttribution: req.body.strImageAttribution,
      dateModified: new Date()
    });
    res.status(201).json(compound);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update compound
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const compound = await Compound.findByPk(req.params.id);
    if (!compound) {
      return res.status(404).json({ error: 'Compound not found' });
    }
    await compound.update({
      CompoundName: req.body.CompoundName,
      CompoundDescription: req.body.CompoundDescription,
      strImageSource: req.body.strImageSource,
      strImageAttribution: req.body.strImageAttribution,
      dateModified: new Date()
    });
    res.json(compound);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete compound
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const compound = await Compound.findByPk(req.params.id);
    if (!compound) {
      return res.status(404).json({ error: 'Compound not found' });
    }
    await compound.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 