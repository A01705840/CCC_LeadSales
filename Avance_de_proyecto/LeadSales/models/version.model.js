const db = require('../util/database');
const bcrypt = require('bcryptjs');

module.exports = class Version {
    constructor(mi_idVersion, mi_iduser, mi_fecha, mi_nombreVersion) {
        this.IDVersion = mi_idVersion;
        this.IDUser = mi_iduser;
        this.FechaCreacion = mi_fecha; // Añade esta línea
        this.NombreVersion = mi_nombreVersion;
    }

    save() { 
        return db.execute(
            `INSERT INTO version (IDVersion, IDUsuario, FechaCreacion, NombreVersion) 
                VALUES (?, ?, ?, ?)`,
            [this.IDVersion, this.IDUser, this.FechaCreacion, this.NombreVersion]
        ).catch((error) => {
            console.log(error);
        });
    }

    static async guardar_nuevo(mi_IDUsuario,mi_NombreVersion) {
    return await db.execute(
    `INSERT INTO version (IDVersion, IDUsuario, FechaCreacion, NombreVersion) 
            VALUES (DEFAULT, ?, CURRENT_TIMESTAMP, ?)`,
    [mi_IDUsuario,mi_NombreVersion]);
    }
    static max(){
    return  db.execute( `SELECT MAX(IDVersion) FROM version;`)
    }
   
    static async deleteLast(){
    await db.execute(
        `DELETE FROM version_almacena_leads
        WHERE IDVersion = (SELECT MAX(IDVersion) FROM Version)`
    );

    // Segunda consulta para eliminar de la tabla Version
    await db.execute(
        `DELETE FROM Version
        WHERE IDVersion = (SELECT MAX(IDVersion) FROM Version)`
    );
    }
    static fetchAll() {
        return db.execute(`SELECT * FROM version
         JOIN usuario ON version.IDUsuario = usuario.IDUsuario;
        `)
    }
    static fetch(id) {
        if (id) {
            return this.fetchOne(id);
        } else {
            return this.fetchAll();
        }
    }
    static fetchOne(NombreVersion) {
        return db.execute('Select * from usuario WHERE NombreVersion = ?', [NombreVersion]);
    }

    static async fetchLeadsPorIDVersion(IDVersion, pagina) {
        let tamanoPagina = 500;
        let off = (pagina - 1) * tamanoPagina;
    
        const query = `
            SELECT leads.IDLead, leads.asignado_a, leads.Telefono,
            leads.NombreLead, leads.FechaPrimerMensaje, leads.Embudo,
            leads.Etapa, leads.Status, leads.Archivado, leads.CreadoManual,
            version_almacena_leads.FechaVersionAlmacenaLead FROM version_almacena_leads
            INNER JOIN leads ON version_almacena_leads.IDLead = leads.IDLead
            WHERE version_almacena_leads.IDVersion = ?
            LIMIT ${tamanoPagina} OFFSET ${off};
        `;
        return await db.execute(query, [IDVersion]);
    }

    static async fetchAllLeadsPorIDVersion(IDVersion) {
        return db.execute(`
            SELECT leads.IDLead,leads.asignado_a,leads.Telefono, 
            leads.NombreLead,leads.FechaPrimerMensaje, leads.Embudo, 
            leads.Etapa, leads.Status, leads.Archivado,leads.CreadoManual,
            version_almacena_leads.FechaVersionAlmacenaLead FROM version_almacena_leads 
            INNER JOIN leads ON version_almacena_leads.IDLead = leads.IDLead 
            WHERE version_almacena_leads.IDVersion = ? 
        `, [IDVersion]);
    }
    static async fetchVersionInfo() {
        return db.execute(`
            SELECT IDVersion, NombreVersion
            FROM version
            ORDER BY IDVersion DESC
        `);
    }

    static async fetchNumeroTotalDeLeads(IDVersion) {
        const result = await db.execute(`
            SELECT COUNT(*) as total 
            FROM version_almacena_leads 
            WHERE IDVersion = ?
        `, [IDVersion]);
    
        return result[0][0].total;
    }

    static async Nombres(){
        return db.execute( `SELECT NombreVersion FROM version;`)
    }
    static async delete(IDVersion) {
        try {
            await db.execute('DELETE FROM version_almacena_leads WHERE IDVersion = ?', [IDVersion]);
            await db.execute('DELETE FROM version WHERE IDVersion = ?', [IDVersion]);
            await db.execute(`DELETE FROM leads
                              WHERE IDLead NOT IN (SELECT IDLead FROM version_almacena_leads)`);
            return "Delete operations completed successfully.";
        } catch (error) {
            throw error;
        }
    }    
}