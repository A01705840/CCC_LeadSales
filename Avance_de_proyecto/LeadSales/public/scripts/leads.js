window.onload = function() {
    //se muestra un mensaje de confirmacion al guardar los cambios
    document.getElementById('deleteButton').addEventListener('click', function() {
        //se muestra un mensaje de confirmacion al guardar los cambios
    swal('Guardado', 'Los cambios se han guardado.', 'success')
    })
};

document.getElementById('versionSelect').addEventListener('change', function() {
    var versionSeleccionada = this.value;
    fetch('/lead/leadsporversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ version: versionSeleccionada }),
    })
    .then(response => response.json())
    .then(data => {
      // Aquí puedes actualizar la interfaz de usuario con los nuevos leads
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  });



$(document).ready(function() {
    $('#versionSelect').change(function() {
        console.log('CAMBIO DE VERSION CLIENTE')

        versionSeleccionada = $(this).val();
        

        $.ajax({
            url: '/lead/leadsporversion',
            method: 'POST',
            data: { version: versionSeleccionada },
            success: function(data) {
                updatePage(data);
                updateInicioFin(data);
                updateNumeroTotalDeLeads(data.numeroTotalDeLeads);
                updateNumeroTotalDePaginas(data.numeroTotalDePaginas);

                $('.page-button').css({ 'background-color': '', 'color': '' }); 
                $('.page-button[data-pagina="1"]').css({ 'background-color': '#007BFF', 'color': 'white' });
            }
        });
    });
});

// Cuando se hace clic en un botón de página
$(document).on('click', '.page-button', function() {
  const pagina = $(this).data('pagina');

  // Obtiene la versión seleccionada
  const versionSeleccionada = $('#versionSelect').val();

  // Restablece el estilo de todos los botones de página
  $('.page-button').css({
      'background-color': '',
      'color': ''
  });

  // Aplica el estilo al botón de página clickeado
  $(this).css({
      'background-color': '#007BFF',
      'color': 'white'
  });

  console.log('CAMBIO DE PAGINA CLIENTE');
  $.ajax({
      url: '/lead/leadsporpagina',
      method: 'POST',
      data: { 
          pagina: pagina,
          version: versionSeleccionada
      },
      success: function(data) {
          updatePage(data);
          updateInicioFin(data);
      }
  });
});

// Aplica el estilo al primer botón de página cuando se carga la página
$(document).ready(function() {
  $('.page-button[data-pagina="1"]').css({
      'background-color': '#007BFF',
      'color': 'white'
  });
});

function updateNumeroTotalDeLeads(numeroTotalDeLeads) {
  console.log('ACTUALIZANDO NUMERO TOTAL DE LEADS', numeroTotalDeLeads);

  // Actualiza el número total de leads
  $('#numeroTotalDeLeads').text(numeroTotalDeLeads);
}

function updateNumeroTotalDePaginas(numeroTotalDePaginas) {
  console.log('ACTUALIZANDO NUMERO TOTAL DE PAGINAS', numeroTotalDePaginas);

  // Elimina los botones de página existentes
  $('.page-button').remove();

  // Agrega nuevos botones de página
  for (let i = 1; i <= numeroTotalDePaginas; i++) {
      $('ul.flex').append(`<li><a href="#" data-pagina="${i}" class="mx-1 px-2 py-0.5 bg-white text-ellipsis hover:bg-blue-500 hover:text-white border border-black border-opacity-10 rounded-full transition duration-200 page-button" style="position:relative; right: 650px; bottom: 12px;">${i}</a></li>`);
  }
}


function updateInicioFin(data) {
  console.log('ACTUALIZANDO INICIO Y FIN', data);

  // Actualiza el valor de inicio
  $('#inicio').text(data.inicio);

  // Actualiza el valor de fin
  $('#fin').text(data.fin);
}
 

      function updatePage(data) {
        console.log('ACTUALIZANDO PAGINA', data);
        // Vacía la tabla de leads
        $('#table_content').empty();
        
        // Añade cada lead a la tabla
        data.leads[0].forEach(function(lead, index) {
            // Formatea la fecha
            const fecha = new Date(lead.FechaPrimerMensaje);
            const dia = fecha.getDate().toString().padStart(2, '0');
            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // El mes comienza desde 0
            const año = fecha.getFullYear();
            const fechaFormateada = `${dia}/${mes}/${año}`;
            
    
            // Crea la fila de la tabla
            const fila = `
                <tr class="flex w-full mb-4 ${index % 2 == 0 ? '' : 'bg-gray-50'}">
                    <td class="p-4 w-1/5">${lead.NombreLead || '<p class="text-gray-400">Lead sin nombre</p>'}</td>
                    <td class="p-4 w-1/5">${fechaFormateada}</td>
                    <td class="p-4 w-1/5">${lead.asignado_a}</td>
                    <td class="p-4 w-1/5">
                        <button onclick="event.preventDefault(); modificar(${lead.IDLead})" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">
                            Modificar
                        </button>
                    </td>
                    <td class="p-4 w-1/5">
                        <button id="deleteButton" onclick="eliminar(${lead.IDLead})" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
    
            // Añade la fila a la tabla
            $('#table_content').append(fila);
        });
    
}


// ----------------         DESCARGAR LEADS         ------------------


$(document).ready(function() {
  // Abre el modal cuando se hace clic en el botón de descarga
  $('#descargarLeads').click(function() {
      $('#modalDescargarLeads').show();
  });

  $('#indescargarleads').click(function() {
    const versionSeleccionada = $('#versionSelect').val();
    const nombreVersionSeleccionada = $('#versionSelect option:selected').text();

    $.ajax({
        url: '/lead/descargarleads',
        method: 'POST',
        data: { 
            version: versionSeleccionada,
            nombreVersion: nombreVersionSeleccionada // Envía el nombre de la versión al servidor
        },
        success: function(data) {
            const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(data);
            const link = document.createElement('a');
            link.setAttribute('href', csvData);
            link.setAttribute('download', `${nombreVersionSeleccionada}.csv`); // Usa el nombre de la versión para nombrar el archivo
            link.click();
        }
    });

    // Cierra el modal
    $('#modalDescargarLeads').hide();
});
});

function cerrarModalDescargarLeads() {
  $('#modalDescargarLeads').hide();
}