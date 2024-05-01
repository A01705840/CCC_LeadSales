module.exports = (request, response, next) => {
    let canViewGraficas =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Consultar reporte de leads') {
            canViewGraficas = true;
        }
    }
    if(canViewGraficas) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}