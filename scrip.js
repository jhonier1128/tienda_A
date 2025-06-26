// Simulación de base de datos de productos
const productosDB = [
    { id: 1, nombre: "Chaqueta Alpha", descripcion: "Una chaqueta de cuero elegante y resistente.", precio: 79.99, imagen: "img/chaqueta1.jpeg", categoria: "Chaquetas" },
    { id: 2, nombre: "Chaqueta Beta", descripcion: "Chaqueta ligera para toda estación.", precio: 89.99, imagen: "img/chaqueta2.jpeg", categoria: "Chaquetas" },
    { id: 3, nombre: "Chaqueta Gamma", descripcion: "Chaqueta impermeable con capucha.", precio: 99.99, imagen: "img/chaqueta3.jpeg", categoria: "Chaquetas" },
    { id: 4, nombre: "Camisa Clásica", descripcion: "Camisa de algodón premium, cómoda y versátil.", precio: 29.99, imagen: "img/oferta1.jpg", categoria: "Camisas" },
    { id: 5, nombre: "Pantalón Moderno", descripcion: "Pantalón ajustado con múltiples bolsillos.", precio: 39.99, imagen: "img/oferta2.jpg", categoria: "Pantalones" },
    { id: 6, nombre: "Chaqueta Deportiva Roja", descripcion: "Chaqueta deportiva ideal para correr, color rojo.", precio: 59.99, imagen: "img/chaqueta1.jpeg", categoria: "Chaquetas" },
    { id: 7, nombre: "Pantalón Cargo Verde", descripcion: "Pantalón cargo resistente, color verde.", precio: 45.99, imagen: "img/oferta2.jpg", categoria: "Pantalones" }
];

function buscarProductos(termino) {
    if (!termino) return [];
    const terminoMinusculas = termino.toLowerCase();
    return productosDB.filter(producto => {
        const nombre = producto.nombre.toLowerCase();
        const descripcion = producto.descripcion.toLowerCase();
        const categoria = producto.categoria.toLowerCase();
        return nombre.includes(terminoMinusculas) ||
               descripcion.includes(terminoMinusculas) ||
               categoria.includes(terminoMinusculas);
    });
}

// Event listener para el icono de búsqueda
// Es importante que este script se ejecute después de que el DOM esté cargado,
// o que el icono searchIcon ya exista en el DOM.
// Si scrip.js se carga al final del body, esto debería funcionar.
const searchIcon = document.getElementById('searchIcon');
if (searchIcon) {
    searchIcon.addEventListener('click', (event) => {
        event.preventDefault();
        const terminoBusqueda = window.prompt("Buscar producto:");

        if (terminoBusqueda && terminoBusqueda.trim() !== "") {
            const resultados = buscarProductos(terminoBusqueda.trim());
            localStorage.setItem('searchResults', JSON.stringify(resultados));
            localStorage.setItem('searchTerm', terminoBusqueda.trim()); // Guardar también el término
            window.location.href = 'resultados_busqueda.html';
        } else if (terminoBusqueda !== null) { // Si el usuario no canceló, pero dejó vacío
            alert("Por favor, ingrese un término de búsqueda.");
        }
    });
}

//slider de texto 

// --- Lógica del Modal de Registro ---
const userIconDesktop = document.getElementById('userIconDesktop');
const userAreaMobile = document.getElementById('userAreaMobile');
let activeModal = null; // Para rastrear el modal activo y evitar duplicados

function cerrarRegistroModal() {
    if (activeModal) {
        activeModal.remove(); // Elimina el modal del DOM
        activeModal = null;
    }
}

function abrirRegistroModal() {
    // Si ya hay un modal (de cualquier tipo, aunque aquí solo tenemos uno), ciérralo primero
    if (activeModal) {
        cerrarRegistroModal();
    }

    const modalDiv = document.createElement('div');
    modalDiv.id = 'registroModal'; // Usado por CSS y potencialmente por cerrarRegistroModal
    modalDiv.className = 'modal modal-visible'; // La clase .modal para estilos base, .modal-visible para mostrarlo

    fetch('registro_modal_content.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(htmlContent => {
            modalDiv.innerHTML = htmlContent;
            document.body.appendChild(modalDiv);
            activeModal = modalDiv; // Guardar referencia al modal activo

            // Adjuntar listener al botón de cierre DENTRO del contenido cargado
            const closeButton = document.getElementById('closeRegistroModalContent');
            if (closeButton) {
                closeButton.addEventListener('click', cerrarRegistroModal);
            }

            // Adjuntar listener para cerrar al hacer clic en el overlay
            modalDiv.addEventListener('click', (event) => {
                if (event.target === modalDiv) { // Si el clic fue directamente en el overlay
                    cerrarRegistroModal();
                }
            });

            // Adjuntar listener al formulario (la lógica de submit se hará en el siguiente paso del plan)
            const registroForm = document.getElementById('registroForm');
            if (registroForm) {
                registroForm.addEventListener('submit', handleRegistroSubmit); // handleRegistroSubmit se definirá después
            }
        })
        .catch(error => {
            console.error('Error al cargar el modal de registro:', error);
            alert('Hubo un error al cargar el formulario de registro. Inténtelo más tarde.');
            // Limpiar modalDiv si se creó pero falló la carga de contenido
            if (modalDiv.parentElement) {
                modalDiv.remove();
            }
            activeModal = null;
        });
}

// --- Cerrar Sesión y Manejador de Acción de Usuario ---
function cerrarSesion() {
    localStorage.removeItem('usuarioRegistrado');
    actualizarUIUsuario(); // Refresca la UI para mostrar estado "no logueado"
    alert('Has cerrado sesión.');
}

function handleUserAction(event) {
    event.preventDefault();
    if (localStorage.getItem('usuarioRegistrado')) {
        cerrarSesion();
    } else {
        abrirRegistroModal();
    }
}

if (userIconDesktop) {
    userIconDesktop.addEventListener('click', handleUserAction);
}

if (userAreaMobile) {
    // Asegurarse de que el evento se asigna al elemento clickeable correcto.
    // Si userAreaMobile es el div, y dentro hay un <a>, podría ser mejor asignar al <a>
    // o permitir que el clic en el div funcione. Por ahora, al div.
    userAreaMobile.addEventListener('click', handleUserAction);
}

// Función que maneja el submit del formulario de registro
function handleRegistroSubmit(event) {
    event.preventDefault();

    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const telefonoInput = document.getElementById('telefono');
    const correoInput = document.getElementById('correo');

    // Validación simple (los campos required del HTML ya hacen la mayoría del trabajo)
    if (!nombreInput || !apellidoInput || !telefonoInput || !correoInput ) {
        // Esto es una guarda por si el contenido del modal no se cargó correctamente
        // y los elementos no existen. La validación de valor se hace después.
        console.error("Uno o más campos del formulario no se encontraron en el DOM.");
        alert("Error en el formulario. Intente abrir el registro de nuevo.");
        return;
    }

    if (!nombreInput.value.trim() || !apellidoInput.value.trim() || !telefonoInput.value.trim() || !correoInput.value.trim()) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    const usuario = {
        nombre: nombreInput.value.trim(),
        apellido: apellidoInput.value.trim(),
        telefono: telefonoInput.value.trim(),
        correo: correoInput.value.trim()
    };

    try {
        localStorage.setItem('usuarioRegistrado', JSON.stringify(usuario));
        alert("¡Registro exitoso!"); // Mensaje de éxito

        cerrarRegistroModal();
        actualizarUIUsuario(); // Esta función se definirá en el siguiente paso

    } catch (e) {
        console.error("Error al guardar en localStorage:", e);
        alert("Hubo un error al guardar el registro. Es posible que el almacenamiento esté lleno o deshabilitado.");
    }
}

// Placeholder para actualizarUIUsuario, se definirá después
// Será llamada al cargar la página y después de un registro/logout exitoso.
function actualizarUIUsuario() {
    const usuarioRegistradoJSON = localStorage.getItem('usuarioRegistrado');
    const textoUsuarioMobileEl = document.getElementById('textoUsuarioMobile');
    const userIconDesktopEl = document.getElementById('userIconDesktop'); // El enlace <a>

    if (usuarioRegistradoJSON) {
        try {
            const usuario = JSON.parse(usuarioRegistradoJSON);
            if (textoUsuarioMobileEl) {
                textoUsuarioMobileEl.textContent = `Hola, ${usuario.nombre}`;
            }
            if (userIconDesktopEl) {
                // Cambiamos el title del enlace para que muestre el nombre al pasar el mouse
                // y podríamos cambiar su comportamiento para cerrar sesión más adelante.
                userIconDesktopEl.title = `Sesión iniciada como ${usuario.nombre} ${usuario.apellido}`;
            }

        } catch (e) {
            console.error("Error al parsear datos de usuario desde localStorage:", e);
            // Si hay error, tratar como si no hubiera sesión
            if (textoUsuarioMobileEl) {
                textoUsuarioMobileEl.textContent = "Iniciar sesión";
            }
            if (userIconDesktopEl) {
                userIconDesktopEl.title = "Iniciar sesión / Registrarse";
            }
        }
    } else {
        if (textoUsuarioMobileEl) {
            textoUsuarioMobileEl.textContent = "Iniciar sesión";
        }
        if (userIconDesktopEl) {
            userIconDesktopEl.title = "Iniciar sesión / Registrarse";
        }
    }
}


// --- Fin Lógica del Modal de Registro ---


const slider = document.getElementById("slider");
let index = 0;

setInterval(() => {
  index = (index + 1) % 3;
  slider.style.transform = `translateX(-${index * 100}vw)`;
}, 10000);
//menu hamburguesa
  function toggleMenu() {
    document.querySelector('.nav-menu').classList.toggle('active');
  }

let sliderInner = document.querySelector(".slider1--inner");

let images = sliderInner.querySelectorAll("img");

let index1 = 1;

setInterval(function(){
  let percentage = index1 * -100;
  sliderInner.style.transform = "translateX(" + percentage + "%)";
  index1++;
  if(index1 > images.length - 1){
    index1 = 0;
  }
}, 30000);

// Llamar a actualizarUIUsuario al cargar la página para reflejar el estado de sesión
actualizarUIUsuario();
