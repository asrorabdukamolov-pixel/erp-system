const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

// @route   GET api/tasks
router.get('/', auth, taskController.getTasks);

// @route   POST api/tasks
router.post('/', auth, taskController.createTask);

// @route   PUT api/tasks/:id
router.put('/:id', auth, taskController.updateTask);

// @route   POST api/tasks/:id/comment
router.post('/:id/comment', auth, taskController.addComment);

// @route   DELETE api/tasks/:id
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
