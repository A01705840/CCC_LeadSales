module.exports = (request, response, next) => {
    let canViewRol =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Consultar roles') {
            canViewRol = true;
        }
    }
    if(canViewRol) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}