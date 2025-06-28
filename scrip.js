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
let activeMediosPagoModal = null;
const COSTO_ENVIO_FIJO = 10000;
const COSTO_ENVIO_PRIORITARIO = 5000;

// Placeholders para las nuevas funciones
function renderizarResumenPedidoEnModalPago() {
    const orderItemsContainer = document.getElementById('paymentOrderItems');
    const subtotalProductsEl = document.getElementById('paymentSubtotalProducts');

    if (!orderItemsContainer || !subtotalProductsEl) {
        console.error("Elementos para el resumen del pedido en modal de pago no encontrados.");
        return 0; // Devuelve 0 si no se pueden renderizar los items
    }

    orderItemsContainer.innerHTML = ''; // Limpiar items anteriores
    let subtotalProductos = 0;

    if (shoppingCart.length === 0) {
        orderItemsContainer.innerHTML = '<p>No hay productos en tu pedido.</p>';
    } else {
        shoppingCart.forEach(item => {
            subtotalProductos += item.precio * item.cantidad;
            const itemSummaryHTML = `
                <div class="payment-order-item">
                    <img src="${item.imagen}" alt="${item.nombre}" class="payment-order-item-image">
                    <div class="payment-order-item-details">
                        <p class="payment-order-item-name">${item.nombre} (Color: ${item.color}, Cant: ${item.cantidad})</p>
                    </div>
                    <p class="payment-order-item-price">$${(item.precio * item.cantidad).toFixed(2)}</p>
                </div>
            `;
            orderItemsContainer.innerHTML += itemSummaryHTML;
        });
    }

    subtotalProductsEl.textContent = `$${subtotalProductos.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    return subtotalProductos;
}

function actualizarTotalFinal() {
    const subtotalProductosEl = document.getElementById('paymentSubtotalProducts');
    const shippingCostEl = document.getElementById('paymentShippingCost');
    const priorityShippingCostEl = document.getElementById('paymentPriorityShippingCost');
    const totalFinalContraentregaEl = document.getElementById('paymentTotalFinalContraentrega');
    const totalContraentregaBotonSpan = document.getElementById('totalContraentregaBoton');
    const chkEnvioPrioritario = document.getElementById('chkEnvioPrioritario');

    if (!subtotalProductosEl || !shippingCostEl || !priorityShippingCostEl || !totalFinalContraentregaEl || !totalContraentregaBotonSpan) {
        console.error("Elementos del DOM para actualizar totales no encontrados en actualizarTotalFinal.");
        return;
    }

    let subtotalProductos = 0;
    shoppingCart.forEach(item => { // Recalcular subtotal basado en el carrito actual
        subtotalProductos += item.precio * item.cantidad;
    });
    // paymentSubtotalProducts ya es actualizado por renderizarResumenPedidoEnModalPago, pero lo recalculamos
    // para que esta función sea independiente si se llama solo por el checkbox.
    // O podríamos leer el valor del DOM, pero recalcular es más seguro.
    subtotalProductosEl.textContent = `$${subtotalProductos.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;


    // shippingCostEl.textContent = `$${COSTO_ENVIO_FIJO.toLocaleString('es-CO')} COP`; // Ya está en el HTML y es fijo

    let costoPrioritario = 0;
    if (chkEnvioPrioritario && chkEnvioPrioritario.checked) {
        costoPrioritario = COSTO_ENVIO_PRIORITARIO;
    }
    priorityShippingCostEl.textContent = `$${costoPrioritario.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} COP`;

    const totalFinal = subtotalProductos + COSTO_ENVIO_FIJO + costoPrioritario;

    const formatoCOP = { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 };

    // Asegurarse que los elementos existen antes de setear textContent
    if (totalFinalContraentregaEl) {
      totalFinalContraentregaEl.textContent = `${totalFinal.toLocaleString('es-CO', formatoCOP)} COP`;
    }
    if (totalContraentregaBotonSpan) {
      totalContraentregaBotonSpan.textContent = `${totalFinal.toLocaleString('es-CO', formatoCOP)}`;
    }
}

function validarYEnviarPedidoContraentrega() {
    // Validar formulario de envío
    const envioNombre = document.getElementById('envioNombre').value.trim();
    const envioTelefono = document.getElementById('envioTelefono').value.trim();
    const envioDepartamento = document.getElementById('envioDepartamento').value.trim();
    const envioCiudad = document.getElementById('envioCiudad').value.trim();
    const envioDireccion = document.getElementById('envioDireccion').value.trim();
    // Campos opcionales
    const envioBarrio = document.getElementById('envioBarrio').value.trim();
    const envioReferencia = document.getElementById('envioReferencia').value.trim();
    const envioTalla = document.getElementById('envioTalla').value.trim();

    if (!envioNombre || !envioTelefono || !envioDepartamento || !envioCiudad || !envioDireccion) {
        alert("Por favor, completa todos los campos de envío requeridos (Nombre, Teléfono, Departamento, Ciudad, Dirección).");
        return;
    }

    if (shoppingCart.length === 0) {
        alert("Tu carrito está vacío. Añade productos antes de enviar el pedido.");
        return;
    }

    // Recalcular subtotal y costos para el mensaje (para asegurar consistencia)
    let subtotalProductos = 0;
    shoppingCart.forEach(item => { subtotalProductos += item.precio * item.cantidad; });

    const chkEnvioPrioritario = document.getElementById('chkEnvioPrioritario');
    let costoPrioritario = 0;
    let esEnvioPrioritario = false;
    if (chkEnvioPrioritario && chkEnvioPrioritario.checked) {
        costoPrioritario = COSTO_ENVIO_PRIORITARIO;
        esEnvioPrioritario = true;
    }
    const totalPedido = subtotalProductos + COSTO_ENVIO_FIJO + costoPrioritario;

    // Formatear mensaje para WhatsApp
    const TU_NUMERO_WHATSAPP = "573127750773"; // REEMPLAZAR con tu número real

    let mensajePedido = "🛍️ *NUEVO PEDIDO CONTRAENTREGA* 🛍️\\n\\n";
    mensajePedido += "--- *Productos* ---\\n";
    shoppingCart.forEach(item => {
        mensajePedido += `▪️ ${item.nombre}\\n`;
        mensajePedido += `  Color: ${item.color}\\n`;
        mensajePedido += `  Cantidad: ${item.cantidad}\\n`;
        mensajePedido += `  Precio Unit: $${item.precio.toLocaleString('es-CO', {minimumFractionDigits:0, maximumFractionDigits:0})}\\n`;
        mensajePedido += `  Subtotal: $${(item.precio * item.cantidad).toLocaleString('es-CO', {minimumFractionDigits:0, maximumFractionDigits:0})}\\n\\n`;
    });
    mensajePedido += `-----------------------------------\\n`;
    mensajePedido += `SUBTOTAL PRODUCTOS: $${subtotalProductos.toLocaleString('es-CO', {minimumFractionDigits:0, maximumFractionDigits:0})}\\n`;
    mensajePedido += `ENVÍO: $${COSTO_ENVIO_FIJO.toLocaleString('es-CO', {minimumFractionDigits:0, maximumFractionDigits:0})}\\n`;
    if (esEnvioPrioritario) {
        mensajePedido += `ENVÍO PRIORITARIO: $${costoPrioritario.toLocaleString('es-CO', {minimumFractionDigits:0, maximumFractionDigits:0})}\\n`;
    }
    mensajePedido += `*TOTAL A PAGAR (Contraentrega): $${totalPedido.toLocaleString('es-CO', {minimumFractionDigits:0, maximumFractionDigits:0})}*\\n`;
    mensajePedido += `-----------------------------------\\n\\n`;
    mensajePedido += "--- *Datos de Envío* ---\\n";
    mensajePedido += `Nombre: ${envioNombre}\\n`;
    mensajePedido += `Teléfono: ${envioTelefono}\\n`;
    mensajePedido += `Departamento: ${envioDepartamento}\\n`;
    mensajePedido += `Ciudad/Municipio: ${envioCiudad}\\n`;
    mensajePedido += `Dirección: ${envioDireccion}\\n`;
    if (envioBarrio) mensajePedido += `Barrio: ${envioBarrio}\\n`;
    if (envioReferencia) mensajePedido += `Ref/Observaciones: ${envioReferencia}\\n`;
    if (envioTalla) mensajePedido += `Talla(s) Confirmada(s): ${envioTalla}\\n`;
    mensajePedido += `\\n¡Gracias! Espero confirmación.`;

    const encodedMensaje = encodeURIComponent(mensajePedido);
    const whatsappURL = `https://api.whatsapp.com/send?phone=${TU_NUMERO_WHATSAPP}&text=${encodedMensaje}`;

    window.open(whatsappURL, '_blank');

    alert("Serás redirigido a WhatsApp para enviar los detalles de tu pedido contraentrega. Tu carrito se vaciará.");

    shoppingCart = [];
    saveCart(shoppingCart);

    cerrarMediosPagoModal();
    // Si se reabre el carrito después, debería estar vacío.
    // Si el modal del carrito estuviera aún visible por alguna razón (no debería),
    // se podría llamar a renderCartItems() para actualizarlo, pero cerrarMediosPagoModal() es suficiente.
}


function cerrarMediosPagoModal() {
    if (activeMediosPagoModal) {
        activeMediosPagoModal.remove();
        activeMediosPagoModal = null;
    }
}

function abrirMediosPagoModal() {
    if (activeMediosPagoModal) return;

    cerrarCarritoModal();

    const modalDiv = document.createElement('div');
    modalDiv.id = 'mediosPagoModal';
    modalDiv.className = 'modal modal-visible';

    fetch('medios_pago_modal_content.html')
        .then(response => {
            if (!response.ok) throw new Error('Network error al cargar medios_pago_modal_content.html');
            return response.text();
        })
        .then(htmlContent => {
            modalDiv.innerHTML = htmlContent;
            document.body.appendChild(modalDiv);
            activeMediosPagoModal = modalDiv;

            // Poblar resumen y calcular totales iniciales
            const subtotalProductos = renderizarResumenPedidoEnModalPago(); // Implementar esta función
            // El siguiente getElementById será null si el contenido no tiene paymentShippingCost
            const shippingCostEl = document.getElementById('paymentShippingCost');
            if(shippingCostEl) shippingCostEl.textContent = `$${COSTO_ENVIO_FIJO.toLocaleString('es-CO')} COP`;

            actualizarTotalFinal(); // Llamada inicial para calcular total con envío fijo y opcional prioritario

            // Listeners para botones del modal de medios de pago
            const closeBtn = document.getElementById('closeMediosPagoModalButton');
            if (closeBtn) closeBtn.addEventListener('click', cerrarMediosPagoModal);

            const cancelBtn = document.getElementById('cancelMediosPagoButton');
            if (cancelBtn) cancelBtn.addEventListener('click', cerrarMediosPagoModal);

            const chkPrioritario = document.getElementById('chkEnvioPrioritario');
            if (chkPrioritario) chkPrioritario.addEventListener('change', actualizarTotalFinal);

            const btnHacerPedido = document.getElementById('btnHacerPedidoContraentrega');
            if (btnHacerPedido) btnHacerPedido.addEventListener('click', validarYEnviarPedidoContraentrega);

            const btnPagoAnticipado = document.getElementById('btnPagoAnticipado');
            const detallesAnticipado = document.querySelector('.payment-details-anticipado');
            if (btnPagoAnticipado && detallesAnticipado) {
                btnPagoAnticipado.addEventListener('click', () => {
                    detallesAnticipado.style.display = detallesAnticipado.style.display === 'none' ? 'block' : 'none';
                });
            }

            modalDiv.addEventListener('click', (event) => {
                if (event.target === modalDiv) cerrarMediosPagoModal();
            });
        })
        .catch(error => {
            console.error('Error al cargar el modal de medios de pago:', error);
            alert('Hubo un error al mostrar los medios de pago.');
            if (modalDiv.parentElement) modalDiv.remove();
            activeMediosPagoModal = null;
        });
}

// La función enviarPedidoWhatsApp se reemplazará/renombrará a validarYEnviarPedidoContraentrega
// y se moverá o modificará su contenido. Por ahora, la dejo comentada o la eliminaremos en el siguiente paso.
// function enviarPedidoWhatsApp() { ... }


// Handler para el botón de checkout del carrito
function handleCheckout() {
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
