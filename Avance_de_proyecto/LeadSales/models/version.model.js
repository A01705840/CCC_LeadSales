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
    static async Nombres(){
        return db.execute( `SELECT NombreVersion FROM version;`)
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
        return db.execute('Select * from version')
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
}