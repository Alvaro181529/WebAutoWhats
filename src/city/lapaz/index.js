const socket = io();
socket.on('connect', () => {
  console.log('Conectado al servidor de Socket.IO');
})

$(function () {
  $("#getPass").on("submit", function (e) {
    e.preventDefault();
    let pass = $("#password")
    $.ajax({
      url: "/lapaz/auth",
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ pass: pass.val() }),
      success: function (resp) {
        switch (resp) {
          case "adm":
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('content-container').style.filter = 'none';
            document.getElementById('content-container').style.display = 'block';
            var inputSalir = document.getElementById('salir');
            inputSalir.removeAttribute('hidden');
            break;
          case "pass":
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('content-container').style.filter = 'none';
            document.getElementById('content-container').style.display = 'block';
            break;
          default:
            alert("contraseña incorrecta")
            break;
        }
      }
    })
  })
  $("#inicio").on("click", function () {
    $.ajax({
      url: "/lapaz",
      success: async function (lp) {
        const imgQR = $("#qr"); // Select the existing image
        lp.forEach(async (lps) => {
          // console.log(lps)
          $("#inicio").attr("value", "Conectando . . .");
          if (lps.code === undefined) {
            imgQR.attr("src", "https://cdn.pixabay.com/animation/2023/10/08/03/19/03-19-26-213_512.gif"); // Update the image source
            imgQR.attr("width", "250"); // Update the image source
            imgQR.attr("height", "250"); // Update the image source
          } else {
            imgQR.attr("src", lps.code); // Update the image source
          }
          if (lps.estado == "conectado") {
            $("#inicio").attr("class", "btn btn-success");
            $("#inicio").attr("value", "Conectado");
            $("#inicio").prop("disabled", true);
            document.getElementById('contacto').innerHTML = lps.contacto;
            imgQR.attr("src", "https://icones.pro/wp-content/uploads/2021/04/icone-noire-vert.png"); // Update the image source
            imgQR.attr("width", "250"); // Update the image source
            imgQR.attr("height", "250"); // Update the image source
            document.getElementById('texto').removeAttribute('hidden');
          } else {
            await new Promise((resolve) => setTimeout(resolve, 30000));
            $("#inicio").click();
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

