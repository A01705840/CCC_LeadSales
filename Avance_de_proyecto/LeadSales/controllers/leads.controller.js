const { request } = require('express');
const fastcsv = require('fast-csv');
const fs = require('fs');
const path = require('path');
const Version= require('../models/version.model');
const Lead = require('../models/lead.model');
const Usuario = require('../models/usuario.model');
const utils = require('../controllers/util');

exports.get_analitica = async (request, response, next) => {
    const range = request.params.date; // Obtener el rango de la ruta para obtener los leads
    const version = request.params.version;
    let result = await Lead.fetchLeadsByDayPorVersion(range,version);
    // Inicializar las fechas
    let fechas = [];

    // Si el rango es un año o un semestre, generar una fecha para cada mes
    if (range === '3' || range === '4') {
        const hoy = new Date(2023, 0, 1);
        const meses = range === '3' ? 6 : 12; // Si el rango es un semestre, generar 6 fechas, si es un año, generar 12

        for (let i = 0; i < meses; i++) {
            let fecha;
            if (i === 0) {
                // Para el último mes, obtener el último día del mes
                fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 0);
            } else {
                fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i - 1, 1);
            }
            fechas.unshift(fecha); // Añadir la fecha al inicio del array para mantener el orden cronológico
        }
        // Generar los leads con meses sin leads
        let leadsConMesesSinLeads = utils.generarLeadsConMesesSinLeads(result[0], fechas);

        response.json({
            leadsPerDay: leadsConMesesSinLeads,
        }); 
    } else if (range === '1' || range === '2') {
        // Si el rango es una semana o un mes, calcular el rango de fechas y generar las fechas
        const rangoFechas = utils.calcularRangoFechas(range);
        fechas = utils.generarFechas(rangoFechas.inicio, rangoFechas.fin);
    

    // Generar los leads con días sin leads
    let leadsConDiasSinLeads = utils.generarLeadsConDiasSinLeads(result[0], fechas);

    response.json({
        leadsPerDay: leadsConDiasSinLeads,
    }); 
    }
};

exports.get_analitica_agent = async (request, response, next) => {
    const rangeAgent = Number(request.params.date); // Obtener el rango de la ruta
    const version = request.params.version;

    // Verificar si el rango es de días o de meses
    let result;
    if (rangeAgent === 3 || rangeAgent === 4) {
        // Para semestre y año, llamar a la nueva función
        result = await Lead.fetchLeadsPorAgenteAgrupadosPorMesPorVersion(rangeAgent,version);
        return response.json(result);
    } else {
        // Para otros casos, llamar a la función original
        result = await Lead.fetchLeadsPorAgentePorVersion(rangeAgent,version);
    }

    const leadsPorAgente = result[0]; // Solo usar el primer elemento del array

    // Calcular el rango de fechas y generar las fechas
    const rangoFechas = utils.calcularRangoFechas(rangeAgent);
    const fechas = utils.generarFechas(rangoFechas.inicio, rangoFechas.fin);

    const gruposPorAgente = utils.agruparLeadsPorAgente(leadsPorAgente);
    const datasetsPorAgente = utils.generarDatasetsPorAgente(gruposPorAgente, fechas);

    response.json({
        startDate: rangoFechas.inicio,
        endDate: rangoFechas.fin,
        fechas: fechas,
        datasets: datasetsPorAgente
    });
};

exports.get_analitica_version = async (request, response, next) => {
    const IDversion = request.params.version;
    const rangeAgent = '1'; // Siempre usa '1' (semana) como valor predeterminado
    const result = await Lead.fetchLeadsByDayPorVersion(rangeAgent,IDversion); // Obtener los leads por día
    const cantidadLeads = await Lead.obtenerCantidadLeadsPorVersion(IDversion); // Obtener la cantidad total de leads
    const cantidadLeadsOrganicos = await Lead.obtenerCantidadLeadsOrganicosPorVersion(IDversion); // Obtener la cantidad de leads orgánicos
    const cantidadLeadsEmbudos = await Lead.obtenerCantidadLeadsEmbudosPorVersion(IDversion); // Obtener la cantidad de leads en embudos
    const cantidadLeadsStatus = await Lead.obtenerCantidadLeadsStatusPorVersion(IDversion); // Obtener la cantidad de leads por status
    const cantidadLeadsAgente = await Lead.obtenerCantidadLeadsPorAgentePorVersion(IDversion); // Obtener la cantidad de leads por agente
    const leadsPorAgenteResult = await Lead.fetchLeadsPorAgentePorVersion(rangeAgent,IDversion); // Obtener los leads por agente
    
    const leadsPorAgente = leadsPorAgenteResult[0]; // Solo usar el primer elemento del array para evitar duplicados 
    
    const version= await Version.fetchAll(); // Obtener el nombre de la versión
    const versiones= version[0]; // Solo usar el primer elemento del array para evitar duplicados
    const leadsporEstado = await Lead.fetchLeadsporEstadoPorVersion(IDversion); // Obtener la cantidad de leads por estado
    
    // Calcular el rango de fechas y generar las fechas
    const rangoFechas = utils.calcularRangoFechas(rangeAgent);
    const fechas = utils.generarFechas(rangoFechas.inicio, rangoFechas.fin);

    // Generar los leads con días sin leads
    let leadsConDiasSinLeads = utils.generarLeadsConDiasSinLeads(result[0], fechas);

    const gruposPorAgente = utils.agruparLeadsPorAgente(leadsPorAgente);
    const datasetsPorAgente = utils.generarDatasetsPorAgente(gruposPorAgente, fechas);
    // Ejemplo de lo que contendría el objeto de estados
    // [{MXQRO: 10, MXMEX: 20, MXGDL: 30, MXMTY: 40, MXAGS: 50}]
    const estados = utils.reduceLeadporEstado(leadsporEstado[0]);


    response.json({
        leadsPerDay: leadsConDiasSinLeads, 
        cantidadTotalLeads: cantidadLeads,
        cantidadLeadsOrganicos: cantidadLeadsOrganicos,
        cantidadLeadsEmbudos: cantidadLeadsEmbudos,
        cantidadLeadsAgente: cantidadLeadsAgente,
        cantidadLeadsStatus: cantidadLeadsStatus ,
        fechas: fechas,
        datasets: datasetsPorAgente,
        estados: estados,
    });
};

exports.get_analiticaPRESET = async (request, response, next) => {
    let [versionMaxResult]=await Version.max();
    versionMaxResult=versionMaxResult[0]['MAX(IDVersion)'];
    const rangeAgent = '1'; // Siempre usa '1' (semana) como valor predeterminado
    const result = await Lead.fetchLeadsByDayPorVersion(rangeAgent,versionMaxResult); // Obtener los leads por día
    const cantidadLeads = await Lead.obtenerCantidadLeadsPorVersion(versionMaxResult); // Obtener la cantidad total de leads
    const cantidadLeadsOrganicos = await Lead.obtenerCantidadLeadsOrganicosPorVersion(versionMaxResult); // Obtener la cantidad de leads orgánicos
    const cantidadLeadsEmbudos = await Lead.obtenerCantidadLeadsEmbudosPorVersion(versionMaxResult); // Obtener la cantidad de leads en embudos
    const cantidadLeadsStatus = await Lead.obtenerCantidadLeadsStatusPorVersion(versionMaxResult); // Obtener la cantidad de leads por status
    const cantidadLeadsAgente = await Lead.obtenerCantidadLeadsPorAgentePorVersion(versionMaxResult); // Obtener la cantidad de leads por agente
    const leadsPorAgenteResult = await Lead.fetchLeadsPorAgentePorVersion(rangeAgent,versionMaxResult); // Obtener los leads por agente
    
    const leadsPorAgente = leadsPorAgenteResult[0]; // Solo usar el primer elemento del array para evitar duplicados 
    const leadsporEstado = await Lead.fetchLeadsporEstadoPorVersion(versionMaxResult); // Obtener la cantidad de leads por estado

    const version= await Version.fetchAll(); // Obtener el nombre de la versión
    const versiones= version[0]; // Solo usar el primer elemento del array para evitar duplicados
    
    // Calcular el rango de fechas y generar las fechas
    const rangoFechas = utils.calcularRangoFechas(rangeAgent);
    const fechas = utils.generarFechas(rangoFechas.inicio, rangoFechas.fin);

    // Generar los leads con días sin leads
    let leadsConDiasSinLeads = utils.generarLeadsConDiasSinLeads(result[0], fechas);

    const gruposPorAgente = utils.agruparLeadsPorAgente(leadsPorAgente);
    const datasetsPorAgente = utils.generarDatasetsPorAgente(gruposPorAgente, fechas);
    // Ejemplo de lo que contendría el objeto de estados
    // [{MXQRO: 10, MXMEX: 20, MXGDL: 30, MXMTY: 40, MXAGS: 50}]
    const estados = utils.reduceLeadporEstado(leadsporEstado[0]);


    response.render('Analitica', {
        username: request.session.username || '',
        permisos: request.session.permisos || [],
        leadsPerDay: leadsConDiasSinLeads, 
        cantidadTotalLeads: cantidadLeads,
        cantidadLeadsOrganicos: cantidadLeadsOrganicos,
        cantidadLeadsEmbudos: cantidadLeadsEmbudos,
        cantidadLeadsAgente: cantidadLeadsAgente,
        cantidadLeadsStatus: cantidadLeadsStatus ,
        fechas: fechas,
        datasets: datasetsPorAgente,
        versiones: versiones,
        estados: estados,
    });
};

exports.get_root = (request, response, next) => {
    response.render('home', {
        username: request.session.username || '',
        permisos: request.session.permisos || [],
    }, (error, html) => {
        if (error) {
            console.log(error);
            // Manejar el error aquí, por ejemplo, enviando una respuesta de error
            response.status(500).send('Error al renderizar la vista');
            return;
        }
        // La vista se renderizó correctamente, aquí puedes enviar la respuesta al cliente si es necesario
        response.send(html);
    });
};


exports.get_leads = async (request, res, next)  => {
    const versionInfo = await Version.fetchVersionInfo();
    const versiones = versionInfo[0].map(row => ({id: row.IDVersion, nombre: row.NombreVersion}));
    let IDVersion;
    if (versiones.length === 0) {
        IDVersion=null;
    }
    else{
        IDVersion = versiones[0].id;
    }
    
    
    const tamañoPagina = 500;
    const numeroTotalDeLeads = await Version.fetchNumeroTotalDeLeads(IDVersion);
    const numeroTotalDePaginas = Math.ceil(numeroTotalDeLeads / tamañoPagina);
    const pagina = 1;

    const inicio = (pagina - 1) * tamañoPagina + 1;
    const fin = inicio + tamañoPagina - 1;

    Version.fetchLeadsPorIDVersion(IDVersion, pagina)
        .then(([rows,fieldData]) => {
            res.render ('leads', {
                csrfToken: request.csrfToken,
                registro: true,
                leads: rows,
                numeroTotalDeLeads: numeroTotalDeLeads,
                numeroTotalDePaginas: numeroTotalDePaginas,
                username: request.session.username || '',
                permisos: request.session.permisos || [],
                inicio: inicio,
                fin: fin,
                versiones: versiones,
            });
        })
        .catch((error) => {
            console.log(error);
        });

}

exports.post_eliminar_lead = (request, response, next) => {
    Lead.eliminar(request.body.IDLead)
    .then(() => {
        return Lead.fetchAll();
        
    }).then(([leads, fieldData]) => {
        return response.status(200).json({leads: leads});
    }).catch((error) => {
        console.log(error);
    });
}

exports.get_fechas = () => {
    Lead
}

exports.get_modificar_lead = (request, response, next) => {
    const id = request.params.id;
    Lead.fetchOneLeadbyid(id)
    .then(([rows, fieldData]) => {
        response.json(rows[0]);
    })
    .catch((error) => {
        console.log(error);
    });
}

exports.post_modificar_lead = async (request, response, next) => {
    try {
        // Actualiza el lead en la base de datos
        await Lead.update(request.body);

        // Envía una respuesta al cliente indicando que la operación fue exitosa
        return response.json({ message: 'Lead actualizado con éxito' });
    } catch (error) {
        // Maneja cualquier error que pueda ocurrir
        console.error(error);
        return response.status(500).json({ message: 'Hubo un error al actualizar el lead' });
    }
};

exports.post_crear_lead = async (request, response, next) => {
    const regexDIF = /^.{3}55/;
    const regexCHH = /^.{3}(614|625|639|656|627)/;
    const regexJAL = /^.{3}(33|392|341|322|378|474)/;
    const regexMXNLE = /^.{3}81/;
    const regexMXNPUE = /^.{3}(220|221|222|244|248|238)/;
    const regexMXYUC = /^.{3}(990|999)/;
    const regexMXCOA = /^.{3}(844|866|861|878|871)/;
    const regexMXAGU = /^.{3}449/;
    const regexMXSON = /^.{3}(662|642|631|644|653|622)/;
    const regexMXBCN = /^.{3}(686|646|664)/;
    const regexMXBCS = /^.{3}(612|624)/;
    const regexMXQUE = /^.{3}(442|446)/;
    const regexMXMIC = /^.{3}(443|753|353|352|452|351)/;
    const regexMXDUR = /^.{3}618/;
    const regexMXCHP = /^.{3}(961|962)/;
    const regexMXVER = /^.{3}(228|229|783|922|271|921|782|272)/;
    const regexMXNAY = /^.{3}311/;
    const regexMXTAB = /^.{3}993/;
    const regexMXTAM = /^.{3}(834|831|867|899|833|868)/;
    const regexMXMOR = /^.{3}(777|735|734)/;
    const regexMXOAX = /^.{3}(951|971)/;
    const regexMXHID = /^.{3}(771|775|773)/;
    const regexMXCAM = /^.{3}(981|938)/;
    const regexMXSLP = /^.{3}(444|481)/;
    const regexMXMEX = /^.{3}(720|722|729|594|595|427)/;
    const regexMXROO = /^.{3}(983|998)/;
    const regexMXCOL = /^.{3}(312|314)/;
    const regexMXZAC = /^.{3}(492|493)/;
    const regexMXGUA = /^.{3}(473|477|461|445|464|415|462)/;
    const regexMXTLA = /^.{3}(246|241)/;
    const regexMXGRO = /^.{3}(774|747|733|755)/;
    const regexMXSIN = /^.{3}(669|668|667)/;
    let lastIDResult = await Lead.fetchlastID();
    let lastID = Number(lastIDResult[0][0].IDLead);
    try {
        // Actualiza el lead en la base de datos
        await Lead.crear(request.body);
        if (regexDIF.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXDIF', lastID);
        } else if (regexCHH.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXCHH', lastID);
        } else if (regexJAL.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXJAL', lastID);
        } else if (regexMXNLE.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXNLE', lastID);
        } else if (regexMXNPUE.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXPUE', lastID);
        } else if (regexMXYUC.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXYUC', lastID);
        } else if (regexMXCOA.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXCOA', lastID);
        } else if (regexMXAGU.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXAGU', lastID);
        } else if (regexMXSON.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXSON', lastID);
        } else if (regexMXBCN.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXBCN', lastID);
        } else if (regexMXBCS.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXBCS', lastID);
        } else if (regexMXQUE.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXQUE', lastID);
        } else if (regexMXMIC.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXMIC', lastID);
        } else if (regexMXDUR.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXDUR', lastID);
        } else if (regexMXCHP.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXCHP', lastID);
        } else if (regexMXVER.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXVER', lastID);
        } else if (regexMXNAY.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXNAY', lastID);
        } else if (regexMXTAB.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXTAB', lastID);
        } else if (regexMXTAM.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXTAM', lastID);
        } else if (regexMXMOR.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXMOR', lastID);
        } else if (regexMXOAX.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXOAX', lastID);
        } else if (regexMXHID.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXHID', lastID);
        } else if (regexMXCAM.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXCAM', lastID);
        } else if (regexMXSLP.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXSLP', lastID);
        } else if (regexMXMEX.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXMEX', lastID);
        } else if (regexMXROO.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXROO', lastID);
        } else if (regexMXCOL.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXCOL', lastID);
        } else if (regexMXZAC.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXZAC', lastID);
        } else if (regexMXGUA.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXGUA', lastID);
        } else if (regexMXTLA.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXTLA', lastID);
        } else if (regexMXGRO.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXGRO', lastID);
        } else if (regexMXSIN.test(request.body.telefono)) {
            await Lead.guardar_estadolada('MXSIN', lastID);
        }
        // Envía una respuesta al cliente indicando que la operación fue exitosa
        return response.status(200).json({ message: 'Lead creado con éxito' });
    } catch (error) {
        // Maneja cualquier error que pueda ocurrir
        console.error(error);
        return response.status(500).json({ message: 'Hubo un error al crear el lead' });
    }
};

exports.post_leads_por_version = async (request, response, next) => {
    const IDVersion = request.body.version;
    const pagina = 1; // Siempre empieza en la primera página cuando cambias de versión

    const tamañoPagina = 500;
    const numeroTotalDeLeads = await Version.fetchNumeroTotalDeLeads(IDVersion);
    const numeroTotalDePaginas = Math.ceil(numeroTotalDeLeads / tamañoPagina);

    const inicio = (pagina - 1) * tamañoPagina + 1;
    const fin = Math.min(inicio + tamañoPagina - 1, numeroTotalDeLeads);

    const leads = await Version.fetchLeadsPorIDVersion(IDVersion, pagina);

    return response.status(200).json({
        leads: leads,
        numeroTotalDeLeads: numeroTotalDeLeads,
        numeroTotalDePaginas: numeroTotalDePaginas,
        inicio: inicio,
        fin: fin,
    });
}

exports.post_leads_por_pagina = async (request, response, next) => {
    const IDVersion = request.body.version;
    const pagina = request.body.pagina;
    const tamañoPagina = 500;
    const inicio = (pagina - 1) * tamañoPagina + 1;
    const numeroTotalDeLeads = await Version.fetchNumeroTotalDeLeads(IDVersion);
    const fin = Math.min(inicio + tamañoPagina - 1, numeroTotalDeLeads);

    const leads = await Version.fetchLeadsPorIDVersion(IDVersion, pagina);
    return response.status(200).json({
        leads: leads,
        inicio: inicio,
        fin: fin,
    });

}

exports.post_descargar_leads = async (req, res, next) => {
    const IDVersion = req.body.version;
    const nombreVersion = req.body.nombreVersion; // Recibe el nombre de la versión del cliente
    const result = await Version.fetchAllLeadsPorIDVersion(IDVersion);
    const leads = result[0]; // Asume que los leads están en la primera posición del array resultante

    const csvStream = fastcsv.format({ headers: true, bom: true });
    const writableStream = fs.createWriteStream(path.resolve(__dirname, `${nombreVersion}.csv`), { encoding: 'utf8' }); // Usa el nombre de la versión para el archivo

    writableStream.on("finish", function() {
        res.download(path.resolve(__dirname, `${nombreVersion}.csv`), `${nombreVersion}.csv`, (err) => { // Usa el nombre de la versión para la descarga
            if (err) {
                fs.unlinkSync(path.resolve(__dirname, `${nombreVersion}.csv`)); // Elimina el archivo localmente después de la descarga
                next(err);
            }

            fs.unlinkSync(path.resolve(__dirname, `${nombreVersion}.csv`)); // Elimina el archivo localmente después de la descarga
        });
    });

    csvStream.pipe(writableStream).on('end', () => console.log('CSV file successfully processed'));
    leads.forEach((lead) => {
        csvStream.write(lead);
    });

    csvStream.end();
}