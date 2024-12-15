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
// Seleccionamos el contenedor de carga
const loadingPlaceholder = document.getElementById("loading-placeholder");

// Mostrar el placeholder antes de hacer la petición
loadingPlaceholder.style.display = "flex";
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
    // Ocultar los "divs" de carga cuando los productos se han cargado
    loadingPlaceholder.style.display = "none";

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
  // Fecha actual
  const today = new Date(); // Puedes probar con new Date('2025-02-14') para San Valentín, o '2024-11-29' para Black Friday

  // Función para restablecer la hora a las 00:00:00 en UTC
  function resetTimeToUTC(date) {
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  // Fechas de Navidad (1 diciembre - 10 enero)
  const startNavidad = resetTimeToUTC(new Date(today.getFullYear(), 11, 1));
  const endNavidad = resetTimeToUTC(new Date(today.getFullYear() + 1, 0, 10));

  // Fechas de San Valentín (semana del 14 de febrero)
  const sanValentinStart = resetTimeToUTC(new Date(today.getFullYear(), 1, 7)); // Lunes de la semana del 14 de febrero
  const sanValentinEnd = resetTimeToUTC(new Date(today.getFullYear(), 1, 20)); // Domingo de la semana del 14 de febrero

  // Fechas de Black Friday (semana antes del último viernes de noviembre)
  const lastDayNov = new Date(today.getFullYear(), 10, 30); // El último día de noviembre
  const blackFridayStart = resetTimeToUTC(new Date(lastDayNov.getFullYear(), lastDayNov.getMonth(), lastDayNov.getDate() - 7)); // Lunes antes del último viernes
  const blackFridayEnd = resetTimeToUTC(new Date(lastDayNov.getFullYear(), lastDayNov.getMonth(), lastDayNov.getDate())); // Domingo del último día de noviembre

  // Fechas de Comuniones (finales de marzo hasta finales de mayo)
  const comunionesStart = resetTimeToUTC(new Date(today.getFullYear(), 2, 31)); // Último día de marzo
  const comunionesEnd = resetTimeToUTC(new Date(today.getFullYear(), 4, 31)); // Último día de mayo

  // Comprobación de Navidad
  if (today >= startNavidad && today <= endNavidad) {
    // Cambiar el logo de Navidad
    document.getElementById('nav-logo').src = 'TEMPORADAS/Temporada Navidad/EnmaManualidadesNavidadLogo.png';
    const menuLogo = document.querySelector('.menu-logo');
    if (menuLogo) {
      menuLogo.src = 'TEMPORADAS/Temporada Navidad/EnmaManualidadesNavidadLogo.png';
    }

    // Cambiar fondo para Navidad
    document.body.style.background = 'linear-gradient(0deg, rgba(202, 169, 106, 1) 0%, rgba(77, 11, 70, 1) 100%)';

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
      .card-image-container .price {
        color: #6d0a38;
      }
      .card h3 {
        color: #6d0a38;
      }
      .card .tags div {
        background-color: #6d0a38;
      }
      .add-to-cart {
        background-color: #6d0a38;
      }
    `;
    document.head.appendChild(style);

  // Comprobación de San Valentín (Semana del 14 de febrero)
  } else if (today >= sanValentinStart && today <= sanValentinEnd) {
    // Cambiar el logo de San Valentín
    document.getElementById('nav-logo').src = 'TEMPORADAS/San Valentin/EnmaManualidadesSanValentinLogo.png';
    const menuLogo = document.querySelector('.menu-logo');
    if (menuLogo) {
      menuLogo.src = 'TEMPORADAS/San Valentin/EnmaManualidadesSanValentinLogo.png';
    }

    // Cambiar fondo para San Valentín
    document.body.style.background = 'linear-gradient(1.48deg, rgba(225, 0, 82, 1) 0%, rgba(37, 1, 34, 1) 100%)';

    const style = document.createElement('style');
    style.textContent = `
      .card {
        background-color: rgb(255, 192, 203); /* Rosa claro */
        border: 1px solid rgb(255, 255, 255);
      }
      #search-bar input {
        background-color: rgb(255, 192, 203);
      }
      #filters {
        background-color: rgb(255, 192, 203);
      }
      .card-image-container .price {
        color: #d5004c; /* Color rosa fuerte */
      }
      .card h3 {
        color: #d5004c;
      }
      .card .tags div {
        background-color: #d5004c;
      }
      .add-to-cart {
        background-color: #d5004c;
      }

      /* Cambiar el :hover para San Valentín */
      .card:hover {
        background-color: rgb(73 1 43); /* Fondo rojo oscuro para hover */
        color: #fff; /* Texto blanco */
      }
        .card:hover p {
        color: white; /* Texto blanco */
      }
    `;
    document.head.appendChild(style);

  // Comprobación de Black Friday (semana antes del último viernes de noviembre)
  } else if (today >= blackFridayStart && today <= blackFridayEnd) {
    // Cambiar el logo de Black Friday
    document.getElementById('nav-logo').src = 'TEMPORADAS/BLACK FRIDAY/EnmaManualidadesBlackFridayLogo.png';
    const menuLogo = document.querySelector('.menu-logo');
    if (menuLogo) {
      menuLogo.src = 'TEMPORADAS/BLACK FRIDAY/EnmaManualidadesBlackFridayLogo.png';
    }

    // Cambiar fondo para Black Friday
    document.body.style.background = 'conic-gradient(from 149.48deg at 50% 50%, rgba(0, 0, 0, 1) 0%, rgba(200, 200, 200, 1) 100%)';

    const style = document.createElement('style');
    style.textContent = `
      .card {
        background-color: #000; /* Fondo negro */
        border: 1px solid #fff; /* Borde blanco */
      }
      #search-bar input {
        background-color: #000; /* Fondo negro */
        color: #fff; /* Texto blanco */
      }
      #filters {
        background-color: #000; /* Fondo negro */
        color: #fff; /* Texto blanco */
      }
      .card-image-container .price {
        color: #fff; /* Precio en blanco */
      }
      .card h3 {
        color: #fff; /* Títulos en blanco */
      }
      .card .tags div {
        background-color: #fff; /* Fondo blanco para las etiquetas */
        color: #000; /* Texto negro para las etiquetas */
      }
      .add-to-cart {
        background-color: #fff; /* Fondo blanco para el botón */
        color: #000; /* Texto negro para el botón */
      }

      /* Cambiar todos los párrafos a blanco */
      p {
        color: #fff;
      }

      /* Estilo para el :hover de .card en Black Friday */
      .card:hover {
        background-color: #6b6b6b; /* Fondo gris al hacer hover */
      }
    `;
    document.head.appendChild(style);

  // Comprobación de Comuniones (finales de marzo hasta finales de mayo)
  } else if (today >= comunionesStart && today <= comunionesEnd) {
    // Cambiar el logo de Comuniones
    document.getElementById('nav-logo').src = 'TEMPORADAS/Comuniones/EnmaManualidadesComunionesLogo.png';
    const menuLogo = document.querySelector('.menu-logo');
    if (menuLogo) {
      menuLogo.src = 'TEMPORADAS/Comuniones/EnmaManualidadesComunionesLogo.png';
    }

    // Cambiar fondo para Comuniones
    document.body.style.background = 'linear-gradient(0deg, rgba(202, 169, 106, 1) 0%, rgba(106, 168, 210, 1) 100%)';

    const style = document.createElement('style');
    style.textContent = `
      .card {
        background-color: #f9f5e1; /* Fondo suave para las tarjetas */
        border: 1px solid #fff;
      }
      #search-bar input {
        background-color: #f9f5e1;
      }
      #filters {
        background-color: #f9f5e1;
      }
      .card-image-container .price {
        color: #1f63a6; /* Color azul para el precio */
      }
      .card h3 {
        color: #1f63a6;
      }
      .card .tags div {
        background-color: #1f63a6;
      }
      .add-to-cart {
        background-color: #1f63a6;
      }
      /* Estilo para el :hover de .card en Black Friday */
      .card:hover {
        background-color:rgb(117, 183, 199); /* Fondo gris al hacer hover */
      }
    `;
    document.head.appendChild(style);

  } else {
    // No hacer cambios si no es ninguna de las festividades
  }
})();


