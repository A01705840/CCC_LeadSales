module.exports = (request, response, next) => {
    let canDeleteLeads =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Eliminar leads') {
            canDeleteLeads = true;
        }
    }
    if(canDeleteLeads) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}