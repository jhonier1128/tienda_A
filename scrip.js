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

// --- Lógica del Carrito de Compras ---
let shoppingCart = []; // Variable para mantener el estado del carrito en memoria

function getCart() {
    const cartJSON = localStorage.getItem('shoppingCart');
    if (cartJSON) {
        try {
            return JSON.parse(cartJSON);
        } catch (e) {
            console.error("Error al parsear el carrito desde localStorage:", e);
            return []; // Devuelve carrito vacío si hay error
        }
    }
    return []; // Devuelve carrito vacío si no existe en localStorage
}

function saveCart(cartArray) {
    try {
        localStorage.setItem('shoppingCart', JSON.stringify(cartArray));
        // Podríamos disparar un evento personalizado aquí si otras partes de la app necesitan saber que el carrito cambió.
        // document.dispatchEvent(new CustomEvent('cartUpdated'));
        // updateCartIconCount(); // Actualizar contador del ícono del carrito
    } catch (e) {
        console.error("Error al guardar el carrito en localStorage:", e);
        alert("Hubo un error al actualizar el carrito. Puede que el almacenamiento esté lleno.");
    }
}

function initCart() {
    shoppingCart = getCart();
    // console.log("Carrito inicializado:", shoppingCart); // Para depuración
    // updateCartIconCount();
}

// Placeholder para funciones futuras del carrito
// function updateCartIconCount() {
//     const cartItemCount = shoppingCart.reduce((total, item) => total + item.cantidad, 0);
//     const cartIconCounter = document.getElementById('cartIconCounter'); // Asumir que existe un span para el contador
//     if (cartIconCounter) {
//         cartIconCounter.textContent = cartItemCount > 0 ? cartItemCount : '';
//         cartIconCounter.style.display = cartItemCount > 0 ? 'inline' : 'none';
//     }
// }
// function abrirCarritoModal() { /* ... se definirá después ... */ }
// function cerrarCarritoModal() { /* ... se definirá después ... */ }
// function renderCartItems() { /* ... se definirá después ... */ }

function handleAddToCart(event) {
    event.preventDefault();
    const button = event.target.closest('.btn-add-to-cart'); // Asegurarse de obtener el botón si hay elementos hijos

    if (!button) return;

    const productId = button.dataset.productId;
    const productName = button.dataset.productName;
    const productPrice = parseFloat(button.dataset.productPrice);
    const productImage = button.dataset.productImage;

    if (!productId || !productName || isNaN(productPrice) || !productImage) {
        console.error("Faltan datos del producto en el botón:", button.dataset);
        alert("Error: No se pudo añadir el producto, faltan datos.");
        return;
    }

    // Encontrar los inputs de cantidad y color asociados
    // Asumimos que están dentro del mismo .product-card o un contenedor común cercano
    const productCard = button.closest('.product-card');
    let quantityInput, colorSelect;

    if (productCard) {
        quantityInput = productCard.querySelector(`.product-quantity[data-product-ref="${productId}"]`);
        colorSelect = productCard.querySelector(`.product-color[data-product-ref="${productId}"]`);
    } else {
        // Fallback por si la estructura es diferente o el botón está fuera de un .product-card
        // (por ejemplo, en las ofertas de index.html que aún no hemos adaptado)
        quantityInput = document.getElementById(`quantity-${productId}`); // Asume ID único si no está en tarjeta
        colorSelect = document.getElementById(`color-${productId}`);
    }

    let quantity = 1;
    if (quantityInput) {
        quantity = parseInt(quantityInput.value, 10);
        if (isNaN(quantity) || quantity < 1) {
            alert("Por favor, ingrese una cantidad válida.");
            quantityInput.value = 1;
            return;
        }
    } else {
        // Si no hay input de cantidad (ej. ofertas en index.html), se asume 1.
        // console.warn(`Input de cantidad no encontrado para producto ID: ${productId}. Usando cantidad 1.`);
    }

    let color = 'default';
    if (colorSelect) {
        color = colorSelect.value;
    } else {
        // Si no hay select de color, se asume 'default'.
        // console.warn(`Select de color no encontrado para producto ID: ${productId}. Usando color por defecto.`);
    }

    const cartItemId = `${productId}_${color}`;
    const existingItemIndex = shoppingCart.findIndex(item => item.cartId === cartItemId);

    if (existingItemIndex > -1) {
        shoppingCart[existingItemIndex].cantidad += quantity;
    } else {
        const newItem = {
            cartId: cartItemId,
            id: productId,
            nombre: productName,
            precio: productPrice,
            imagen: productImage,
            cantidad: quantity,
            color: color
        };
        shoppingCart.push(newItem);
    }

    saveCart(shoppingCart);
    // updateCartIconCount();
    alert(`"${productName}" (Color: ${color}, Cant: ${quantity}) añadido al carrito.`);
    // console.log("Carrito actualizado:", shoppingCart);
}

function attachAddToCartListeners() {
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    addToCartButtons.forEach(button => {
        // Remover listener anterior para evitar duplicados si se llama múltiples veces
        button.removeEventListener('click', handleAddToCart);
        button.addEventListener('click', handleAddToCart);
    });
}

// --- Fin Lógica Base del Carrito de Compras ---

// --- Lógica para Mostrar/Ocultar Modal del Carrito ---
let activeCartModal = null; // Para rastrear el modal del carrito

function cerrarCarritoModal() {
    if (activeCartModal) {
        activeCartModal.remove();
        activeCartModal = null;
    }
}

function abrirCarritoModal() {
    if (activeCartModal) {
        return;
    }
    if (activeModal) { // Si el modal de registro (u otro) está activo
        activeModal.remove();
        activeModal = null;
    }

    const modalDiv = document.createElement('div');
    modalDiv.id = 'cartModal';
    modalDiv.className = 'modal modal-visible';

    fetch('carrito_modal_content.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(htmlContent => {
            modalDiv.innerHTML = htmlContent;
            document.body.appendChild(modalDiv);
            activeCartModal = modalDiv;

            renderCartItems(); // Se definirá en el siguiente paso

            const closeButton = document.getElementById('closeCartModalContentButton');
            if (closeButton) {
                closeButton.addEventListener('click', cerrarCarritoModal);
            }

            modalDiv.addEventListener('click', (event) => {
                if (event.target === modalDiv) {
                    cerrarCarritoModal();
                }
            });

            const checkoutButton = document.getElementById('checkoutButton');
            if (checkoutButton) {
                checkoutButton.addEventListener('click', () => {
                    if(shoppingCart.length === 0){
                        alert("Tu carrito está vacío.");
                        return;
                    }
                    alert("Procediendo al pago (funcionalidad no implementada).");
                });
            }
        })
        .catch(error => {
            console.error('Error al cargar el modal del carrito:', error);
            alert('Hubo un error al cargar el carrito. Inténtelo más tarde.');
            if (modalDiv.parentElement) {
                modalDiv.remove();
            }
            activeCartModal = null;
        });
}

const cartIcon = document.querySelector('.iconos a:nth-child(3)');
if (cartIcon) {
    cartIcon.addEventListener('click', (event) => {
        event.preventDefault();
        abrirCarritoModal();
    });
}

// Placeholder para renderCartItems - se completará en el siguiente paso
function renderCartItems() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalAmountEl = document.getElementById('cartTotalAmountValue');
    const emptyCartMessageEl = document.getElementById('emptyCartMessage');

    if (!cartItemsList || !cartTotalAmountEl || !emptyCartMessageEl) {
        console.error("Elementos del modal del carrito no encontrados. No se puede renderizar.");
        return;
    }

    cartItemsList.innerHTML = '';
    let totalGeneral = 0;

    if (shoppingCart.length === 0) {
        if(emptyCartMessageEl) emptyCartMessageEl.style.display = 'block';
        // cartItemsList.innerHTML = '<p id="emptyCartMessage">Tu carrito está vacío.</p>'; // El p ya existe
    } else {
        if(emptyCartMessageEl) emptyCartMessageEl.style.display = 'none';
        shoppingCart.forEach(item => {
            const itemSubtotal = item.precio * item.cantidad;
            totalGeneral += itemSubtotal;

            const itemHTML = `
                <div class="cart-item" data-cart-item-id="${item.cartId}">
                    <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image">
                    <div class="cart-item-details">
                        <p class="cart-item-name">${item.nombre}</p>
                        <p class="cart-item-price">$${item.precio.toFixed(2)}</p>
                        <p class="cart-item-color">Color: ${item.color}</p>
                        <p class="cart-item-quantity">Cantidad: ${item.cantidad}</p>
                    </div>
                    <p class="cart-item-subtotal">$${itemSubtotal.toFixed(2)}</p>
                    <button class="cart-item-remove" data-cart-item-id="${item.cartId}">&times; Eliminar</button>
                </div>
            `;
            cartItemsList.innerHTML += itemHTML;
        });
    }

    if (cartTotalAmountEl) {
        cartTotalAmountEl.textContent = `$${totalGeneral.toFixed(2)}`;
    }

    attachRemoveItemListeners();
}

function attachRemoveItemListeners() {
    const removeButtons = document.querySelectorAll('.cart-item-remove');
    removeButtons.forEach(button => {
        button.removeEventListener('click', handleRemoveItem);
        button.addEventListener('click', handleRemoveItem);
    });
}

// La función handleRemoveItem se definirá en el siguiente paso del plan.
function handleRemoveItem(event) {
    const cartItemIdToRemove = event.target.dataset.cartItemId;

    if (!cartItemIdToRemove) {
        console.error("No se pudo identificar el item a eliminar del carrito.");
        return;
    }

    // Filtrar el array shoppingCart para remover el item
    shoppingCart = shoppingCart.filter(item => item.cartId !== cartItemIdToRemove);

    saveCart(shoppingCart); // Guardar el carrito actualizado en localStorage
    renderCartItems();      // Volver a renderizar el modal del carrito
    // updateCartIconCount(); // Actualizar el contador del icono del carrito

    // console.log(`Item ${cartItemIdToRemove} eliminado. Carrito:`, shoppingCart);
}
// --- Fin Lógica Modal Carrito ---


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
// Llamar a initCart para cargar el carrito desde localStorage al iniciar
initCart();
// Adjuntar listeners a los botones "Añadir al Carrito" existentes en la página
attachAddToCartListeners();
