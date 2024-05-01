module.exports = (request, response, next) => {
    let canAddRol =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Registrar roles') {
            canAddRol = true;
        }
    }
    if(canAddRol) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}