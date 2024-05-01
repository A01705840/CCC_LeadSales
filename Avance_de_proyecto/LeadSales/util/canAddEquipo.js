module.exports = (request, response, next) => {
    let canAddEquipo =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Registrar cuenta de empleados') {
            canAddEquipo = true;
        }
    }
    if(canAddEquipo) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}