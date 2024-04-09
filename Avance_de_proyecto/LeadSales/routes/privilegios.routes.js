const express = require('express');

const router = express.Router();

const isAuth = require('../util/isAuth');
const canEdit = require('../util/canEdit');

const PrivilegiosController = require('../controllers/privilegios.controller');


router.get('/:IDRol', isAuth,  PrivilegiosController.get_privilegios);
router.post('/', isAuth, PrivilegiosController.post_privilegios);


module.exports = router;