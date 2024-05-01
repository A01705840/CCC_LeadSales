module.exports = (request, response, next) => {
    let canEditRol =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Modificar roles') {
            canEditRol = true;
        }
    }
    if(canEditRol) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}