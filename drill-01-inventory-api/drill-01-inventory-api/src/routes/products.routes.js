const express = require('express');
const controller = require('../controllers/products.controller');

const router = express.Router();

router.get('/', controller.list);
//was missing a front slash 
//prior was :id not /:id , therefore was not understood by read
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id/stock', controller.adjustStock);
router.delete('/:id', controller.remove);

module.exports = router;
