module.exports = (request, response, next) => {
    let canCreateLeads =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Registrar Lead') {
            canCreateLeads = true;
        }
    }
    if(canCreateLeads) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}