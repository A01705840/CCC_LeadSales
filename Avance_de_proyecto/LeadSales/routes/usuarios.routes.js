const express = require('express');
const router = express.Router();
const usuariosController= require('../controllers/usuarios.controller');
const isAuth = require('../util/isAuth');



router.get('/login',  usuariosController.get_login);

router.get('/signup', usuariosController.get_signup);

router.post('/signup',  usuariosController.post_signup);

router.post('/login', usuariosController.post_login);

router.get('/logout', usuariosController.get_logout);

router.get('/', isAuth, usuariosController.get_logout);

module.exports = router;