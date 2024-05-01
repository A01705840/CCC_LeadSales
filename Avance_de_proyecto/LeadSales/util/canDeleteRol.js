module.exports = (request, response, next) => {
    let canDeleteRol=  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Eliminar roles') {
            canDeleteRol = true;
        }
    }
    if(canDeleteRol) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}