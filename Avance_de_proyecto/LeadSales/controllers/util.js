// utils.js

// Función para calcular la fecha de inicio y la fecha de fin
exports.calcularRangoFechas = function(seleccion) {
    //console.log("SELECCION",seleccion);
    var ahora = new Date(2023, 0, 1); // Fecha actual
    var inicio;
    var fin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()); // Un día antes del último día

    //Convertir seleccion a entero
    seleccion = parseInt(seleccion);
    switch (seleccion) {
        case 1:
            inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 6);
            break;
        case 2:
            inicio = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
            break;
        case 3:
            inicio = new Date(ahora.getFullYear(), ahora.getMonth() - 6, ahora.getDate());
            break;
        case 4:
            inicio = new Date(ahora.getFullYear() - 1, ahora.getMonth(), ahora.getDate());
            break;
        default:
            inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 6);
    }
    return { inicio: inicio, fin: fin };
};

// convertirRangoFechas ejemplo de output: INICIO 2022-12-25T06:00:00.000Z, FIN 2022-12-31T06:00:00.000Z


// Función para generar un array de fechas que representen todos los días en el rango de fechas seleccionado
exports.generarFechas = function(inicio, fin) {
    var fechas = [];
    var fechaActual = new Date(inicio);
    while (fechaActual <= fin) {
        fechas.push(new Date(fechaActual));
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
    return fechas;
};

/*
Ejemplo de output FECHAS (semana) [
  2022-12-25T06:00:00.000Z,
  2022-12-26T06:00:00.000Z,
  2022-12-27T06:00:00.000Z,
  2022-12-28T06:00:00.000Z,
  2022-12-29T06:00:00.000Z,
  2022-12-30T06:00:00.000Z,
  2022-12-31T06:00:00.000Z
]
*/

// Función para agrupar los leads por agente
exports.agruparLeadsPorAgente = function(leadsPorAgente) {
    return leadsPorAgente.reduce((grupos, item) => {
        var grupo = grupos[item.Agente] || [];
        grupo.push(item);
        grupos[item.Agente] = grupo;
        return grupos;
    }, {});
};

/* GRUPOS {
  'Paulina Garcia': [
    {
      Fecha: 2022-12-25T06:00:00.000Z,
      Agente: 'Paulina Garcia',
      CantidadLeads: 2
    },
    {
      Fecha: 2022-12-26T06:00:00.000Z,
      Agente: 'Paulina Garcia',
      CantidadLeads: 2
    },
    {
      Fecha: 2022-12-27T06:00:00.000Z,
      Agente: 'Paulina Garcia',
      CantidadLeads: 6
    }
  ],
 */

// Función para crear un conjunto de datos para cada agente
exports.generarDatasetsPorAgente = function(gruposPorAgente, fechas) {
    return Object.keys(gruposPorAgente).map(agente => {
        var grupo = gruposPorAgente[agente];
        var datos = fechas.map(fecha => {
            var item = grupo.find(item => {
                var fechaItem = new Date(item.Fecha);
                return fechaItem.getTime() === fecha.getTime();
            });
            return item ? item.CantidadLeads : 0; // Si no hay item, asignar 0
        });
        console.log("AGENTE", agente);
        console.log("DATOS", datos);
        return {
            agente,
            datos,
        };
    });
};

/*

AGENTE Paulina Garcia
DATOS [
  2, 6, 6, 2,
  2, 0, 0
]
AGENTE Alex Serrano
DATOS [
  4, 0, 0, 0,
  2, 2, 0
]

*/

exports.generarLeadsConDiasSinLeads = function(leadsPorDia, fechas) {

    // Crear un nuevo array de leads que incluya los días sin leads
    let leadsConDiasSinLeads = fechas.map(fecha => {
        // Buscar el lead para esta fecha
        let lead = leadsPorDia.find(lead => new Date(lead.Fecha).getTime() === fecha.getTime());

        // Si se encuentra un lead, usar la cantidad de leads, de lo contrario usar 0
        return { Fecha: fecha, CantidadLeads: lead ? lead.CantidadLeads : 0 };
    });

    return leadsConDiasSinLeads;
};

exports.generarLeadsConMesesSinLeads = function(leadsPorMes, fechas) {
    // Mapear las fechas a un objeto donde la clave es el mes y el valor es la cantidad de leads
    let leadsPorMesMap = {};
    leadsPorMes.forEach(lead => {
        const fecha = new Date(lead.Fecha);
        const mes = fecha.getFullYear() + '-' + (fecha.getMonth() + 1);
        leadsPorMesMap[mes] = lead.CantidadLeads;
    });

    // Mapear las fechas a un array de objetos con la fecha y la cantidad de leads
    let leadsConMesesSinLeads = fechas.map(fecha => {
        const mes = fecha.getFullYear() + '-' + (fecha.getMonth() + 1);
        return {
            Fecha: fecha,
            CantidadLeads: leadsPorMesMap[mes] || 0
        };
    });

    return leadsConMesesSinLeads;
};