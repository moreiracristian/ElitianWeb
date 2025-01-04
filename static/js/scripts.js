let indice = 1;
let intervaloCarrusel;

muestraCarrusel(indice);
iniciarCarrusel();

function iniciarCarrusel() {
    intervaloCarrusel = setInterval(function tiempo() {
        muestraCarrusel(indice += 1);
    }, 5000);
}

function avanzaCarrusel(n) {
    muestraCarrusel(indice += n);
    reiniciarIntervalo();
}

function retrocedeCarrusel(n) {
    muestraCarrusel(indice -= n);
    reiniciarIntervalo();
}

function posicionCarrusel(n) {
    muestraCarrusel(indice = n);
    reiniciarIntervalo();
}

function muestraCarrusel(n) {
    let i;
    let carrusel = document.getElementsByClassName('miCarrusel');
    let barras = document.getElementsByClassName('barra');

    if (n > carrusel.length) {
        indice = 1;
    }
    if (n < 1) {
        indice = carrusel.length;
    }
    for (i = 0; i < carrusel.length; i++) {
        carrusel[i].style.display = 'none';
    }
    for (i = 0; i < barras.length; i++) {
        barras[i].className = barras[i].className.replace(" active", "");
    }

    carrusel[indice - 1].style.display = 'block';
    barras[indice - 1].className += ' active';
}

function detenerCarrusel() {
    clearInterval(intervaloCarrusel);
}

function reanudarCarrusel() {
    iniciarCarrusel();
}

function reiniciarIntervalo() {
    detenerCarrusel();
    reanudarCarrusel();
}


function enviarPorWhatsApp() {
    // Número de teléfono al que enviar el mensaje
    let numeroTelefono = '+5493624527435';

    // Mensaje predefinido
    let mensaje = '¡Hola! Estoy interesado en el producto Aceite puro de almendras. ¿Puedes darme más información?';

    // Crear el enlace para abrir WhatsApp
    let enlaceWhatsApp = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;

    // Abrir la aplicación de WhatsApp
    window.open(enlaceWhatsApp, '_blank');
}

function compartirProducto() {
    // Contenido que se compartirá (puedes personalizarlo)
    let contenidoCompartir = `
        ¡Descubre esta oferta!
        Aceite puro de almendras
        Precio: $1200AR (Antes $1000AR)
        ¡Aprovecha el descuento!
    `;

    // Crear enlace para compartir
    let enlaceCompartir = `whatsapp://send?text=${encodeURIComponent(contenidoCompartir)}`;

    // Abrir la aplicación de WhatsApp para compartir
    window.location.href = enlaceCompartir;
}


const checkbox = document.querySelector('.checkbox');
const list = document.querySelector('.list_categorias');

document.addEventListener('click', (event) => {
  if (!checkbox.contains(event.target) && !list.contains(event.target)) {
    list.style.display = 'none';
  }
});