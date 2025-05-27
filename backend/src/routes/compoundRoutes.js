const express = require('express');
const Compound = require('../models/compound');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/compounds/search/:query
 * @desc    Search compounds by name or description
 * @access  Public
 */
router.get('/search/:query', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const allResults = Compound.search(req.params.query);
    const totalItems = allResults.length;
    const totalPages = Math.ceil(totalItems / limit);
    
    const compounds = allResults.slice(offset, offset + limit);
    
    res.json({
      compounds,
      currentPage: page,
      totalPages,
      totalItems
    });
  } catch (error) {
    console.error('Error searching compounds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/compounds
 * @desc    Get paginated compounds
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const allCompounds = Compound.findAll();
    const totalItems = allCompounds.length;
    const totalPages = Math.ceil(totalItems / limit);
    
    const compounds = allCompounds.slice(offset, offset + limit);
    
    res.json({
      compounds,
      currentPage: page,
      totalPages,
      totalItems
    });
  } catch (error) {
    console.error('Error fetching compounds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/compounds/:id
 * @desc    Get single compound by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const compound = Compound.findById(req.params.id);
    
    if (!compound) {
      return res.status(404).json({ message: 'Compound not found' });
    }
    
    res.json(compound);
  } catch (error) {
    console.error('Error fetching compound:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/compounds
 * @desc    Create a new compound
 * @access  Private
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const newCompound = Compound.create(req.body);
    res.status(201).json(newCompound);
  } catch (error) {
    console.error('Error creating compound:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/compounds/:id
 * @desc    Update a compound
 * @access  Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const updatedCompound = Compound.update(req.params.id, req.body);
    
    if (!updatedCompound) {
      return res.status(404).json({ message: 'Compound not found' });
    }
    
    res.json(updatedCompound);
  } catch (error) {
    console.error('Error updating compound:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/compounds/:id
 * @desc    Delete a compound
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const success = Compound.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Compound not found' });
    }
    
    res.json({ message: 'Compound deleted successfully' });
  } catch (error) {
    console.error('Error deleting compound:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
