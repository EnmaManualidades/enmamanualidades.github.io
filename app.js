// Seleccionamos los elementos del DOM
let allProducts = []; // Para almacenar todos los productos
let displayedProducts = 0; // Contador de productos ya mostrados
const PRODUCTS_PER_LOAD = 10; // Cantidad de productos a cargar por bloque

const productsContainer = document.getElementById("products");
const searchInput = document.getElementById("search-input");
const tagsFilter = document.getElementById("tags-filter");
const priceFilter = document.getElementById("price-filter");
const priceValue = document.getElementById("price-value");
const menuButton = document.getElementById("menu-button");
const menuOverlay = document.getElementById("menu-overlay");
const menuItems = document.querySelectorAll(".menu-item"); // Seleccionamos los elementos del menú

// Abrir el menú al hacer clic en el botón
menuButton.addEventListener("click", () => {
  menuOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Deshabilitar scroll
});

// Cerrar el menú al hacer clic fuera del contenedor
menuOverlay.addEventListener("click", (e) => {
  if (e.target === menuOverlay) {
    menuOverlay.classList.add("hidden");
    document.body.style.overflow = "auto"; // Rehabilitar scroll
  }
});

// Cargar productos desde el archivo JSON
fetch("productos.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Error al cargar el archivo JSON");
    }
    return response.json();
  })
  .then((products) => {
    allProducts = products; // Almacena todos los productos
    renderNextProducts(); // Carga los primeros productos
    fillTagFilter(allProducts);
    setupFilters(allProducts);

    // Configurar eventos de clic para los elementos del menú
    menuItems.forEach((item) => {
      item.addEventListener("click", () => {
        const category = item.dataset.category; // Obtener la categoría del atributo data-category
        resetCategoryFilter(category); // Resetea la categoría seleccionada y aplica el nuevo filtro
        menuOverlay.classList.add("hidden"); // Cerrar el menú
        document.body.style.overflow = "auto"; // Rehabilitar scroll
      });
    });
  })
  .catch((error) => {
    console.error("Hubo un problema con la carga del JSON:", error);
  });

// Función para resetear el filtro de categoría
function resetCategoryFilter(category) {
  // Reseteamos los filtros previos (búsqueda, etiquetas, precio)
  searchInput.value = ""; // Limpia el campo de búsqueda
  priceFilter.value = priceFilter.max; // Resetea el rango de precios al máximo
  priceValue.textContent = `${priceFilter.max}€`; // Actualiza la visualización del rango de precios

  // Establecemos el filtro de etiquetas a la categoría seleccionada
  tagsFilter.value = category; // Cambia el filtro de etiquetas a la categoría seleccionada

  // Forzar la aplicación del filtro de etiquetas y actualización de los productos
  applyFilters();
}

// Función para renderizar los próximos productos
function renderNextProducts() {
  const nextProducts = allProducts.slice(displayedProducts, displayedProducts + PRODUCTS_PER_LOAD);
  
  renderProducts(nextProducts, false); // No limpiar productos previos
  displayedProducts += nextProducts.length; // Incrementa el contador
}

// Renderizar productos en la página
function renderProducts(products, clear = true) {
  if (clear) productsContainer.innerHTML = ""; // Limpiar productos previos solo si se indica

  products.forEach((product, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <a href="producto.html#producto${product.id}">
        <div class="card-image-container">
          <span class="price">${product.price}€</span>
          <img src="${product.imgUrl}" alt="${product.title}">
          <button class="add-to-cart" data-index="${index}">
            <i class="fas fa-shopping-cart"></i>
          </button>
        </div>
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <div class="tags">
          ${product.tags.map((tag) => `<div class="tag">${tag}</div>`).join("")}
        </div>
      </a>
    `;
    productsContainer.appendChild(card);
  });

  // Agregar eventos al botón "Añadir al carrito"
  document.querySelectorAll(".add-to-cart").forEach((button) =>
    button.addEventListener("click", (e) => {
      if (!user) {
        alert("Inicia sesión para agregar productos al carrito.");
        return;
      }
      const product = products[e.target.dataset.index];
      cart.push(product);
      alert("Producto agregado al carrito");
      updateCartPopup();
    })
  );
}

// Cargar más productos cuando se hace scroll
window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 10 && displayedProducts < allProducts.length) {
    renderNextProducts(); // Cargar más productos
  }
});

// Función para resetear la visualización de productos
function resetDisplay() {
  displayedProducts = 0;
  productsContainer.innerHTML = "";
}

// Renderizar productos filtrados
function renderFilteredProducts(filteredProducts) {
  resetDisplay();
  allProducts = filteredProducts; // Actualiza los productos a filtrar
  renderNextProducts(); // Renderiza los primeros resultados filtrados
}

// Llenar las opciones de filtro de etiquetas
function fillTagFilter(products) {
  const tags = new Set();
  products.forEach(product => {
    product.tags.forEach(tag => tags.add(tag));
  });

  tags.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.innerText = tag;
    tagsFilter.appendChild(option);
  });
}

// Configurar filtros
function setupFilters(products) {
  // Filtrar por búsqueda
  searchInput.addEventListener("input", () => {
    applyFilters();
  });

  // Filtrar por etiquetas
  tagsFilter.addEventListener("change", () => {
    applyFilters();
  });

  // Filtrar por rango de precios
  priceFilter.addEventListener("input", () => {
    priceValue.textContent = `${priceFilter.value}€`;
    applyFilters();
  });
}

// Función para aplicar todos los filtros
function applyFilters() {
  const query = searchInput.value.toLowerCase();
  const category = tagsFilter.value; // Filtro por categoría
  const price = priceFilter.value;

  const filteredProducts = filterProducts(allProducts, query, category, price);
  renderProducts(filteredProducts);
}

// Función de filtrado
function filterProducts(products, query, category, price) {
  return products.filter(product => {
    const matchesQuery = product.title.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
    const matchesCategory = category ? product.category === category : true; // Filtra solo por categoría si se especifica
    const matchesTag = category ? product.tags.includes(category) : true; // Filtra por etiquetas si se selecciona una categoría
    let matchesPrice = true;
    if (price) {
      matchesPrice = product.price <= price;
    }

    return matchesQuery && matchesCategory && matchesTag && matchesPrice;
  });
}

  (function() {
  // Cambiar logo y fondo si es temporada navideña
  //cambiar a esta fecha para comprobar como se ve sin ser navideña
  //const today = new Date('2024-02-01');
  const today = new Date();
  const startNavidad = new Date(today.getFullYear(), 11, 1); // 1 de diciembre
  const endNavidad = new Date(today.getFullYear() + 1, 0, 10); // 10 de enero del siguiente año

  if (today >= startNavidad && today <= endNavidad) {
    // Cambiar el logo del nav
    document.getElementById('nav-logo').src = 'TEMPORADAS/Temporada Navidad/EnmaManualidadesNavidadLogo.png';

    // Cambiar el logo de la clase menu-logo
    const menuLogo = document.querySelector('.menu-logo');
    if (menuLogo) {
      menuLogo.src = 'TEMPORADAS/Temporada Navidad/EnmaManualidadesNavidadLogo.png';
    }

    // Cambiar el fondo
    document.body.style.background = 'linear-gradient(0deg, rgba(202, 169, 106, 1) 0%, rgba(77, 11, 70, 1) 100%)';

    // Cambiar estilos adicionales
    const style = document.createElement('style');
    style.textContent = `
      .card {
        background-color: rgb(221, 206, 175);
        border: 1px solid rgb(255, 255, 255);
      }

      #search-bar input {
        background-color: rgb(221, 206, 175);
      }

      #filters {
        background-color: rgb(221, 206, 175);
      }

      /* Cambiar el color del precio */
      .card-image-container .price {
        color: #6d0a38;
      }

      /* Cambiar el color del título h3 */
      .card h3 {
        color: #6d0a38;
      }

      /* Cambiar el color de fondo de las etiquetas */
      .card .tags div {
        background-color: #6d0a38;
      }

      /* Cambiar el color de fondo del botón de añadir al carrito */
      .add-to-cart {
        background-color: #6d0a38;
      }
    `;
    document.head.appendChild(style);
  }
})();