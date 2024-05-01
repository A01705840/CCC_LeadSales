module.exports = (request, response, next) => {
    let canPostHistorial =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Registrar importación de CSV') {
            canPostHistorial = true;
        }
    }
    if(canPostHistorial) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}