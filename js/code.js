let count = 0; // Contador de productos favoritos
const API = "https://6733c9bea042ab85d1180070.mockapi.io/BabyShop"; // URL de la API


function scrollToProducts() {
    const productosCard = document.getElementById('productos__card');
    if (productosCard) {
        productosCard.scrollIntoView({ 
            behavior: 'smooth' // Desplazamiento suave
        });
    }
}


// Función para alternar el estado de favorito de un producto
function toggleFavorito(element) {
    const heartIcon = element.querySelector('.heart-icon'); // Selecciona el ícono del corazón

    // Verifica si el corazón ya está activo
    if (element.classList.contains('active')) {
        element.classList.remove('active'); // Desactiva el favorito
        heartIcon.src = './imagenes/heart.svg'; // Cambia a corazón vacío
        count--; // Decrementa el contador
    } else {
        element.classList.add('active'); // Activa el favorito
        heartIcon.src = './imagenes/heart-red.svg'; // Cambia a corazón lleno
        count++; // Incrementa el contador
    }
    // Actualiza el texto del contador de favoritos
    document.getElementById('contador-favoritos').textContent = 'Tus Favoritos: ' + count;
}

// Selección de elementos del DOM
const btnMostrarModal = document.querySelector('#mostrar-modal'); // Botón para mostrar el modal
const btnCerrar = document.querySelector('.cerrar'); // Botón para cerrar el modal
const modal = document.querySelector('.modal'); // Modal
const form = document.querySelector('.form'); // Formulario
const submit = document.querySelector('form input[type="submit"]'); // Botón de envío del formulario
const cardsBody = document.querySelector('.productos__card'); // Contenedor de tarjetas de productos
let numero = (Math.floor(Math.random() * 9) + 1).toString(); // Número aleatorio para estrellas
let estado = 'add'; // Estado del formulario (agregar o editar)
let idEditar = null; // ID del producto a editar

// Función para obtener productos de la API
const baby = async () => {
    try {
        const response = await fetch(API); // Realiza la solicitud a la API
        const data = await response.json(); // Convierte la respuesta a JSON

        let html = ''; // Inicializa una cadena para almacenar el HTML
        data.forEach(item => {
            // Genera el HTML para cada producto
            html += `
            <div class="producto">
                <div class="favoritos" onclick="toggleFavorito(this)">
                    <img class="heart-icon" src="./imagenes/heart.svg" alt="Agregar a Favoritos" width="20">
                </div>
                <div class="eliminar" onClick="eliminarProducto('${item.id}')">
                    <img src="./imagenes/trash.svg" alt="Eliminar Producto" width="20">
                </div>
                <div class="editar" onClick="editarProducto('${item.id}')">
                    <img src="./imagenes/edit.svg" alt="Editar Producto" width="20">
                </div>
                <img class="producto__imagen" src="${item.img}" alt="Imagen del Producto">
                <div class="producto__cuerpo">
                    <div>
                        <div class="producto__detalle">
                            <h2 class="producto__titulo">${item.titulo}</h2>
                            <p class="producto__precio">$${item.precio}</p>
                        </div>
                        <p class="producto__descripcion">${item.descripcion}</p>
                        <div class="estrellas">
                            ★★★★★ (${numero * (Math.floor(Math.random() * 9) + 1)})
                        </div>
                    </div>
                    <button class="agregar-carrito">Agregar al Carrito</button>
                </div>
            </div>`;
        });

        cardsBody.innerHTML = html; // Actualiza el contenedor con el HTML generado
    } catch (error) {
        // Muestra un mensaje de error si la conexión falla
        cardsBody.innerHTML = `<h2>Error con la conexión</h2>`;
        console.error(error); // Muestra el error en la consola
    }
};

// Cargar productos al iniciar
baby();

// Evento para mostrar el modal
btnMostrarModal.addEventListener('click', () => {
    modal.classList.toggle('show'); // Alterna la clase 'show' en el modal
});

// Evento para cerrar el modal
btnCerrar.addEventListener('click', () => {
    estado = 'add'; // Resetea el estado a 'add'
    idEditar = null; // Resetea el ID de edición
    submit.value = 'Agregar Producto'; // Cambia el texto del botón de envío
    modal.classList.toggle('show'); // Oculta el modal
    form.reset(); // Reinicia el formulario
});

// AGREGAR UN PRODUCTO
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Previene la recarga de página al enviar el formulario

    const datosForm = new FormData(e.target); // Obtiene los datos del formulario
    const datos = { // Crea un objeto con los datos del formulario
        titulo: datosForm.get('titulo'), // Obtiene el título
        descripcion: datosForm.get('descripcion'), // Obtiene la descripción
        precio: +datosForm.get('precio'), // Obtiene el precio y lo convierte a número
        img: datosForm.get('img'), // Obtiene la imagen
    };

    // Validación para comprobar si hay datos en los inputs
    if (!datos.titulo || !datos.descripcion || !datos.precio || !datos.img) {
        mostrarMensajeFlotante('No hay productos que agregar'); // Muestra un mensaje si falta información
        return; // Sale de la función sin enviar los datos
    }

    try {
        // Verifica si se está editando o agregando un producto
        if (estado !== 'editar') {
            const res = await fetch(API, { // Realiza una solicitud POST a la API
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Indica que el cuerpo es JSON
                },
                body: JSON.stringify(datos) // Convierte el objeto a JSON
            });

            if (!res.ok) {
                throw new Error('Error al agregar el producto'); // Manejo de errores
            }

            const result = await res.json(); // Espera la respuesta y la convierte a JSON
            console.log('Producto agregado:', result); // Muestra el resultado en la consola
        } else {
            // Si está en modo edición
            const res = await fetch(`${API}/${idEditar}`, { // Construye la URL para la edición
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json' // Indica que el cuerpo es JSON
                },
                body: JSON.stringify(datos) // Convierte el objeto a JSON
            });

            if (!res.ok) {
                throw new Error(`Error en la actualización: ${res.status} ${res.statusText}`); // Manejo de errores
            }

            const updatedData = await res.json(); // Espera la respuesta y la convierte a JSON
            console.log('Producto actualizado:', updatedData); // Muestra el resultado en la consola
            alert('Producto actualizado exitosamente!'); // Alerta de éxito
        }

        form.reset(); // Reinicia el formulario
        modal.classList.remove('show'); // Oculta el modal
        baby(); // Actualiza la lista de productos
    } catch (error) {
        console.error('Error:', error); // Muestra el error en la consola
    }
});

// MOSTRAR MENSAJE FLOTANTE
function mostrarMensajeFlotante(mensaje) {
    const mensajeFlotante = document.createElement('div'); // Crea un nuevo elemento div
    mensajeFlotante.textContent = mensaje; // Establece el texto del mensaje
    mensajeFlotante.className = 'mensaje-flotante'; // Asigna una clase para el estilo

    document.body.appendChild(mensajeFlotante); // Agrega el mensaje al cuerpo del documento

    setTimeout(() => {
        mensajeFlotante.remove(); // Elimina el mensaje después de 3 segundos
    }, 3000);
}

// ELIMINAR UN PRODUCTO
async function eliminarProducto(id) {
    const confirmacionDiv = document.getElementById('confirmacion-eliminar'); // Selecciona el div de confirmación
    const mensajeConfirmacion = document.getElementById('mensaje-confirmacion'); // Selecciona el mensaje de confirmación
    mensajeConfirmacion.textContent = `¿Desea borrar este producto?`; // Establece el mensaje de confirmación
    confirmacionDiv.style.display = 'block'; // Muestra el div de confirmación

    // Manejo de botones de confirmación
    document.getElementById('btn-si').onclick = async () => {
        try {
            const res = await fetch(`${API}/${id}`, { // Realiza una solicitud DELETE
                method: 'DELETE'
            });
            if (res.ok) {
                mostrarMensajeFlotante('Producto eliminado correctamente.'); // Muestra mensaje de éxito
                baby(); // Actualiza la lista de productos
            } else {
                mostrarMensajeFlotante('Error al eliminar el producto.'); // Muestra mensaje de error
            }
        } catch (error) {
            console.error(error); // Muestra el error en la consola
            mostrarMensajeFlotante('Error al eliminar el producto.'); // Muestra mensaje de error
        }
        confirmacionDiv.style.display = 'none'; // Oculta la confirmación
    };

    document.getElementById('btn-no').onclick = () => {
        confirmacionDiv.style.display = 'none'; // Oculta la confirmación si se cancela
    };
}

// EDITAR UN PRODUCTO
async function editarProducto(id) {
    estado = 'editar'; // Cambia el estado a editar
    modal.classList.add('show'); // Muestra el modal
    submit.value = 'Editar Producto'; // Cambia el texto del botón de envío

    const res = await fetch(`${API}/${id}`); // Obtiene el producto a editar
    const producto = await res.json(); // Convierte la respuesta a JSON

    // Rellena el formulario con los datos del producto
    form.elements.titulo.value = producto.titulo;
    form.elements.descripcion.value = producto.descripcion;
    form.elements.precio.value = producto.precio;
    form.elements.img.value = producto.img;

    idEditar = id; // Guarda el ID del producto a editar
}

// CÓDIGO DE BUSQUEDA DE UN PRODUCTO
const searchInput = document.querySelector('#search-input'); // Selecciona el input de búsqueda
const searchButton = document.querySelector('#search-button'); // Selecciona el botón de búsqueda
const showAllButton = document.querySelector('#show-all-button'); // Selecciona el botón para mostrar todos los productos
let allProducts = []; // Variable para almacenar todos los productos

// Función asíncrona para buscar productos basados en la consulta proporcionada
async function buscarProducto(query) {
    try {
        const response = await fetch(API); // Realiza una solicitud GET a la API
        const data = await response.json(); // Convierte la respuesta a JSON
        allProducts = data; // Almacena todos los productos

        // Filtra los productos que coinciden con la consulta en el título o descripción
        const resultados = data.filter(producto =>
            producto.titulo.toLowerCase().includes(query.toLowerCase()) ||
            producto.descripcion.toLowerCase().includes(query.toLowerCase())
        );

        // Llama a la función para mostrar los resultados filtrados
        mostrarResultados(resultados);
    } catch (error) {
        console.error('Error al buscar productos:', error); // Muestra el error en la consola
        mostrarMensajeFlotante('Error al buscar productos'); // Muestra un mensaje de error
    }
}

// Función para mostrar los resultados de la búsqueda en el DOM
function mostrarResultados(resultados) {
    let html = ''; // Inicializa una cadena vacía para almacenar el HTML
    // Verifica si no hay resultados
    if (resultados.length === 0) {
        html = '<h3>No se han agregado productos</h3>'; // Mensaje si no se encuentran productos
    } else {
        // Itera sobre cada producto en los resultados
        resultados.forEach(item => {
            // Construye el HTML para cada producto
            html += `
            <div class="producto">
                <div class="favoritos" onclick="toggleFavorito(this)">
                    <img class="heart-icon" src="./imagenes/heart.svg" alt="Agregar a Favoritos" width="20">
                </div>
                <div class="eliminar" onClick="eliminarProducto('${item.id}')">
                    <img src="./imagenes/trash.svg" alt="Eliminar Producto" width="20">
                </div>
                <div class="editar" onClick="editarProducto('${item.id}')">
                    <img src="./imagenes/edit.svg" alt="Editar Producto" width="20">
                </div>
                <img class="producto__imagen" src="${item.img}" alt="Imagen del Producto">
                <div class="producto__cuerpo">
                    <div>
                        <div class="producto__detalle">
                            <h2 class="producto__titulo">${item.titulo}</h2>
                            <p class="producto__precio">$${item.precio}</p>
                        </div>
                        <p class="producto__descripcion">${item.descripcion}</p>
                        <div class="estrellas">
                            ★★★★★ (${Math.floor(Math.random() * 45) + 5}) 
                        </div>
                    </div>
                    <button class="agregar-carrito">Agregar al Carrito</button>
                </div>
            </div>`;
        });
    }
    // Actualiza el contenido del elemento cardsBody con el HTML generado
    cardsBody.innerHTML = html;
}

// Agrega un evento de clic al botón de búsqueda
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim(); // Obtiene y limpia el valor de entrada
    if (query) { // Verifica si hay una consulta válida
        buscarProducto(query); // Llama a la función para buscar productos
    } else {
        // Muestra un mensaje flotante si no hay término de búsqueda
        mostrarMensajeFlotante('Por favor, ingrese un término de búsqueda');
    }
});

// Agrega un evento de teclado al input de búsqueda
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { // Verifica si la tecla presionada es "Enter"
        const query = searchInput.value.trim(); // Obtiene y limpia el valor de entrada
        if (query) { // Verifica si hay una consulta válida
            buscarProducto(query); // Llama a la función para buscar productos
        } else {
            mostrarMensajeFlotante('Por favor, ingrese un término de búsqueda'); // Muestra un mensaje flotante si no hay término de búsqueda
        }
    }
});

// Evento para mostrar todos los productos
showAllButton.addEventListener('click', () => {
    mostrarResultados(allProducts); // Muestra todos los productos almacenados
    searchInput.value = ''; // Limpia el input de búsqueda
});
