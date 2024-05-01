module.exports = (request, response, next) => {
    let canDownloadLeads =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Descargar Historial de versiones de Leads') {
            canDownloadLeads = true;
        }
    }
    if(canDownloadLeads) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}