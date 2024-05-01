const express = require('express');
const router = express.Router();
const LeadsController = require('../controllers/leads.controller');
const VersionController = require('../controllers/version.controller');
const isAuth = require('../util/isAuth');
const canViewGraficas = require('../util/canViewGraficas');

const canViewHistorial = require('../util/canViewHistorial');
const canPostHistorial = require('../util/canPostHistorial');
const canDownloadHistorial=require('../util/canDownloadHistorial');

const canViewLeads= require('../util/canViewLeads');
const canCreateLeads= require('../util/canCreateLeads');
const canEditLeads= require('../util/canEditLeads');
const canDeleteLeads= require('../util/canDeleteLeads');
const canDownloadLeads= require('../util/canDownloadLeads');





router.get('/analitica', canViewGraficas, LeadsController.get_analiticaPRESET);
router.get('/analitics/:version?',canViewGraficas, LeadsController.get_analitica_version);
router.get('/analitics/:date?/:version?',canViewGraficas, LeadsController.get_analitica);
router.get('/analitics/agent/:date?/:version?',canViewGraficas, LeadsController.get_analitica_agent);

router.get('/', LeadsController.get_root);

router.get('/Historial', canViewHistorial, VersionController.get_historial);
router.post('/Historial', canPostHistorial, VersionController.post_historial);
router.post('/descargarhistorial', canDownloadHistorial, VersionController.post_descargarhistorial);


router.get('/Leads', canViewLeads,LeadsController.get_leads);
router.post('/Leads/eliminar', canDeleteLeads, LeadsController.post_eliminar_lead);
router.post('/leadsporversion', canViewLeads, LeadsController.post_leads_por_version);
router.post('/leadsporpagina', canViewLeads, LeadsController.post_leads_por_pagina);
router.post('/descargarleads',  canDownloadLeads, LeadsController.post_descargar_leads);

router.get('/modificar/:id', canEditLeads, LeadsController.get_modificar_lead);
router.post('/modificar', canEditLeads, LeadsController.post_modificar_lead);

router.post('/crear', canCreateLeads,LeadsController.post_crear_lead);



module.exports = router;