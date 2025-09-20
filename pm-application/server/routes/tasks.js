const express = require('express');
const { executeQuery, executeTransaction } = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get tasks for a schedule
router.get('/schedules/:scheduleId', authenticateToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    const tasks = await executeQuery(`
      SELECT t.*, u.username as assigned_to_name, u2.username as created_by_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE t.schedule_id = ?
      ORDER BY t.created_at ASC
    `, [scheduleId]);
    
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Save bulk tasks for a schedule
router.post('/schedules/:scheduleId/bulk', authenticateToken, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks must be an array' });
    }
    
    // Verify schedule exists
    const schedules = await executeQuery('SELECT id FROM schedules WHERE id = ?', [scheduleId]);
    if (schedules.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // Delete existing tasks for this schedule
    await executeQuery('DELETE FROM tasks WHERE schedule_id = ?', [scheduleId]);
    
    // Insert new tasks
    if (tasks.length > 0) {
      const userId = req.user.userId;
      const queries = tasks.map(task => ({
        sql: `
          INSERT INTO tasks (
            id, schedule_id, name, description, task_type, parent_task_id,
            start_date, end_date, status, priority, progress, estimated_hours,
            actual_hours, assigned_to, dependencies, subtasks, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          task.id, scheduleId, task.name, task.description, task.task_type || 'subtask',
          task.parent_task_id, task.start_date, task.end_date, task.status || 'not_started',
          task.priority || 'medium', task.progress || 0, task.estimated_hours || 0,
          task.actual_hours || 0, task.assigned_to, 
          JSON.stringify(task.dependencies || []),
          JSON.stringify(task.subtasks || []),
          userId
        ]
      }));
      
      await executeTransaction(queries);
    }
    
    res.json({ 
      message: 'Tasks saved successfully',
      count: tasks.length
    });
  } catch (error) {
    console.error('Save bulk tasks error:', error);
    res.status(500).json({ error: 'Failed to save tasks' });
  }
});

// Update a single task
router.put('/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    
    const allowedFields = [
      'name', 'description', 'start_date', 'end_date', 'status', 'priority',
      'progress', 'estimated_hours', 'actual_hours', 'assigned_to'
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
    
    params.push(taskId);
    
    const result = await executeQuery(`
      UPDATE tasks 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
router.delete('/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Delete subtasks first
    await executeQuery('DELETE FROM tasks WHERE parent_task_id = ?', [taskId]);
    
    // Delete the task
    const result = await executeQuery('DELETE FROM tasks WHERE id = ?', [taskId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get task by ID
router.get('/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const tasks = await executeQuery(`
      SELECT t.*, u.username as assigned_to_name, u2.username as created_by_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE t.id = ?
    `, [taskId]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ task: tasks[0] });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

module.exports = router;
