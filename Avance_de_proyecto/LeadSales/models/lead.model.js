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
    static fetchAll() {
        console.log(db.execute('SELECT * FROM leads'))
        return db.execute('SELECT * FROM leads')
    }
    static fetch(id) {
        console.log(id)
        if (id) {
            return this.fetchOne(id);
        } else {
            return this.fetchAll();
        }
    }
    static fetchOne(NombreLead) {
        return db.execute('Select * FROM usuario WHERE NombreLead = ?', [NombreLead]);
}
}