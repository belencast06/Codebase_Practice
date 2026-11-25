const express = require('express');
const controller = require('../controllers/tickets.controller');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id/status', controller.updateStatus);
router.post('/:id/comments', controller.addComment);

module.exports = router;
