const socket = io();
socket.on('connect', () => {
  console.log('Conectado al servidor de Socket.IO');
})
$(function () {
  $("#inicio").on("click", function () {
    $.ajax({
      url: "/cochabamba",
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
  // $("#salir").on("click", function () {
  //   $.ajax({
  //     url: "/cochabamba/logout",
  //     success: async function () {
  //       console.log("LOGOUT ")
  //     }
  //   });
  // }),

  $("#getMensajes").on("click", function () {
    $.ajax({
      url: "/cochabamba/notes",
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
      url: "/cochabamba/notes",
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
      url: "/cochabamba/notes/" + id,
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
      url: "/cochabamba/notes/" + id,
      method: 'DELETE',
      success: function (response) {
        console.log(response)
        $('#getMensajes').click();
      }
    });
  });

});

