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
