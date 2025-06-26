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

const searchIcon = document.getElementById('searchIcon');
if (searchIcon) {
    searchIcon.addEventListener('click', (event) => {
        event.preventDefault();
        const terminoBusqueda = window.prompt("Buscar producto:");
        if (terminoBusqueda && terminoBusqueda.trim() !== "") {
            const resultados = buscarProductos(terminoBusqueda.trim());
            localStorage.setItem('searchResults', JSON.stringify(resultados));
            localStorage.setItem('searchTerm', terminoBusqueda.trim());
            window.location.href = 'resultados_busqueda.html';
        } else if (terminoBusqueda !== null) {
            alert("Por favor, ingrese un término de búsqueda.");
        }
    });
}

// --- Lógica del Carrito de Compras ---
let shoppingCart = [];

function getCart() {
    const cartJSON = localStorage.getItem('shoppingCart');
    if (cartJSON) {
        try { return JSON.parse(cartJSON); }
        catch (e) { console.error("Error al parsear carrito:", e); return []; }
    }
    return [];
}

function saveCart(cartArray) {
    try { localStorage.setItem('shoppingCart', JSON.stringify(cartArray)); }
    catch (e) { console.error("Error al guardar carrito:", e); alert("Error al actualizar carrito."); }
}

function initCart() {
    shoppingCart = getCart();
}

function handleAddToCart(event) {
    console.log("handleAddToCart llamado por:", event.target); // DEBUG LOG
    event.preventDefault();
    const button = event.target.closest('.btn-add-to-cart');
    if (!button) return;

    const productId = button.dataset.productId;
    const productName = button.dataset.productName;
    const productPrice = parseFloat(button.dataset.productPrice);
    const productImage = button.dataset.productImage;

    if (!productId || !productName || isNaN(productPrice) || !productImage) {
        console.error("Faltan datos del producto:", button.dataset);
        alert("Error: datos de producto incompletos.");
        return;
    }

    const productCard = button.closest('.product-card');
    let quantityInput, colorSelect;
    if (productCard) {
        quantityInput = productCard.querySelector(`.product-quantity[data-product-ref="${productId}"]`);
        colorSelect = productCard.querySelector(`.product-color[data-product-ref="${productId}"]`);
    } else {
        quantityInput = document.getElementById(`quantity-${productId}`);
        colorSelect = document.getElementById(`color-${productId}`);
    }

    let quantity = 1;
    if (quantityInput) {
        quantity = parseInt(quantityInput.value, 10);
        if (isNaN(quantity) || quantity < 1) { alert("Cantidad inválida."); quantityInput.value = 1; return; }
    }
    let color = 'default';
    if (colorSelect) color = colorSelect.value;

    const cartItemId = `${productId}_${color}`;
    const existingItemIndex = shoppingCart.findIndex(item => item.cartId === cartItemId);

    if (existingItemIndex > -1) {
        shoppingCart[existingItemIndex].cantidad += quantity;
    } else {
        shoppingCart.push({ cartId: cartItemId, id: productId, nombre: productName, precio: productPrice, imagen: productImage, cantidad: quantity, color: color });
    }
    saveCart(shoppingCart);
    alert(`"${productName}" (Color: ${color}, Cant: ${quantity}) añadido al carrito.`);
}

function attachAddToCartListeners() {
    console.log("attachAddToCartListeners llamado"); // DEBUG LOG
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    console.log("Botones '.btn-add-to-cart' encontrados:", addToCartButtons.length); // DEBUG LOG
    addToCartButtons.forEach(button => {
        console.log("Adjuntando listener a:", button); // DEBUG LOG
        button.removeEventListener('click', handleAddToCart);
        button.addEventListener('click', handleAddToCart);
    });
}

let activeCartModal = null;

function cerrarCarritoModal() {
    if (activeCartModal) { activeCartModal.remove(); activeCartModal = null; }
}

function abrirCarritoModal() {
    if (activeCartModal) return;
    // No activeModal (registro) check needed as it was removed

    const modalDiv = document.createElement('div');
    modalDiv.id = 'cartModal';
    modalDiv.className = 'modal modal-visible';

    fetch('carrito_modal_content.html')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
            return response.text();
        })
        .then(htmlContent => {
            modalDiv.innerHTML = htmlContent;
            document.body.appendChild(modalDiv);
            activeCartModal = modalDiv;
            renderCartItems();

            const closeButton = document.getElementById('closeCartModalContentButton');
            if (closeButton) closeButton.addEventListener('click', cerrarCarritoModal);

            modalDiv.addEventListener('click', (event) => {
                if (event.target === modalDiv) cerrarCarritoModal();
            });

            const checkoutButton = document.getElementById('checkoutButton');
            if (checkoutButton) {
                // El listener ahora llama a handleCheckout, que a su vez llamará a abrirMediosPagoModal
                checkoutButton.addEventListener('click', handleCheckout);
            }
        })
        .catch(error => {
            console.error('Error al cargar modal del carrito:', error);
            alert('Hubo un error al cargar el carrito.');
            if (modalDiv.parentElement) modalDiv.remove();
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

function renderCartItems() {
    console.log("renderCartItems - Carrito actual:", JSON.parse(JSON.stringify(shoppingCart)));

    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalAmountEl = document.getElementById('cartTotalAmountValue');
    const emptyCartMessageEl = document.getElementById('emptyCartMessage');

    if (!cartItemsList || !cartTotalAmountEl || !emptyCartMessageEl) {
        console.error("Elementos del modal del carrito no encontrados en renderCartItems. IDs esperados: cartItemsList, cartTotalAmountValue, emptyCartMessage");
        return;
    }

    cartItemsList.innerHTML = ''; // Limpiar items anteriores
    let totalGeneral = 0;

    if (shoppingCart.length === 0) {
        emptyCartMessageEl.style.display = 'block';
        cartItemsList.style.display = 'none';
    } else {
        emptyCartMessageEl.style.display = 'none';
        cartItemsList.style.display = 'block';
        shoppingCart.forEach(item => {
            const itemSubtotal = item.precio * item.cantidad;
            totalGeneral += itemSubtotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.dataset.cartItemId = item.cartId;
            itemDiv.innerHTML = `
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image">
                <div class="cart-item-details">
                    <p class="cart-item-name">${item.nombre}</p>
                    <p class="cart-item-price">$${item.precio.toFixed(2)}</p>
                    <p class="cart-item-color">Color: ${item.color}</p>
                    <p class="cart-item-quantity">Cantidad: ${item.cantidad}</p>
                </div>
                <p class="cart-item-subtotal">$${itemSubtotal.toFixed(2)}</p>
                <button class="cart-item-remove" data-cart-item-id="${item.cartId}">&times; Eliminar</button>
            `;
            // console.log("Renderizando item:", item.nombre);
            cartItemsList.appendChild(itemDiv);
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

function handleRemoveItem(event) {
    console.log("handleRemoveItem - event.target:", event.target);
    const cartItemIdToRemove = event.target.dataset.cartItemId;
    console.log("handleRemoveItem - cartItemIdToRemove:", cartItemIdToRemove);

    if (!cartItemIdToRemove) {
        console.error("ID de item a eliminar no encontrado en el dataset del botón.");
        return;
    }

    shoppingCart = shoppingCart.filter(item => item.cartId !== cartItemIdToRemove);
    console.log("handleRemoveItem - Carrito DESPUÉS de filter:", JSON.parse(JSON.stringify(shoppingCart)));

    saveCart(shoppingCart);

    console.log("handleRemoveItem - Llamando a renderCartItems...");
    renderCartItems();
}
// --- Fin Lógica Modal Carrito ---

// --- Lógica para Modal de Medios de Pago ---
let activeMediosPagoModal = null; // Para rastrear el modal de medios de pago

function cerrarMediosPagoModal() {
    if (activeMediosPagoModal) {
        activeMediosPagoModal.remove();
        activeMediosPagoModal = null;
    }
}

function abrirMediosPagoModal() {
    if (activeMediosPagoModal) return; // Ya está abierto

    cerrarCarritoModal(); // Cerrar el modal del carrito primero

    const modalDiv = document.createElement('div');
    modalDiv.id = 'mediosPagoModal';
    modalDiv.className = 'modal modal-visible';

    fetch('medios_pago_modal_content.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for medios_pago_modal_content.html');
            }
            return response.text();
        })
        .then(htmlContent => {
            modalDiv.innerHTML = htmlContent;
            document.body.appendChild(modalDiv);
            activeMediosPagoModal = modalDiv;

            // Adjuntar listeners a los botones del nuevo modal
            const closeBtn = document.getElementById('closeMediosPagoModalButton');
            if (closeBtn) {
                closeBtn.addEventListener('click', cerrarMediosPagoModal);
            }

            const cancelBtn = document.getElementById('cancelMediosPagoButton');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', cerrarMediosPagoModal);
            }

            const sendWhatsAppBtn = document.getElementById('sendOrderWhatsAppButton');
            if (sendWhatsAppBtn) {
                sendWhatsAppBtn.addEventListener('click', enviarPedidoWhatsApp); // Se definirá después
            }

            // Cerrar al hacer clic en el overlay
            modalDiv.addEventListener('click', (event) => {
                if (event.target === modalDiv) {
                    cerrarMediosPagoModal();
                }
            });
        })
        .catch(error => {
            console.error('Error al cargar el modal de medios de pago:', error);
            alert('Hubo un error al mostrar los medios de pago.');
            if (modalDiv.parentElement) { // Si el div se añadió al body antes del error
                modalDiv.remove();
            }
            activeMediosPagoModal = null;
        });
}

// Placeholder para enviarPedidoWhatsApp
function enviarPedidoWhatsApp() {
    if (shoppingCart.length === 0) {
        alert("Tu carrito está vacío. Añade productos antes de enviar el pedido.");
        return;
    }

    const TU_NUMERO_WHATSAPP = "573001234567"; // ¡¡¡REEMPLAZAR CON TU NÚMERO REAL!!! Ej: 573001234567

    let mensajePedido = "¡Hola! Quisiera realizar el siguiente pedido:\\n\\n";
    let totalGeneralPedido = 0;

    shoppingCart.forEach(item => {
        const subtotalItem = item.precio * item.cantidad;
        mensajePedido += `Producto: ${item.nombre}\\n`;
        mensajePedido += `Color: ${item.color}\\n`;
        mensajePedido += `Cantidad: ${item.cantidad}\\n`;
        mensajePedido += `Precio Unitario: $${item.precio.toFixed(2)}\\n`;
        mensajePedido += `Subtotal: $${subtotalItem.toFixed(2)}\\n\\n`;
        totalGeneralPedido += subtotalItem;
    });

    mensajePedido += `-----------------------------------\\n`;
    mensajePedido += `TOTAL DEL PEDIDO: $${totalGeneralPedido.toFixed(2)}\\n\\n`;
    mensajePedido += `Agradezco la confirmación y los próximos pasos.\\n`;

    const encodedMensaje = encodeURIComponent(mensajePedido);
    const whatsappURL = `https://api.whatsapp.com/send?phone=${TU_NUMERO_WHATSAPP}&text=${encodedMensaje}`;

    window.open(whatsappURL, '_blank');

    alert("Serás redirigido a WhatsApp para enviar tu pedido. Una vez enviado, tu carrito se vaciará.");

    shoppingCart = [];
    saveCart(shoppingCart);

    cerrarMediosPagoModal();
    if (activeCartModal) { // Aunque ya debería estar cerrado por abrirMediosPagoModal
        cerrarCarritoModal();
    }
    // updateCartIconCount();
}

// Handler para el botón de checkout del carrito
function handleCheckout() {
    if(shoppingCart.length === 0){
        alert("Tu carrito está vacío.");
        return;
    }
    // console.log("Cerrando modal del carrito antes de abrir medios de pago...");
    // cerrarCarritoModal(); // Se llamará dentro de abrirMediosPagoModal
    abrirMediosPagoModal();
}
// --- Fin Lógica para Modal de Medios de Pago ---

// Slider de texto (original)
const slider = document.getElementById("slider");
if (slider) {
    let index = 0;
    setInterval(() => {
      index = (index + 1) % 3; // Asumiendo 3 slides de texto
      slider.style.transform = `translateX(-${index * 100}vw)`;
    }, 10000);
}

// Menu hamburguesa (original)
function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// Slider de imágenes (original, con correcciones)
const sliderInner = document.querySelector(".slider1--inner");
if (sliderInner) {
    const images = sliderInner.querySelectorAll("img");
    if (images.length > 0) {
        let imageIndex = 0;
        function changeImageSlide() {
            imageIndex = (imageIndex + 1) % images.length;
            let percentage = imageIndex * -100;
            sliderInner.style.transform = "translateX(" + percentage + "%)";
        }
        setInterval(changeImageSlide, 5000);
    }
}

// Llamadas iniciales al cargar la página
// (Llamada a actualizarUIUsuario eliminada)
initCart();
attachAddToCartListeners();
