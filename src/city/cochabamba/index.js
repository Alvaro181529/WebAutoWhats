const socket = io();
socket.on('connect', () => {
  console.log('Conectado al servidor de Socket.IO');
})
$(function () {
  $("#getPass").on("submit", function (e) {
    e.preventDefault();
    let pass = $("#password")
    $.ajax({
      url: "/cochabamba/auth",
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
      url: "/cochabamba",
      success: async function (lp) {
        setInterval(table, 10000)
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
      url: "/cochabamba/logout",
      success: async function () {
        console.log("LOGOUT ")
      }
    });
  });

  $("#getMensajes").on("click", function () {
    $.ajax({
      url: "/cochabamba/notes",
      success: function (mensajesLP) {
        let tbody = $('#tbody');
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
      success: function (resp) {
        alert(resp)
        $("#getMensajes").click()
      }
    })
  });
  ;
  $("#reports").on("submit", function (e) {
    e.preventDefault();
    let date = $("#date").val();

    $.ajax({
      url: "/cochabamaba/reportes",
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ date: date }),
      xhrFields: {
        responseType: 'blob'  // Establecer el tipo de respuesta como blob
      },
      success: function (data) {
        var blob = new Blob([data], { type: 'application/pdf' });
        var url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: function (error) {
        console.error('Error al obtener el informe PDF:', error);
      }
    });
  });
  $('table').on('click', '.update-button', function () {
    let row = $(this).closest('tr');
    let id = row.find('.id').text();
    let mensaje = row.find('.mensaje').val();

    $.ajax({
      url: "/cochabamba/notes/" + id,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({ mensaje: mensaje }),
      success: function (resp) {
        alert(resp)
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
      success: function (resp) {
        alert(resp)
        $('#getMensajes').click();
      }
    });
  });
  function scrollToBottom() {
    var divMens = document.getElementById('mens');
    divMens.scrollTop = divMens.scrollHeight;
  }
  function table() {
    $.ajax({
      url: "/cochabamba/message",
      success: function (resp) {
        let tbody = $('#info');
        tbody.html('');
        resp.forEach(mensajesL => {
          // Convertir la cadena de fecha a un objeto Date
          let fechaCreacion = new Date(mensajesL.fecha_creacion);

          // Obtener componentes de fecha y hora
          let dia = fechaCreacion.getDate();
          let mes = fechaCreacion.getMonth() + 1; // Meses en JavaScript van de 0 a 11
          let año = fechaCreacion.getFullYear();
          let horas = fechaCreacion.getHours();
          let minutos = fechaCreacion.getMinutes();
          let formatoFechaHora = `${mes}/${dia}/${año} ${horas}:${minutos}`;
          tbody.append(`
              <tr>
              <td >${mensajesL.numero}</td>
              <td >${mensajesL.TELEFONO}</td>
              <td >${mensajesL.mensajes}</td>
              <td >${mensajesL.observacion}</td>
              <td >${mensajesL.estado}</td>
              <td >${formatoFechaHora}</td>
              </tr>
          `);
        });
        scrollToBottom();
      }
    })
  }
});

