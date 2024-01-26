
$(function () {
    $("#getPass").on("submit", function (e) {
        e.preventDefault();
        let pass = $("#password")
        $.ajax({
            url: "/adminPage/auth",
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
                        $("#getMensajes").click()

                        break;
                    case "pass":
                        document.getElementById('overlay').style.display = 'none';
                        document.getElementById('content-container').style.filter = 'none';
                        document.getElementById('content-container').style.display = 'block';
                        $("#getMensajes").click()

                        break;
                    default:
                        alert("contraseña incorrecta")
                        break;
                }
            }
        })
    })
    $("#getMensajes").on("click", function () {
        $.ajax({
            url: "/adminPage/users",
            success: function (users) {
                let tbody = $('tbody');
                tbody.html('');
                users.forEach(user => {
                    tbody.append(`
                      <tr>
                      <td class="id">${user.id}</td>
                      <td class="city">${user.city}</td>
                          <td>
                              <input type="text" style="background-color:transparent; border:none" class="pass form-control" style=""value="${user.pass}"/>
                          </td>
                          <td>
                              <button class="update-button btn btn-primary">Actualizar</button>
                          </td>
                      </tr>
                  `);
                });
            }
        });
    });
    $('table').on('click', '.update-button', function () {
        let row = $(this).closest('tr');
        let id = row.find('.id').text();
        let pass = row.find('.pass').val();

        $.ajax({
            url: "/adminPage/users/" + id,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ pass: pass }),
            success: function (response) {
                alert(response);
                $("#getMensajes").click()
            }
        });
    });
});