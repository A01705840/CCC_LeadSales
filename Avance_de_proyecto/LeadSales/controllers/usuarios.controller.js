const Usuario = require('../models/usuario.model');

const bcrypt = require('bcryptjs');
exports.get_login = (request, response, next) => {
    const error = request.session.error || '';
    request.session.error = '';
    response.render('signup', {
        username: request.session.username || '',
        registro: false,
        error: error,
        permisos: request.session.permisos || [],
    });
};

exports.post_login = (request, response, next) => {
    Usuario.fetchOne(request.body.username)
        .then(([usuarios]) => {
            if (usuarios.length == 1) {
                const usuario = usuarios[0];
                if(usuario.Eliminado == 1) {
                    request.session.error = "Usuario y/o contraseña incorrectos";
                    response.redirect('/usuario/login');
                } else {
                    bcrypt.compare(request.body.password, usuario.Password)
                    .then((doMatch) => {
                        if(doMatch) {
                            Usuario.getPermisos(usuario.UserName)
                                .then(([permisos, fieldData]) => {
                                    request.session.permisos = permisos || [];
                                    request.session.username = usuario.UserName;
                                    request.session.isLoggedIn = true;
                                    response.redirect('/lead/');
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        } else {
                            request.session.error = "Usuario y/o contraseña incorrectos";
                            response.redirect('/usuario/login');
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                }
            } else {
                request.session.error = "Usuario y/o contraseña incorrectos";
                response.redirect('/usuario/login');
            }
        })
        .catch((error) => {console.log(error);});
};

exports.get_signup = (req, res, next) => {
    res.render('signup', {
        username: req.session.username || '',
        registro: true,
    });
};

exports.post_signup = async (req, res, next) => {
    const nuevo_usuario = new Usuario(
        req.body.correo, req.body.username, req.body.name, req.body.password, req.body.Eliminado || 0
    );
    try {
        await nuevo_usuario.save();
        let userId = await Usuario.obtener_id(nuevo_usuario.username);
        userId = userId[0][0].IDUsuario;
        await Usuario.asignar_rol_nuevo_usuario(userId);
        res.redirect('/usuario/login');
    } catch (error) {
        console.log(error);
        req.sesion.error = 'Nombre de usuario ya existe';
        res.redirect('/usuario/signup');
    }    
};

exports.get_logout = (request, response, next) => {
    request.session.destroy(() => {
        response.redirect('/usuario/login'); //Este código se ejecuta cuando la sesión se elimina.
    });
};



exports.eliminar_usuario = (request, response, next) => {
    console.log(request.body.IDUsuario)
    Usuario.eliminar_usuario(request.body.IDUsuario)
    .then(([rows,fieldData]) => {
        Console.log("Registro eliminado exitosamente")
        response.redirect ('/Roles/equipo');
    }).catch((error) => {
        console.log(error)
        response.redirect ('/Roles/equipo');
    })
}

