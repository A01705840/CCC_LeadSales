const Usuario = require('../models/usuario.model');

const bcrypt = require('bcryptjs');
exports.get_login = (request, response, next) => {
    const error = request.session.error || '';
    request.session.error = '';
    console.log('GET LOGIN');
    console.log('SESSION' + JSON.stringify(request.session));
    console.log('BODY' + JSON.stringify(request.body));
    response.render('signup', {
        username: request.session.username || '',
        registro: false,
        error: error,
        permisos: request.session.permisos || [],
    });
};

exports.post_login = (request, response, next) => {
    console.log('POST LOGIN');
    console.log('BODY' + JSON.stringify(request.body));
    Usuario.fetchOne(request.body.username)
        .then(([usuarios]) => {
            if (usuarios.length == 1) {
                const usuario = usuarios[0];
                bcrypt.compare(request.body.password, usuario.Password)
                    .then((doMatch) => {
                        if(doMatch) {
                            console.log('CONTRASEÑA CORRECTA')
                            Usuario.getPermisos(usuario.UserName)
                                .then(([permisos, fieldData]) => {
                                    request.session.permisos = permisos || [];
                                    request.session.username = usuario.UserName;
                                    request.session.isLoggedIn = true;
                                    console.log('SESSION' + JSON.stringify(request.session));
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
    console.log('GET SIGNUP');
    res.render('signup', {
        username: req.session.username || '',
        registro: true,
    });
};

exports.post_signup = (req, res, next) => {
    console.log('POST SIGNUP')
    console.log('BODY' + JSON.stringify(req.body));
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

