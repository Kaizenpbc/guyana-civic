const express = require('express');
const { executeQuery } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, manager } = req.query;
    
    let sql = `
      SELECT p.*, u.username as manager_name, u2.username as created_by_name
      FROM projects p
      LEFT JOIN users u ON p.project_manager_id = u.id
      LEFT JOIN users u2 ON p.created_by = u2.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }
    
    if (manager) {
      conditions.push('p.project_manager_id = ?');
      params.push(manager);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY p.created_at DESC';
    
    const projects = await executeQuery(sql, params);
    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const projects = await executeQuery(`
      SELECT p.*, u.username as manager_name, u2.username as created_by_name
      FROM projects p
      LEFT JOIN users u ON p.project_manager_id = u.id
      LEFT JOIN users u2 ON p.created_by = u2.id
      WHERE p.id = ?
    `, [id]);
    
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ project: projects[0] });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      status = 'planning', 
      priority = 'medium',
      budget_allocated,
      currency = 'USD',
      start_date,
      end_date,
      project_manager_id
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const projectId = require('crypto').randomUUID();
    const userId = req.user.userId;
    
    await executeQuery(`
      INSERT INTO projects (
        id, name, description, status, priority, budget_allocated, currency,
        start_date, end_date, project_manager_id, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      projectId, name, description, status, priority, budget_allocated, currency,
      start_date, end_date, project_manager_id, userId
    ]);
    
    res.status(201).json({ 
      message: 'Project created successfully',
      project: { id: projectId, name, status }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const allowedFields = [
      'name', 'description', 'status', 'priority', 'budget_allocated', 'currency',
      'start_date', 'end_date', 'project_manager_id'
    ];
    
    const updateFields = [];
    const params = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        params.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    params.push(id);
    
    const result = await executeQuery(`
      UPDATE projects 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery('DELETE FROM projects WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
