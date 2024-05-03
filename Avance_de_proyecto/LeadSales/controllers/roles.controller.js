const Rol = require('../models/rol.model');
const privilegios = require('../models/privilegios.model');
const Usuario = require('../models/usuario.model');
const { register } = require('module');

exports.post_eliminar = (request, response, next) => {
    console.log(request.body.IDRol)
    Rol.delete(request.body.IDRol)
        .then(([rows,fieldData]) => {
            response.redirect ('/Roles/consultas');
        }).catch((error) => {
            console.log(error)
            response.redirect ('/Roles/consultas');
        })
};


exports.post_eliminarUsuario = (req, res, next) => {
    const id = req.params.q;

    Rol.deleteUsuario(id)
        .then(() => {
            res.json({ message: 'Usuario eliminado con éxito' });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error al eliminar el usuario' });
        });
};


exports.get_modificarUsuario = (request, response, next) => {
    const id = request.params.q;
    Usuario.fetchById(id)
    .then(([rows, fieldData]) => {
        response.json(rows[0]);
    })
    .catch((error) => {
        console.log(error);
    });
}

exports.post_modificarUsuario = function(req, res) {
    var id = req.body.id; // Asegúrate de que estás enviando el ID del usuario desde el cliente
    var username = req.body.username;
    var correo = req.body.correo;
    var rol = req.body.rol;
    var nombre = req.body.nombre;
    var password = req.body.password;

    // Primero, actualiza el usuario
    Usuario.updateUsuario(id, username, correo, nombre, password)
        .then(() => {
            // Luego, actualiza el rol del usuario
            return Usuario.updateRolUsuario(id, rol);
        })
        .then(() => {
            res.send('Usuario modificado con éxito');
        })
        .catch((error) => {
            console.log(error);
            res.send('Hubo un error al modificar el usuario');
        });
};

exports.get_buscar = (req, res, next) => {
    Rol.buscar(req.params.q || '')
        .then(([rows, fieldData]) => {
            console.log(rows);
            // Mapea los resultados para formatear la fecha
            const data = rows.map(row => {
                let fecha = new Date(row.FechaUsuarioRolActualizacion);
                let fechaFormateada = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                row.FechaUsuarioRolActualizacion = fechaFormateada;
                return row;
            });

            // Obtiene todos los roles
            Rol.fetchAll()
                .then(([roles, fieldData]) => {
                    // Devuelve los datos y los roles como JSON
                    res.status(200).json({data: data, roles: roles});
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).json({error: error});
                });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({error: error});
        });
};


exports.get_mostrarRoles = (req, res, next) => {
    Rol.fetchAllParaRoles()
        .then(([rows, fieldData]) => {
            res.render('Rol', {
                registro: true,
                rol: rows,
                username: req.session.username || '',
                permisos: req.session.permisos || [],
            });
        })
        .catch((error) => {
            console.log(error);
        });
}

exports.get_agregarRol = (req, res, next) => {
    privilegios.fetchFunciones()
        .then(data => {
            // Crear un objeto para almacenar las funciones
            let funciones = {};

            // Iterar sobre los datos y agregar cada funcion y su ID al objeto funciones
            data.forEach(item => {
                if (!funciones[item.Descripcion]) {
                    funciones[item.Descripcion] = {id: item.IDFuncion};
                }
            });

            // Renderizar la vista con los datos
            res.render('agregarRol', {
                funciones: funciones,
                username: req.session.username || '',
                permisos: req.session.permisos || [],
            });
        })
        .catch((error) => {
            console.log(error);
        });
};

exports.post_agregarRol = (req, res, next) => {
    //console.log(changes);
    Rol.agregarRol(req, res)
        .then(([rows, fieldData]) => {
            res.json({message: 'Rol creado exitosamente'});
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(500).json({ message: 'Error al crear el rol' });
        });
}

exports.get_equipo = (req, res, next) => {
    let register=false;
    Rol.fetchRolesWithUsers()
        .then(([rows, fieldData]) => {
            // Mapea los resultados para formatear la fecha
            const data = rows.map(row => {
                let fecha = new Date(row.FechaUsuarioRolActualizacion);
                let fechaFormateada = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                row.FechaUsuarioRolActualizacion = fechaFormateada;
                return row;
            });

            Rol.fetchAll()
                .then(([roles, fieldData]) => {
                    res.render('equipo', {
                        username: req.session.username || '',
                        permisos: req.session.permisos || [],
                        data: data,  
                        roles: roles,
                        register: register,
                    });
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

exports.post_cambiarRol = (req, res, next) => {
    console.log(req.body);
    const idUsuario = req.body.idUsuario;
    const idRol = req.body.idRol;
    Rol.cambiarRol(idUsuario, idRol)
        .then(() => {
            res.json({ message: 'Rol cambiado con éxito' });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

exports.get_agregarEmpleado = (request, response, next) => {
    Rol.fetchAll()
    .then(([roles, fieldData]) => {
        response.json(roles);
    })
    .catch((error) => {
        console.log(error);
    });

}
exports.post_agregarEmpleado = async (request, response, next) => {
    let register=false;
    try {
        const nuevo_usuario = new Usuario(
            request.body.username || '', 
            request.body.nombre || '', 
            request.body.password || '', 
            request.body.correo || '',
            request.body.Eliminado || 0, 
        );
        await nuevo_usuario.save(request.body);
        //Rol.fetchAll();
        const idusuario = await Usuario.fetchOneID(request.body.username);
        //const idRol = await Rol.fetchOneID(request.body.rol);
        console.log(`idRol: ${request.body.rol}, idusuario: ${idusuario}`);
        await Usuario.establecer_rol(request.body.rol, idusuario);
        Rol.fetchRolesWithUsers()
        .then(([rows, fieldData]) => {
            // Mapea los resultados para formatear la fecha
            const data = rows.map(row => {
                let fecha = new Date(row.FechaUsuarioRolActualizacion);
                let fechaFormateada = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                row.FechaUsuarioRolActualizacion = fechaFormateada;
                return row;
            });

            Rol.fetchAll()
                .then(([roles, fieldData]) => {
                    register=true;
                    response.render('equipo', {
                        username: request.session.username || '',
                        permisos: request.session.permisos || [],
                        data: data,  
                        roles: roles,
                        register: register,
                    });
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        
       
    } catch (error) {
        // Maneja cualquier error que pueda ocurrir
        console.error(error);
    }
}