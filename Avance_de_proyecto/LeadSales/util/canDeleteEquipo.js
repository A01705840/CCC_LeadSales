module.exports = (request, response, next) => {
    let canDeleteEquipo =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Eliminar cuenta de empleado') {
            canDeleteEquipo = true;
        }
    }
    if(canDeleteEquipo) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}
