const socket = io();
socket.on('connect', () => {
  console.log('Conectado al servidor de Socket.IO');
})
document.getElementById('ingresar').addEventListener('click', function () {
  var inputPassword = document.getElementById('password').value;

  // Hash MD5 de la contraseña ingresada
  var hashedPassword = CryptoJS.MD5(inputPassword).toString();

  // Reemplaza 'hash-md5-de-tu-contraseña' con el hash MD5 correcto de tu contraseña
  var storedPasswordHash = 'f55b3add9532941486440fe11f75a1e7';

  // Reemplaza 'tu-contraseña' con la contraseña que desees
  if (hashedPassword === storedPasswordHash) {
    document.getElementById('overlay').style.display = 'none';

    // Quitar el efecto borroso
    document.getElementById('content-container').style.filter = 'none';
    document.getElementById('content-container').style.display = 'block';
  } else {
    alert('Contraseña incorrecta. Inténtalo de nuevo.');
  }
});

$(function () {
  $("#inicio").on("click", function () {
    $.ajax({
      url: "/lapaz",
      success: async function (lp) {
        const imgQR = $("#qr"); // Select the existing image
        lp.forEach(async (lps) => {
          $("#inicio").attr("value", "Conectando . . .");
          imgQR.attr("src", lps.code); // Update the image source
          if (lps.estado == "conectado") {
            $("#inicio").attr("class", "btn btn-success");
            $("#inicio").attr("value", "Conectado");
            $("#inicio").prop("disabled", true);
            imgQR.attr("src", "https://icones.pro/wp-content/uploads/2021/04/icone-noire-vert.png"); // Update the image source
            imgQR.attr("width", "250"); // Update the image source
            imgQR.attr("height", "250"); // Update the image source

            console.log("Esta conectado el cliente ")
          } else {
            await new Promise((resolve) => setTimeout(resolve, 30000));
            $("#inicio").click();
            console.log("qr");
          }
        });
      },
    });
  });
  // no se ouede usar ocurren errores
  $("#salir").on("click", function () {
    $.ajax({
      url: "/lapaz/logout",
      success: async function () {
        console.log("LOGOUT ")
      }
    });
  }),

  $("#getMensajes").on("click", function () {
    $.ajax({
      url: "/lapaz/notes",
      success: function (mensajesLP) {
        let tbody = $('tbody');
        tbody.html('');
        mensajesLP.forEach(mensajesL => {
          tbody.append(`
                    <tr>
                    <td class="id">${mensajesL.id}</td>
                        <td>
                            <input type="text" style="background-color:transparent; border:none" class="mensaje form-control" style=""value="${mensajesL.mensaje}"/>
                        </td>
                        <td>
                        <button class="update-button btn btn-primary">Actualizar</button>
                        <button class="delete-button btn btn-danger">Eliminar</button>
                        </td>
                    </tr>
                `);
        });
      }
    });
  });

  $("#noteForm").on("submit", function (e) {
    e.preventDefault();
    let mensajes = $("#mensajes")
    $.ajax({
      url: "/lapaz/notes",
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ mensaje: mensajes.val() }),
      success: function (response) {
        $("#getMensajes").click()
      }
    })
  })
  $('table').on('click', '.update-button', function () {
    let row = $(this).closest('tr');
    let id = row.find('.id').text();
    let mensaje = row.find('.mensaje').val();

    $.ajax({
      url: "/lapaz/notes/" + id,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({ mensaje: mensaje }),
      success: function (response) {
        console.log(response);
        $("#getMensajes").click()
      }
    });
  });
  $('table').on('click', '.delete-button', function () {
    let row = $(this).closest('tr');
    let id = row.find('.id').text();
    $.ajax({
      url: "/lapaz/notes/" + id,
      method: 'DELETE',
      success: function (response) {
        console.log(response)
        $('#getMensajes').click();
      }
    });
  });

});

