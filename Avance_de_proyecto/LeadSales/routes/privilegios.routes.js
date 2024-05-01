const express = require('express');

const router = express.Router();

const isAuth = require('../util/isAuth');

const PrivilegiosController = require('../controllers/privilegios.controller');
const canEditRol= require('../util/canEditRol');



router.get('/:IDRol',canEditRol, PrivilegiosController.get_privilegios);
router.post('/', canEditRol, PrivilegiosController.post_privilegios);


module.exports = router;