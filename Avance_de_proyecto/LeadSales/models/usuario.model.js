const db = require('../util/database');
const bcrypt = require('bcryptjs');

module.exports = class Usuario {
    //Constructor de la clase. Sirve para crear un nuevo objeto, y en él se definen las propiedades del modelo
    constructor(mi_correo, mi_username, mi_nombre, mi_password) {
        this.correo = mi_correo;
        this.username = mi_username;
        this.nombre = mi_nombre;
        this.password = mi_password;
        this.correo = mi_correo;
    }
    //Este método servirá para guardar de manera persistente el nuevo objeto. 
    save() {
        return bcrypt.hash(this.password, 12)
        .then((password_cifrado) => {
            return db.execute(
            `INSERT INTO usuario (username, nombre, password, correo) 
            VALUES (?, ?, ?, ?)`, 
            [this.username, this.nombre, password_cifrado, this.correo]);
        })
        .catch((error) => {
            console.log(error);
        });
    }
    static async guardar_nuevo(nombre_usuario){
        return await db.execute(
            `
            INSERT INTO usuario (Nombre) SELECT ?
            WHERE NOT EXISTS ( SELECT 1 FROM usuario WHERE Nombre = ? )
            `,
            [nombre_usuario,nombre_usuario]
        );
    }
    static async _tiene_rol(nombre_usuario){
        return await db.execute(
            `
            INSERT INTO usuario_tiene_rol (IDUsuario, IDRol, FechaUsuarioRol, FechaUsuarioRolActualizacion)
            SELECT usuario.IDUsuario, rol.IDRol, CURDATE(), CURDATE()
            FROM usuario, rol
            WHERE usuario.UserName = ? AND rol.IDRol = 3
            `,
            [nombre_usuario]
        );
    }
    
    static fetchOne(username) {
        return db.execute('Select * from usuario WHERE UserName = ?', [username]);
    }
    
    static getPermisos(username) {
        return db.execute(`
            SELECT f.Descripcion
            FROM funcion f, rol_adquiere_funcion r_a_f, rol r, usuario_tiene_rol u_t_r, usuario u
            WHERE u.UserName = ? AND u.IDUsuario = u_t_r.IDUsuario AND
            u_t_r.IDRol = r.IDRol AND r.IDRol = r_a_f.IDRol AND r_a_f.IDFuncion= f.IDFuncion
        `, [username]);
    }

    static fetchAll() {
        return db.execute('SELECT * FROM usuario');
    }

    static eliminar_usuario(id) {
        return db.execute('DELETE FROM usuario WHERE IDUsuario = ?', [id]);
    }

    static establecer_rol(IDRoles,idUsuario) {
        //const fechaCreate = date.now();
        return db.execute('INSERT INTO `usuario_tiene_rol` (`IDUsuario`, `IDRol`, `FechaUsuarioRol`, `FechaUsuarioRolActualizacion`) VALUES (?, ?, CURRENT_DATE(), CURRENT_DATE());', [IDRoles, idUsuario]);
        
    }

    static fetchOneID(username) {
        return db.execute('Select IDUsuario from usuario WHERE username = ?', [username]);
    }

    static fetchAll() {
        return db.execute('SELECT * FROM usuario');
    }

    static eliminar_usuario(id) {
        return db.execute('DELETE FROM usuario WHERE IDUsuario = ?', [id]);
    }

    static establecer_rol(IDRoles,idUsuario) {
        //const fechaCreate = date.now();
        return db.execute('INSERT INTO `usuario_tiene_rol` (`IDUsuario`, `IDRol`, `FechaUsuarioRol`, `FechaUsuarioRolActualizacion`) VALUES (?, ?, CURRENT_DATE(), CURRENT_DATE());', [IDRoles, idUsuario]);
        
    }

    static fetchOneID(username) {
        return db.execute('Select IDUsuario from usuario WHERE username = ?', [username]);
    }
}