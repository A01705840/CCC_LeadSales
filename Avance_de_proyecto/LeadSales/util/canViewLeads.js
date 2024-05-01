module.exports = (request, response, next) => {
    let canViewLeads =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Consultar leads') {
            canViewLeads = true;
        }
    }
    if(canViewLeads) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}