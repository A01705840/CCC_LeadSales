const { request } = require('express');

const Version= require('../models/version.model');
const Lead = require('../models/lead.model');
const Usuario = require('../models/usuario.model');
const utils = require('../controllers/util');

exports.get_analitica = async (request, response, next) => {
    const range = request.params.date; // Obtener el rango de la ruta para obtener los leads
    let result = await Lead.fetchLeadsByDay(range);
    console.log("get_analitica",result);
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

    // Verificar si el rango es de días o de meses
    let result;
    if (rangeAgent === 3 || rangeAgent === 4) {
        // Para semestre y año, llamar a la nueva función
        result = await Lead.fetchLeadsPorAgenteAgrupadosPorMes(rangeAgent);
        return response.json(result);
    } else {
        // Para otros casos, llamar a la función original
        result = await Lead.fetchLeadsPorAgente(rangeAgent);
        console.log(result);
    }

    const leadsPorAgente = result[0]; // Solo usar el primer elemento del array

    // Calcular el rango de fechas y generar las fechas
    const rangoFechas = utils.calcularRangoFechas(rangeAgent);
    const fechas = utils.generarFechas(rangoFechas.inicio, rangoFechas.fin);

    console.log("leadsPorAgente",leadsPorAgente);

    const gruposPorAgente = utils.agruparLeadsPorAgente(leadsPorAgente);
    const datasetsPorAgente = utils.generarDatasetsPorAgente(gruposPorAgente, fechas);

    response.json({
        startDate: rangoFechas.inicio,
        endDate: rangoFechas.fin,
        fechas: fechas,
        datasets: datasetsPorAgente
    });
};

exports.get_analiticaPRESET = async (request, response, next) => {
    const rangeAgent = '1'; // Siempre usa '1' (semana) como valor predeterminado
    const result = await Lead.fetchLeadsByDay(rangeAgent);
    const cantidadLeads = await Lead.obtenerCantidadLeads();
    const cantidadLeadsOrganicos = await Lead.obtenerCantidadLeadsOrganicos();
    const cantidadLeadsEmbudos = await Lead.obtenerCantidadLeadsEmbudos();
    const leadsPorAgenteResult = await Lead.fetchLeadsPorAgente(rangeAgent);
    const leadsPorAgente = leadsPorAgenteResult[0]; // Solo usar el primer elemento del array
    const nombreDeVersione= await Version.Nombres();
    const nombreDeVersiones= nombreDeVersione[0]
    console.log("Nombre de versiones "+nombreDeVersiones);

    // Calcular el rango de fechas y generar las fechas
    const rangoFechas = utils.calcularRangoFechas(rangeAgent);
    const fechas = utils.generarFechas(rangoFechas.inicio, rangoFechas.fin);

    // Generar los leads con días sin leads
    let leadsConDiasSinLeads = utils.generarLeadsConDiasSinLeads(result[0], fechas);

    const gruposPorAgente = utils.agruparLeadsPorAgente(leadsPorAgente);
    const datasetsPorAgente = utils.generarDatasetsPorAgente(gruposPorAgente, fechas);

    response.render('Analitica', {
        username: request.session.username || '',
        leadsPerDay: leadsConDiasSinLeads, 
        cantidadTotalLeads: cantidadLeads,
        cantidadLeadsOrganicos: cantidadLeadsOrganicos,
        cantidadLeadsEmbudos: cantidadLeadsEmbudos,
        fechas: fechas,
        datasets: datasetsPorAgente,
        nombreDeVersiones: nombreDeVersiones
    });
};

//

exports.get_root = (request, response, next) => {
    console.log('GET ROOT');
    console.log(request.session.username + request.session.isLoggedIn)
    response.render('home', {
        username: request.session.username || '',
        permisos: request.session.permisos || [],
    })
    .catch((error) => {
        console.log(error);
        
    });
};

exports.get_leads = (request, res, next)  => {
    console.log('GET LEADS');
    Lead.fetch(request.params.IDLead)
        .then(([rows,fieldData]) => {
            //console.log(NombreLead);
            //console.log(rows.length); 
            res.render ('leads', {
                csrfToken: request.csrfToken,
                registro: true,
                leads: rows,
                username: request.session.username || '',
                permisos: request.session.permisos || [],
            });
        })
        .catch((error) => {
            console.log(error);
        });

}

exports.post_eliminar_lead = (request, response, next) => {
    console.log('POST ELIMINAR LEAD');
    Lead.eliminar(request.body.IDLead)
    .then(() => {
        return Lead.fetchAll();
        
    }).then(([leads, fieldData]) => {
        return response.status(200).json({leads: leads});
    }).catch((error) => {
        console.log(error);
    });
    console.log('LEAD ELIMINADO');
}

exports.get_fechas = () => {
    console.log('GET FECHAS')
    console.log('');
    Lead
}



exports.get_modificar_lead = (request, response, next) => {
    console.log('GET MODIFICAR LEAD')
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
    console.log('POST MODIFICAR LEAD');
    try {
        // Actualiza el lead en la base de datos
        console.log(request.body);
        console.log(request.body);
        await Lead.update(request.body);

        // Envía una respuesta al cliente indicando que la operación fue exitosa
        return response.status(200).json({ message: 'Lead actualizado con éxito' });
    } catch (error) {
        // Maneja cualquier error que pueda ocurrir
        console.error(error);
        return response.status(500).json({ message: 'Hubo un error al actualizar el lead' });
    }
};




exports.post_crear_lead = async (request, response, next) => {
    console.log('POST CREAR LEAD');
    try {
        // Actualiza el lead en la base de datos
        
        console.log(request.body);
        await Lead.crear(request.body);

        // Envía una respuesta al cliente indicando que la operación fue exitosa
        return response.status(200).json({ message: 'Lead creado con éxito' });
    } catch (error) {
        // Maneja cualquier error que pueda ocurrir
        console.error(error);
        return response.status(500).json({ message: 'Hubo un error al crear el lead' });
    }
};