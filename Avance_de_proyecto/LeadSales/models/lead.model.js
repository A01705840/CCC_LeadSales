const db = require('../util/database');
const bcrypt = require('bcryptjs');



module.exports = class Lead {
    constructor(mi_idLead, mi_asignado_a, mi_telefono, mi_nombreLead, mi_FechaPrimerMensaje, mi_Embudo, mi_Etapa, mi_Status, mi_Archivado, mi_CreadoManual) {
        this.IDLead = mi_idLead;
        this.asignado_a = mi_asignado_a;
        this.Telefono = mi_telefono;
        this.NombreLead = mi_nombreLead;
        this.FechaPrimerMensaje = mi_FechaPrimerMensaje;
        this.Embudo = mi_Embudo;
        this.Etapa = mi_Etapa;
        this.Status = mi_Status;
        this.Archivado = mi_Archivado;
        this.CreadoManual = mi_CreadoManual;
    }

    save() {
        return toString(this.Embudo)
        .then((Embudo) => {
            return db.execute(
                `INSERT INTO leads (IDLead, asignado_a, Telefono, NombreLead, FechaPrimerMensaje, Embudo, Etapa, Status, Archivado, CreadoManual) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
                [this.IDLead, this.asignado_a, this.Telefono, this.NombreLead, this.FechaPrimerMensaje, this.Embudo, this.Etapa, this.Status, this.Archivado, this.CreadoManual]);
            })
            .catch((error) => {
                console.log(error);
            });
        }

    static guardar_nuevo(mi_asignado_a,mi_telefono,mi_nombreLead,mi_FechaPrimerMensaje,mi_Embudo,mi_Etapa,mi_Status,mi_Archivado,mi_CreadoManual){
        return db.execute(`INSERT INTO leads (asignado_a, Telefono, NombreLead, FechaPrimerMensaje, Embudo, Etapa, Status, Archivado, CreadoManual) 
        VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
        [mi_asignado_a,mi_telefono,mi_nombreLead,mi_FechaPrimerMensaje,mi_Embudo,mi_Etapa,mi_Status,mi_Archivado,mi_CreadoManual])
    }  
    static max(){
        return db.execute(`SELECT MAX(IDLead) FROM leads;`)
    }  
        static async fetchAll() {
            console.log(db.execute('SELECT * FROM leads'))
            return await db.execute('SELECT * FROM leads')
        }
        static fetch(id) {
        console.log(id)
        if (id) {
            return this.fetchOne(id);
        } else {
            return this.fetchAll();
        }
    }

    static async fetchLeadsByDay(range) {
        const endDate = new Date(2023, 0, 1); 
        let startDate = new Date(endDate); // Crea una copia de endDate
        let groupBy;

        switch (parseInt(range)) {
            case 1:
                startDate.setDate(endDate.getDate() - 7); // Una semana antes de la fecha actual
                groupBy = 'DAY';
                break;
            case 2:
                startDate.setMonth(endDate.getMonth() - 1); // Un mes antes de la fecha actual
                groupBy = 'DAY';
                break;
            case 3:
                startDate.setMonth(endDate.getMonth() - 6); // Seis meses antes de la fecha actual
                groupBy = 'MONTH';
                break;
            case 4:
                startDate.setFullYear(endDate.getFullYear() - 1); // Un año antes de la fecha actual
                groupBy = 'MONTH';
                break;
            default:
                throw new Error('Invalid range');
        }
    
        const query = `
            SELECT DATE(FechaPrimerMensaje) as Fecha, COUNT(*) as CantidadLeads 
            FROM leads 
            WHERE FechaPrimerMensaje >= ? AND FechaPrimerMensaje < ?
            GROUP BY ${groupBy}(FechaPrimerMensaje)
        `;
        return await db.execute(query, [startDate, endDate]);
    }
    
    static async obtenerCantidadLeads() {
        const [rows] = await db.execute('SELECT COUNT(*) AS cantidad FROM leads');
        return rows[0].cantidad;
    }
    
    static async obtenerCantidadLeadsOrganicos() {
        const [rows] = await db.execute('SELECT COUNT(*) AS cantidad FROM leads WHERE CreadoManual = 0');
        return rows[0].cantidad;
    }

    static async obtenerCantidadLeadsEmbudos() {
        return db.execute('SELECT Embudo, COUNT(*) AS TotalLeads FROM leads GROUP BY Embudo;')
    }

    static async obtenerCantidadLeadsStatus() {
        return db.execute('SELECT Status, COUNT(*) AS TotalLeads FROM leads GROUP BY Status;')
    }

    static async fetchLeadsPorAgente(rangeAgent) {
        const endDate = new Date(2023, 0, 1); // Fecha actual
        let startDate = new Date(endDate); // Crea una copia de endDate
        let groupBy;
        console.log(rangeAgent);
    
        switch (parseInt(rangeAgent)) {
            case 1:
                startDate.setDate(endDate.getDate() - 7); // Una semana antes de la fecha actual
                groupBy = 'DAY';
                break;
            case 2:
                startDate.setMonth(endDate.getMonth() - 1); // Un mes antes de la fecha actual
                groupBy = 'DAY';
                break;
            default:
                throw new Error('Invalid range');
        }
    
        const query = `
            SELECT DATE(FechaPrimerMensaje) AS Fecha, asignado_a AS Agente, COUNT(*) as CantidadLeads 
            FROM leads 
            WHERE FechaPrimerMensaje >= ? AND FechaPrimerMensaje < ?
            GROUP BY Fecha, asignado_a, ${groupBy}(FechaPrimerMensaje)
        `;
        return await db.execute(query, [startDate, endDate]);
    }

    static async fetchLeadsPorAgenteAgrupadosPorMes(rangeAgent) {
        const endDate = new Date(2023, 0, 1); // Fecha actual
        let startDate = new Date(endDate); // Crea una copia de endDate
    
        switch (parseInt(rangeAgent)) {
            case 3:
                startDate.setMonth(endDate.getMonth() - 6); // Seis meses antes de la fecha actual
                break;
            case 4:
                startDate.setFullYear(endDate.getFullYear() - 1); // Un año antes de la fecha actual
                break;
            default:
                throw new Error('Invalid range');
        }
    
        const query = `
            SELECT DATE_FORMAT(FechaPrimerMensaje, '%Y-%m') AS Fecha, asignado_a AS Agente, COUNT(*) as CantidadLeads 
            FROM leads
            WHERE FechaPrimerMensaje >= ? AND FechaPrimerMensaje < ?
            GROUP BY Fecha, asignado_a
            ORDER BY Fecha, asignado_a
        `;
        const [rows] = await db.execute(query, [startDate, endDate]);
    
        // Crear un conjunto de todas las fechas y agentes únicos
        let fechas = [...new Set(rows.map(row => row.Fecha))];
        let agentes = [...new Set(rows.map(row => row.Agente))];
    
        // Crear un conjunto de datos para cada agente
        let datasets = agentes.map(agente => {
            let datos = fechas.map(fecha => {
                // Encontrar la fila correspondiente a esta fecha y agente
                let row = rows.find(row => row.Fecha === fecha && row.Agente === agente);
                // Si se encuentra una fila, usar la cantidad de leads, de lo contrario usar 0
                return row ? row.CantidadLeads : 0;
            });
            return { agente, datos };
        });
        
        return { startDate, endDate, fechas, datasets };
    }
    
    static fetchOne(NombreLead) {
        return db.execute('Select * FROM usuario WHERE NombreLead = ?', [NombreLead]);
    }
    static fetchOneLeadbyid(id) {
        return db.execute('Select * FROM leads WHERE IDLead = ?', [id]);
    }

    static update(data) {
        console.log('update');
        console.log(data);
        return db.execute('UPDATE leads SET asignado_a = ?, Telefono = ?, NombreLead = ?, FechaPrimerMensaje = ?, Embudo = ?, Etapa = ?, Status = ?, Archivado = ?, CreadoManual = ? WHERE IDLead = ?',
            [data.asignado_a, data.telefono, data.nombre, data.fecha, data.embudo, data.etapa, data.status, data.archivado, data.creadomanual, data.id]);
    }

    static crear(data) {
        return db.execute('INSERT INTO leads (asignado_a, Telefono, NombreLead, FechaPrimerMensaje, Embudo, Etapa, Status, Archivado, CreadoManual) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [data.asignado_a, data.telefono, data.nombre, data.fecha, data.embudo, data.etapa, data.status, data.archivado, data.creadomanual]);
    }

    static async eliminar(id) {
        await db.execute('DELETE FROM version_almacena_leads WHERE IDLead = ?', [id]);         
        return db.execute('DELETE FROM leads WHERE IDLead = ?', [id]);
    }

    static obtenerCantidadLeadsPorAgente() {
        return db.execute('SELECT asignado_a AS Seller, COUNT(*) AS TotalLeads FROM leads GROUP BY asignado_a ORDER BY TotalLeads DESC LIMIT 3;');
    }
    
}