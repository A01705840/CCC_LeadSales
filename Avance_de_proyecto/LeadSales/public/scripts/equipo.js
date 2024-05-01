function cambiarRol(idUsuario) {
    console.log('La función cambiarRol se ha llamado');
    var idRol = document.getElementById('rol-' + idUsuario).value;
    fetch('/Roles/cambiarRol', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idUsuario: idUsuario, idRol: idRol }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        location.reload(); 
    })
    .catch((error) => {
        console.error('Error:', error);
    });

}

const buscar = () => {
    const input = document.getElementById('search');
    console.log("Buscando: " + input.value);
    if(input.value=="Usuario no registrado"){
        input.value=null;
    }
    if(input.value==''){
        input.value=null;
        console.log("Se cumple");
    }
    console.log("Buscando nuevo:"+input.value);
    fetch('/Roles/buscar/' + input.value, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data);
        let table = document.querySelector('.bg-grey-light');
        let html = '';

    data.data.forEach(function(item) {
        html += `
        <tr class="flex w-full mb-4 hover:bg-gray-100">
            <td class="p-4 w-1/5">${item.Nombre}</td>
            <td class="p-4 w-1/5" style="padding-right: 40px;">
                <select id="rol-${item.IDUsuario}" onchange="cambiarRol('${item.IDUsuario}')" class="px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">`;

        // Añade cada rol al select
        data.roles.forEach(function(rol) {
            html += `<option value="${rol.IDRol}" ${rol.IDRol === item.IDRol ? 'selected' : ''}>${rol.TipoRol}</option>`;
        });

        html += `</select>
            </td>
            <td class="p-4 w-1/5" style="padding-left: 70px;">${item.FechaUsuarioRolActualizacion}</td>
            <td class="p-4 w-1/5">
                <button type="button" onclick="abrirModalModificarUsuario('${item.IDUsuario}')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">
                    Modificar
                </button>
            </td>
            <td class="p-4 w-1/5">
                <form action="/Roles/eliminarUsuario" method="POST">
                    <input type="hidden" name="IDUsuario" value="${item.IDUsuario}">
                    <button type="submit" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded">
                        Eliminar
                    </button>
                </form>
            </td>
        </tr>`;
    });

    table.innerHTML = html;
   
    }).catch((error) => {
        console.log(error);
    });
};

document.getElementById('search').addEventListener('input', buscar);


function abrirModalModificarUsuario(idUsuario) {
    $.ajax({
        url: '/Roles/modificarUsuario/' + idUsuario, // Incluye idUsuario en la URL
        method: 'GET',
        success: function(data) {
            console.log(data);
            // Llena los campos del formulario en el modal con los datos del usuario
            $('#usernameModificar').val(data.UserName);
            $('#correoModificar').val(data.Correo);
            $('#nombreModificar').val(data.Nombre);

            // Guarda el ID del usuario en el botón "Guardar cambios"
            $('#botonGuardarModificar').data('id', idUsuario);

            // Muestra el modal
            var modal = document.getElementById('modalModificar');
            modal.style.display = 'flex';
        }
    });
}

function cerrarModalModificar() {
    var modal = document.getElementById('modalModificar');
    modal.style.display = 'none';
}

$('#botonGuardarModificar').click(function(e) {
    e.preventDefault();

    var id = $(this).data('id'); 
    var username = $('#usernameModificar').val();
    var correo = $('#correoModificar').val();
    var rol = $('#rolModificar').val();
    var nombre = $('#nombreModificar').val();
    var password = $('#passwordModificar').val();
    var repeatPassword = $('#repeat-passwordModificar').val();

    // Verifica que las contraseñas coincidan
    if (password !== repeatPassword) {
        swal('Error', 'Las contraseñas no coinciden', 'error');
        return;
    }

    $.ajax({
        url: '/Roles/modificarUsuario',
        method: 'POST',
        data: {
            id: id,
            username: username,
            correo: correo,
            rol: rol,
            nombre: nombre,
            password: password
        },
        success: function(response) {
            // Muestra un mensaje de éxito
        swal('Guardado', 'Los cambios se han guardado.', 'success')
        .then(() => {
            // Cierra el modal y actualiza la página
            cerrarModalModificar();
            location.reload();
        }); 
        }
    });
});


function eliminarUsuario(id) {
    swal({
        title: '¿Estás seguro?',
        text: 'Una vez eliminado, no podrás recuperar este usuario!',
        icon: 'warning',
        buttons: true,
        dangerMode: true,
    })
    .then((willDelete) => {
        if (willDelete) {
            $.ajax({
                url: '/Roles/eliminarUsuario/' + id,
                method: 'POST',
                success: function(response) {
                    // Muestra un mensaje de éxito
                    swal('Eliminado', response.message, 'success')
                        .then(() => {
                            // Actualiza la página
                            location.reload();
                        });
                },
                error: function(error) {
                    // Muestra un mensaje de error
                    swal('Error', error.responseJSON.error, 'error');
                }
            });
        }
    });
}