const db = require('../util/database');
const bcrypt = require('bcryptjs');

module.exports = class Usuario {
    constructor(mi_correo, mi_username, mi_nombre, mi_password, mi_eliminado) {
        this.correo = mi_correo;
        this.username = mi_username;
        this.nombre = mi_nombre;
        this.password = mi_password;
        this.eliminado = mi_eliminado;
    }

    save() {
        return bcrypt.hash(this.password, 12)
        .then((password_cifrado) => {
            return db.execute(
            `INSERT INTO usuario (UserName, Nombre, Password, Correo,Eliminado) 
            VALUES (?, ?, ?, ?,0)`, 
            [this.username, this.nombre, password_cifrado, this.correo]);
        })
        .catch((error) => {
            console.log(error);
        });
    }
    static async guardar_nuevo(nombre_usuario){
        return await db.execute(
            `
            I INSERT INTO usuario (Nombre,Eliminado) SELECT ?, 0
            WHERE NOT EXISTS ( SELECT 1 FROM usuario WHERE Nombre = ?)
            `,
            [nombre_usuario,nombre_usuario]
        );
    }
    static async IDversion(nombre_usuario){
        return await db.execute(
            `
            INSERT INTO usuarioIDversion (IDUsuario, IDRol, FechaUsuarioRol, FechaUsuarioRolActualizacion)
            SELECT usuario.IDUsuario, rol.IDRol, CURDATE(), CURDATE()
            FROM usuario, rol
            WHERE usuario.UserName = ? AND rol.IDRol = 1
            `,
            [nombre_usuario]
        );
    }
    
    static fetchOne(username) {
        return db.execute('Select * from usuario WHERE UserName = ?', [username]);
    }

    static fetchAll() {
        return db.execute('SELECT * FROM usuario');
    }


    static obtener_id(username){
        return db.execute('Select IDUsuario FROM Usuario Where username=?', [username]);
    }
    static asignar_rol_nuevo_usuario(idUsuario){
        return db.execute(`
        INSERT INTO usuario_tiene_rol
        (IDUsuario, IDRol, FechaUsuarioRol, FechaUsuarioRolActualizacion) 
        VALUES (?, 1, CURRENT_TIME, NULL);
        `,[idUsuario]);
    }
    static getPermisos(username) {
        return db.execute(`
            SELECT funcion.Descripcion
            FROM rol_adquiere_funcion rf
            INNER JOIN usuario_tiene_rol utr ON rf.IDRol = utr.IDRol
            INNER JOIN usuario u ON utr.IDUsuario = u.IDUsuario
            INNER JOIN funcion ON funcion.IDFuncion = rf.IDFuncion
            WHERE u.username = ?;
        `, [username]);
    }

    static obtener_id(username){
        return db.execute('Select IDUsuario FROM usuario Where username=?', [username]);
    }
    static asignar_rol_nuevo_usuario(idUsuario){
        return db.execute(`
        UPDATE usuario_tiene_rol 
        SET IDRol=1,FechaUsuarioRolActualizacion=CURRENT_DATE
        WHERE usuario_tiene_rol.IDUsuario = ?
        AND usuario_tiene_rol.IDRol = 0;
        `,[idUsuario]);
    }
    static getPermisos(username) {
        return db.execute(`
            SELECT funcion.Descripcion
            FROM rol_adquiere_funcion rf
            INNER JOIN usuario_tiene_rol utr ON rf.IDRol = utr.IDRol
            INNER JOIN usuario u ON utr.IDUsuario = u.IDUsuario
            INNER JOIN funcion ON funcion.IDFuncion = rf.IDFuncion
            WHERE u.username = ?;
        `, [username]);
    }
    static establecer_rol(IDRoles,idUsuario) {
        //const fechaCreate = date.now();
        return db.execute(`
        UPDATE usuario_tiene_rol 
        SET IDRol=?,FechaUsuarioRolActualizacion=CURRENT_DATE
        WHERE usuario_tiene_rol.IDUsuario = ?
        AND usuario_tiene_rol.IDRol = 0;`, [IDRoles, idUsuario]);
        
    }
    static eliminar_usuario(id) {
        return db.execute('UPDATE usuario SET Eliminado = 1 WHERE IDUsuario = ?', [id]);
    }

    static fetchOneID(username) {
        return db.execute('Select IDUsuario from usuario WHERE UserName = ?', [username]);
    }

    static fetchById(id) {
        return db.execute('SELECT * FROM usuario WHERE IDUsuario = ?', [id]);
    }

    static updateUsuario(id, username, correo, nombre, password) {
        return bcrypt.hash(password, 12)
            .then((password_cifrado) => {
                return db.execute(
                    `UPDATE usuario 
                    SET UserName = ?, Correo = ?, Nombre = ?, Password = ? 
                    WHERE IDUsuario = ?`, 
                    [username, correo, nombre, password_cifrado, id]
                );
            })
            .catch((error) => {
                console.log(error);
            });
    }
    
    static updateRolUsuario(id, rol) {
        return db.execute(
            `UPDATE usuario_tiene_rol
            SET IDRol = ?, FechaUsuarioRolActualizacion = CURRENT_DATE() 
            WHERE IDUsuario = ?;`, 
            [rol, id]
        );
    }
}