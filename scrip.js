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
