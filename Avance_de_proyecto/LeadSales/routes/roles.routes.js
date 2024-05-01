const express = require('express');
const router = express.Router();
const isAuth = require('../util/isAuth');
const rolesController= require('../controllers/roles.controller');

const canViewRol= require('../util/canViewRol');
const canAddRol= require('../util/canAddRol');
const canDeleteRol = require('../util/canDeleteRol');

router.get('/consultas', canViewRol,rolesController.get_mostrarRoles);
router.post('/eliminar',canDeleteRol, rolesController.post_eliminar);
router.get('/agregar', canAddRol, rolesController.get_agregarRol);
router.post('/agregar', canAddRol, rolesController.post_agregarRol);


router.get('/equipo', rolesController.get_equipo);
router.post('/eliminarUsuario/:q', rolesController.post_eliminarUsuario);
router.get('/modificarUsuario/:q', rolesController.get_modificarUsuario);
router.post('/modificarUsuario', rolesController.post_modificarUsuario);

router.post('/cambiarRol', rolesController.post_cambiarRol);
router.get('/buscar/:q',rolesController.get_buscar);
router.get('/buscar', rolesController.get_buscar);
router.get('/equipo/agregarEmpleado', rolesController.get_agregarEmpleado);
router.post('/equipo/agregarEmpleado', rolesController.post_agregarEmpleado);

module.exports = router;
