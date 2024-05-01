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
                bcrypt.compare(request.body.password, usuario.Password)
                    .then((doMatch) => {
                        if(doMatch) {
                            Usuario.getPermisos(usuario.UserName)
                                .then(([permisos, fieldData]) => {
                                    request.session.permisos = permisos || [];
                                    console.log(request.session.permisos);
                                    request.session.username = usuario.UserName;
                                    request.session.isLoggedIn = true;
                                    response.redirect('/lead/analitica');
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

exports.post_signup = (req, res, next) => {
    const nuevo_usuario = new Usuario(
        req.body.correo, req.body.username, req.body.name, req.body.password
    );
    nuevo_usuario.save()
        .then(() => {
            return Usuario._tiene_rol(req.body.username);
        })
        .then(() => {
            res.redirect('/usuario/login');
        })
        .catch((error) => {
            console.log(error);
            req.sesion.error = 'Nombre de usuario ya existe';
            res.redirect('/usuario/signup');
        });
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

