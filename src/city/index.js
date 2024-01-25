document.getElementById('ingresar').addEventListener('click', function () {
    var inputPassword = document.getElementById('password').value;

    // Hash MD5 de la contraseña ingresada
    var hashedPassword = CryptoJS.MD5(inputPassword).toString();

    // Reemplaza 'hash-md5-de-tu-contraseña' con el hash MD5 correcto de tu contraseña
    var storedPasswordHash = '827ccb0eea8a706c4c34a16891f84e7b';

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
