// Función para cargar productos desde el archivo JSON
async function cargarProductosDesdeJSON() {
    try {
        const response = await fetch('jabones.json');
        const productos = await response.json();
        return productos;
    } catch (error) {
        console.error('Error al cargar productos:', error);
        return [];
    }
}

// Resto del código
document.addEventListener('DOMContentLoaded', async () => {
    const productos = await cargarProductosDesdeJSON();

    const productosContainer = document.getElementById('productos-container');

    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.innerHTML = `<h3>${producto.nombre}</h3><p>${producto.descripcion}</p>`;

        // Agregar botones para comprar por WhatsApp y compartir
        const comprarBtn = document.createElement('a');
        comprarBtn.href = `https://wa.me/tu_numero_de_whatsapp?text=¡Hola! Te pregunto por este producto: ${producto.nombre}.`;
        comprarBtn.className = 'whatsapp-btn';
        comprarBtn.textContent = 'Comprar por WhatsApp';

        const compartirBtn = document.createElement('button');
        compartirBtn.className = 'compartir-btn';
        compartirBtn.textContent = 'Compartir Producto';
        compartirBtn.addEventListener('click', () => compartirProducto(producto.nombre));

        productoDiv.appendChild(comprarBtn);
        productoDiv.appendChild(compartirBtn);

        productosContainer.appendChild(productoDiv);
    });
});

// Agrega esta función en tu archivo script.js
function compartirProducto(nombreProducto) {
       // Lógica para compartir el producto, por ejemplo, abrir un cuadro de diálogo de compartir del navegador
    navigator.share({
        title: `¡Mira este producto: ${nombreProducto}!`,
        text: `Echa un vistazo a esta oferta exclusiva en nuestra tienda Elitian.`,
        url: window.location.href,
    });
}