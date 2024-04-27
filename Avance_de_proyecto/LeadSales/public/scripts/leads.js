window.onload = function() {
    //se muestra un mensaje de confirmacion al guardar los cambios
    document.getElementById('deleteButton').addEventListener('click', function() {
        //se muestra un mensaje de confirmacion al guardar los cambios
    swal('Guardado', 'Los cambios se han guardado.', 'success')
    })
};

document.getElementById('versionSelect').addEventListener('change', function() {
    var versionSeleccionada = this.value;
  
    fetch('/ruta/a/tu/endpoint', {
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