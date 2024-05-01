module.exports = (request, response, next) => {
    let canDownloadHistorial =  false;
    for (let permiso of request.session.permisos) {
        if (permiso.Descripcion == 'Descargar Historial de versiones de Leads') {
            canDownloadHistorial = true;
        }
    }
    if(canDownloadHistorial) {
        next();
    } else {
        return response.redirect('/users/logout');    
    }
}