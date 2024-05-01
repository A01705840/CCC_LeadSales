module.exports = (request, response, next) => {
    let canEditLeads =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Modificar leads') {
            canEditLeads = true;
        }
    }
    if(canEditLeads) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}