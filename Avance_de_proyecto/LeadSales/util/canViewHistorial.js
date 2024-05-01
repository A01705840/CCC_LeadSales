module.exports = (request, response, next) => {
    let canViewHistorial =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Consultar Historial de versiones') {
            canViewHistorial = true;
        }
    }
    if(canViewHistorial) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}