const privilegios = require('../models/privilegios.model');

exports.get_privilegios = (request, response, next) => {
    // Obtener el idRol de la solicitud
    let idRol = request.params.IDRol;
    console.log("idRol:",idRol);

    privilegios.fetchAll(idRol)
        .then(data => {
           // Crear un objeto para almacenar las funciones y roles
            let funcionesRoles = {};
            //console.log("idRol:",idRol);
            
            // Iterar sobre los datos y agregar cada funcion, rol y sus IDs al objeto funcionesRoles
            data.forEach(item => {
                //console.log(`Descripcion: ${item.Descripcion}, IDFuncion: ${item.IDFuncion}, IDRol: ${item.IDRol}, TipoRol: ${item.TipoRol}`);
                if (!funcionesRoles[item.Descripcion]) {
                    funcionesRoles[item.Descripcion] = {id: item.IDFuncion, roles: []};
                }
                // Si el rol tiene esta función, agregar el ID del rol y el nombre del rol al objeto
                if (item.IDRol) {
                funcionesRoles[item.Descripcion].roles.push({id: item.IDRol, nombre: item.TipoRol});
                }
            });
            
            // Obtener el nombre del rol
            let nombreRol = data.find(item => item.TipoRol !== null)?.TipoRol;
            
            
            // Renderizar la vista con el objeto funcionesRoles, maxRoles y nombresRoles
            response.render('privilegios', {
                username: request.session.username || '',
                funcionesRoles: funcionesRoles,
                nombreRol: nombreRol,
                permisos: request.session.permisos || [],
            });
        })
        .catch(error => {
            next(error);
        });
};

exports.post_privilegios = async function(request, response, next) {
    var changes = request.body;
    
    try {
        //Crear un array de objetos privilegio
        let privilegiosArray = changes.privileges.map(privilege => ({
            roleID: changes.roleID,
            privilegeID: privilege.privilegeID,
            checked: privilege.checked
        }));
            
            //se llama a la funcion actualizarPrivilegios del modelo privilegios
            await privilegios.actualizarPrivilegios(privilegiosArray);

        response.json({message: 'Cambios guardados correctamente'});
    } catch (error) {
        console.error('Error:', error);
        response.status(500).json({ message: 'Error al guardar los cambios' });
    }
};