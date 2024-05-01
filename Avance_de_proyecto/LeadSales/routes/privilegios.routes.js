const express = require('express');

const router = express.Router();

const isAuth = require('../util/isAuth');

const PrivilegiosController = require('../controllers/privilegios.controller');


router.get('/:IDRol', PrivilegiosController.get_privilegios);
router.post('/', PrivilegiosController.post_privilegios);


module.exports = router;