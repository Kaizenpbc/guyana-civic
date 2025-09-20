const express = require('express');
const { executeQuery, executeTransaction } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get current schedule for a project
router.get('/projects/:projectId/current', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const schedules = await executeQuery(`
      SELECT s.*, u.username as created_by_name
      FROM schedules s
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.project_id = ? AND s.is_current = TRUE
      ORDER BY s.created_at DESC
      LIMIT 1
    `, [projectId]);
    
    if (schedules.length === 0) {
      return res.status(404).json({ error: 'No schedule found for this project' });
    }
    
    res.json({ schedule: schedules[0] });
  } catch (error) {
    console.error('Get current schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Create new schedule for a project
router.post('/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      name = 'Current Project Schedule',
      description = 'Active project schedule',
      template_id,
      template_name
    } = req.body;
    
    // Check if project exists
    const projects = await executeQuery('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Set all existing schedules for this project to not current
    await executeQuery(
      'UPDATE schedules SET is_current = FALSE WHERE project_id = ?',
      [projectId]
    );
    
    // Create new schedule
    const scheduleId = require('crypto').randomUUID();
    const userId = req.user.userId;
    
    await executeQuery(`
      INSERT INTO schedules (
        id, project_id, name, description, template_id, template_name, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [scheduleId, projectId, name, description, template_id, template_name, userId]);
    
    res.status(201).json({
      message: 'Schedule created successfully',
      schedule: {
        id: scheduleId,
        project_id: projectId,
        name,
        description,
        template_id,
        template_name,
        status: 'draft',
        version: 1,
        is_current: true,
        created_by: userId
      }
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Update schedule
router.put('/:scheduleId', authenticateToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const updates = req.body;
    
    const allowedFields = [
      'name', 'description', 'status', 'total_duration_days', 
      'total_tasks', 'completed_tasks', 'progress_percentage'
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
    
    params.push(scheduleId);
    
    const result = await executeQuery(`
      UPDATE schedules 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Delete schedule
router.delete('/:scheduleId', authenticateToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    // Delete all tasks first (due to foreign key constraints)
    await executeQuery('DELETE FROM tasks WHERE schedule_id = ?', [scheduleId]);
    
    // Delete schedule
    const result = await executeQuery('DELETE FROM schedules WHERE id = ?', [scheduleId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

// Get schedule by ID
router.get('/:scheduleId', authenticateToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    const schedules = await executeQuery(`
      SELECT s.*, u.username as created_by_name
      FROM schedules s
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `, [scheduleId]);
    
    if (schedules.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ schedule: schedules[0] });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

module.exports = router;
