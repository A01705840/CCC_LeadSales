module.exports = (request, response, next) => {
    let canViewEquipo =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Consultar cuentas de empleados') {
            canViewEquipo = true;
        }
    }
    if(canViewEquipo) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}