const express = require('express');
const { executeQuery } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get schedule templates
router.get('/schedules', authenticateToken, async (req, res) => {
  try {
    const templates = await executeQuery(`
      SELECT st.*, u.username as created_by_name
      FROM schedule_templates st
      LEFT JOIN users u ON st.created_by = u.id
      WHERE st.is_active = TRUE
      ORDER BY st.name ASC
    `);
    
    res.json({ templates });
  } catch (error) {
    console.error('Get schedule templates error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule templates' });
  }
});

// Get PM checklist templates
router.get('/checklists', authenticateToken, async (req, res) => {
  try {
    const templates = await executeQuery(`
      SELECT ct.*, u.username as created_by_name
      FROM pm_checklist_templates ct
      LEFT JOIN users u ON ct.created_by = u.id
      WHERE ct.is_active = TRUE
      ORDER BY ct.name ASC
    `);
    
    res.json({ templates });
  } catch (error) {
    console.error('Get checklist templates error:', error);
    res.status(500).json({ error: 'Failed to fetch checklist templates' });
  }
});

// Create schedule template
router.post('/schedules', authenticateToken, async (req, res) => {
  try {
    const { 
      id, 
      name, 
      description, 
      category, 
      estimated_duration, 
      phases, 
      documents = [] 
    } = req.body;
    
    if (!id || !name || !phases) {
      return res.status(400).json({ error: 'ID, name, and phases are required' });
    }
    
    const userId = req.user.userId;
    
    await executeQuery(`
      INSERT INTO schedule_templates (
        id, name, description, category, estimated_duration, phases, documents, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, name, description, category, estimated_duration,
      JSON.stringify(phases), JSON.stringify(documents), userId
    ]);
    
    res.status(201).json({ 
      message: 'Schedule template created successfully',
      template: { id, name, category }
    });
  } catch (error) {
    console.error('Create schedule template error:', error);
    res.status(500).json({ error: 'Failed to create schedule template' });
  }
});

// Create checklist template
router.post('/checklists', authenticateToken, async (req, res) => {
  try {
    const { 
      id, 
      name, 
      description, 
      task_type, 
      checklist_items 
    } = req.body;
    
    if (!id || !name || !checklist_items) {
      return res.status(400).json({ error: 'ID, name, and checklist_items are required' });
    }
    
    const userId = req.user.userId;
    
    await executeQuery(`
      INSERT INTO pm_checklist_templates (
        id, name, description, task_type, checklist_items, created_by
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      id, name, description, task_type,
      JSON.stringify(checklist_items), userId
    ]);
    
    res.status(201).json({ 
      message: 'Checklist template created successfully',
      template: { id, name, task_type }
    });
  } catch (error) {
    console.error('Create checklist template error:', error);
    res.status(500).json({ error: 'Failed to create checklist template' });
  }
});

// Get template by ID
router.get('/schedules/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const templates = await executeQuery(`
      SELECT st.*, u.username as created_by_name
      FROM schedule_templates st
      LEFT JOIN users u ON st.created_by = u.id
      WHERE st.id = ?
    `, [id]);
    
    if (templates.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ template: templates[0] });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

module.exports = router;
