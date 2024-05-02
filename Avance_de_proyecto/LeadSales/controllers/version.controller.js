const Version = require('../models/version.model');
const Version_almacena_leads = require('../models/version_almacena_leads.model');
const Lead= require('../models/lead.model');
const Usuario= require('../models/usuario.model');

const csv = require('fast-csv');
const fs = require('fs');
const { fileLoader } = require('ejs');
const { version } = require('os');
const multer = require('multer');
const { todo } = require('node:test');


function convertirFecha(fecha) {
    // Verificar si la variable fecha está definida y no es null
    if (fecha && typeof fecha === 'string') {
        // Dividir la fecha en día, mes y año
        var partes = fecha.split('/');
        var dia = partes[0];
        var mes = partes[1];
        var año = partes[2];

        // Agregar ceros iniciales si el día o el mes tienen un solo dígito
        if (dia.length === 1) {
            dia = '0' + dia;
        }
        if (mes.length === 1) {
            mes = '0' + mes;
        }

        // Devolver la fecha en el nuevo formato
        return año + '-' + mes + '-' + dia;
    } else {
        // Devolver null u otra indicación de que la fecha no es válida
        return null;
    }
}

const jsPDF = require('jspdf').jsPDF;
const autoTable = require('jspdf-autotable');
const Rol = require('../models/rol.model');

exports.get_historial = (req, res, next) => {
    Version.fetch(req.params.IDVersion)
    Version.fetch(req.params.IDUser)
        .then(([rows, fieldData]) => {
            res.render('historial', {
                csrfToken: req.csrfToken,
                registro: true,
                versiones: rows,
                username: req.session.username || '',
                permisos: req.session.permisos || [],
                FileTypeError: false,
                Succes: false,
                FormatTypeError: false,
            });
        })
        .catch((error) => {
            console.log(error);
        });
}

exports.post_historial = async (req, res, next) => {
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
    let fila = 0;
    let posiciones;
    let todosPresentes;
    let exito;
    let falla;
    //let arrayBeforeNull = [];
    let lastIDResult;
    let lastID;
    if (req.file.mimetype == 'text/csv') {
        csv.parseFile(req.file.path)
            .on("data", async function (rowData) {
                if (fila == 1) {
                    fila++;
                    if(todosPresentes){
                        //arrayBeforeNull.push(rowData[posiciones[1]]);
                    try {
                        if (rowData[posiciones[8]] === 'TRUE') {
                            rowData[posiciones[8]] = 1;
                        } else if (rowData[posiciones[8]] == 'FALSE') {
                            rowData[posiciones[8]] = 0;
                        } if (rowData[posiciones[7]] =='Si') {
                            rowData[posiciones[7]] = 1;
                        } else if (rowData[posiciones[7]] == 'No') {
                            rowData[posiciones[7]] = 0;
                        }
                        if (rowData[posiciones[1]]===''){
                            rowData[posiciones[1]]=null;
                        }
                        else{
                           rowData[posiciones[1]]= rowData[posiciones[1]].split(' ').join('');
                        }
                        rowData[posiciones[3]] = convertirFecha(rowData[posiciones[3]]);
                        // Ejecutar ambas consultas y esperar a que se completen
                        const [usuarioResult, leadResult, asignarRolResult] =await Promise.all([
                            Usuario.guardar_nuevo(rowData[posiciones[0]]),
                            Lead.guardar_nuevo(rowData[posiciones[0]], rowData[posiciones[1]], rowData[posiciones[2]], rowData[posiciones[3]], rowData[posiciones[4]], rowData[posiciones[5]], rowData[posiciones[6]], rowData[posiciones[7]], rowData[posiciones[8]])
                        ]); 
                        lastIDResult = await Lead.fetchlastID();
                        lastID = Number(lastIDResult[0][0].IDLead);
                    } catch (error) { console.log(error); }
                    try {
                        const patterns = {
                            MXDIF: regexDIF,
                            MXCHH: regexCHH,
                            MXJAL: regexJAL,
                            MXNLE: regexMXNLE,
                            MXNPUE: regexMXNPUE,
                            MXYUC: regexMXYUC,
                            MXCOA: regexMXCOA,
                            MXAGU: regexMXAGU,
                            MXSON: regexMXSON,
                            MXBCN: regexMXBCN,
                            MXBCS: regexMXBCS,
                            MXQUE: regexMXQUE,
                            MXMIC: regexMXMIC,
                            MXDUR: regexMXDUR,
                            MXCHP: regexMXCHP,
                            MXVER: regexMXVER,
                            MXNAY: regexMXNAY,
                            MXTAB: regexMXTAB,
                            MXTAM: regexMXTAM,
                            MXMOR: regexMXMOR,
                            MXOAX: regexMXOAX,
                            MXHID: regexMXHID,
                            MXCAM: regexMXCAM,
                            MXSLP: regexMXSLP,
                            MXMEX: regexMXMEX,
                            MXROO: regexMXROO,
                            MXCOL: regexMXCOL,
                            MXZAC: regexMXZAC,
                            MXGUA: regexMXGUA,
                            MXTLA: regexMXTLA,
                            MXGRO: regexMXGRO,
                            MXSIN: regexMXSIN
                        };
                    
                        lastID++;
                    
                        let estadoEncontrado = null;
                        for (const estado in patterns) {
                            if (patterns[estado].test(rowData[posiciones[1]])) {
                                estadoEncontrado = estado;
                                break;
                            }
                        }
                        if (estadoEncontrado) {
                            Lead.guardar_estadolada(estadoEncontrado, lastID);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                    
                    }
                
                }
                if (fila > 1) {
                    if(todosPresentes){
                        //arrayBeforeNull.push(rowData[posiciones[1]]);
                    try {
                        if (rowData[posiciones[8]] === 'TRUE') {
                            rowData[posiciones[8]] = 1;
                        } else if (rowData[posiciones[8]] == 'FALSE') {
                            rowData[posiciones[8]] = 0;
                        } if (rowData[posiciones[7]] =='Si') {
                            rowData[posiciones[7]] = 1;
                        } else if (rowData[posiciones[7]] == 'No') {
                            rowData[posiciones[7]] = 0;
                        }
                        if (rowData[posiciones[1]]===''){
                            rowData[posiciones[1]]=null;
                        }
                        else{
                           rowData[posiciones[1]]= rowData[posiciones[1]].split(' ').join('');
                        }
                        rowData[posiciones[3]] = convertirFecha(rowData[posiciones[3]]);
                        // Ejecutar ambas consultas y esperar a que se completen
                        const [usuarioResult, leadResult, asignarRolResult] =await Promise.all([
                            Usuario.guardar_nuevo(rowData[posiciones[0]]),
                            Lead.guardar_nuevo(rowData[posiciones[0]], rowData[posiciones[1]], rowData[posiciones[2]], rowData[posiciones[3]], rowData[posiciones[4]], rowData[posiciones[5]], rowData[posiciones[6]], rowData[posiciones[7]], rowData[posiciones[8]])
                        ]); 
                    } catch (error) { console.log(error); }
                    try {
                        const patterns = {
                            MXDIF: regexDIF,
                            MXCHH: regexCHH,
                            MXJAL: regexJAL,
                            MXNLE: regexMXNLE,
                            MXNPUE: regexMXNPUE,
                            MXYUC: regexMXYUC,
                            MXCOA: regexMXCOA,
                            MXAGU: regexMXAGU,
                            MXSON: regexMXSON,
                            MXBCN: regexMXBCN,
                            MXBCS: regexMXBCS,
                            MXQUE: regexMXQUE,
                            MXMIC: regexMXMIC,
                            MXDUR: regexMXDUR,
                            MXCHP: regexMXCHP,
                            MXVER: regexMXVER,
                            MXNAY: regexMXNAY,
                            MXTAB: regexMXTAB,
                            MXTAM: regexMXTAM,
                            MXMOR: regexMXMOR,
                            MXOAX: regexMXOAX,
                            MXHID: regexMXHID,
                            MXCAM: regexMXCAM,
                            MXSLP: regexMXSLP,
                            MXMEX: regexMXMEX,
                            MXROO: regexMXROO,
                            MXCOL: regexMXCOL,
                            MXZAC: regexMXZAC,
                            MXGUA: regexMXGUA,
                            MXTLA: regexMXTLA,
                            MXGRO: regexMXGRO,
                            MXSIN: regexMXSIN
                        };
                    
                        lastID++;
                    
                        let estadoEncontrado = null;
                        for (const estado in patterns) {
                            if (patterns[estado].test(rowData[posiciones[1]])) {
                                estadoEncontrado = estado;
                                break;
                            }
                        }
                        if (estadoEncontrado) {
                            Lead.guardar_estadolada(estadoEncontrado, lastID);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                    
                    }
                
                }
                else{
                    fila++;
                    todosPresentes = ['Asignado a','Teléfono','Nombre','Fecha de primer mensaje','Embudo', 'Etapa', 'Status', 'Archivado', 'Creado Manualmente'].every(elemento => rowData.includes(elemento));
                    const elementosBuscados = ['Asignado a','Teléfono','Nombre','Fecha de primer mensaje','Embudo', 'Etapa', 'Status', 'Archivado', 'Creado Manualmente'];
                    posiciones = elementosBuscados.map(elemento => rowData.indexOf(elemento));
                    if(!todosPresentes){
                        falla=true;
                        exito=false;
                    }
                    else{
                        falla=false;
                        exito=true;
                        await Version.guardar_nuevo(1, req.body.versionName);  
                    }
                }
            })
            .on("end", async function () {
                fs.unlinkSync(req.file.path);
                console.log("Registros guardados exitosamente");
                Version.fetch(req.params.IDVersion)
                Version.fetch(req.params.IDUser)
                    .then(([rows, fieldData]) => {
                        console.log(rows.length);
                        res.render('historial', {
                            csrfToken: req.csrfToken,
                            registro: true,
                            versiones: rows,
                            username: req.session.username || '',
                            permisos: req.session.permisos || [],
                            FileTypeError:  false,
                            Succes: exito,
                            FormatTypeError: falla,
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            })
            .on("error", function (error) {
                console.log(error);
                fs.unlinkSync(req.file.path);
                res.redirect('/lead/historial');
            });
    } 
    else {
        console.error('Se intentó subir un archivo con un tipo MIME incorrecto:', req.file.originalname);
        fs.unlinkSync(req.file.path);
        Version.fetch(req.params.IDVersion)
        Version.fetch(req.params.IDUser)
            .then(([rows, fieldData]) => {
                console.log(rows.length);
                res.render('historial', {
                    csrfToken: req.csrfToken,
                    registro: true,
                    versiones: rows,
                    username: req.session.username || '',
                    permisos: req.session.permisos || [],
                    FileTypeError: true,
                    Succes: false,
                    FormatTypeError: false,
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }
};
exports.post_descargarhistorial = async (req, res, next) => {
    let doc = new jsPDF();
    let body = req.body.map(version => [version.IDVersion, version.NombreVersion, version.IDUsuario, version.FechaCreacion]);
    doc.autoTable({
        head: [['IDVersion', 'NombreVersion', 'IDUsuario', 'FechaCreacion']],
        body: body
    });

    let pdf = doc.output('arraybuffer');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=historial.pdf');

    res.send(Buffer.from(pdf));
};