const express = require('express');
const router = express.Router();
const isAuth = require('../util/isAuth');
const rolesController= require('../controllers/roles.controller');

const canViewRol= require('../util/canViewRol');
const canAddRol= require('../util/canAddRol');
const canDeleteRol = require('../util/canDeleteRol');

const canViewEquipo= require('../util/canViewEquipo');
const canAddEquipo= require('../util/canAddEquipo');
const canEditEquipo= require('../util/canEditEquipo');
const canDeleteEquipo= require('../util/canDeleteEquipo');


router.get('/consultas', canViewRol,rolesController.get_mostrarRoles);
router.post('/eliminar',canDeleteRol, rolesController.post_eliminar);
router.get('/agregar', canAddRol, rolesController.get_agregarRol);
router.post('/agregar', canAddRol, rolesController.post_agregarRol);


router.get('/equipo', canViewEquipo, rolesController.get_equipo);
router.get('/buscar/:q', canViewEquipo, rolesController.get_buscar);
router.get('/buscar', canViewEquipo, rolesController.get_buscar);

router.get('/equipo/agregarEmpleado', canAddEquipo,rolesController.get_agregarEmpleado);
router.post('/equipo/agregarEmpleado', canAddEquipo,rolesController.post_agregarEmpleado);
router.post('/eliminarUsuario/:q',canDeleteEquipo, rolesController.post_eliminarUsuario);
router.get('/modificarUsuario/:q',canEditEquipo, rolesController.get_modificarUsuario);
router.post('/modificarUsuario', canEditEquipo, rolesController.post_modificarUsuario);

router.post('/cambiarRol', rolesController.post_cambiarRol);

module.exports = router;
