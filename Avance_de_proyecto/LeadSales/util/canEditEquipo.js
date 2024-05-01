module.exports = (request, response, next) => {
    let canEditEquipo =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Modificar cuentas empleados') {
            canEditEquipo = true;
        }
    }
    if(canEditEquipo) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}