// Selección de elementos
const productsContainer = document.getElementById("products");
const searchInput = document.getElementById("search-input");
const tagsFilter = document.getElementById("tags-filter");
const priceFilter = document.getElementById("price-filter");
const priceValue = document.getElementById("price-value");
const menuButton = document.getElementById("menu-button");
const menuOverlay = document.getElementById("menu-overlay");
const menuItems = document.querySelectorAll(".menu-item");

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

// Leer productos desde el JSON y configurar los filtros
fetch("productos.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Error al cargar el archivo JSON");
    }
    return response.json();
  })
  .then((products) => {
    // Leer filtros iniciales de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get("category") || "";
    const initialSearch = urlParams.get("search") || "";
    const initialPrice = urlParams.get("price") || priceFilter.value;

    // Preseleccionar los valores del formulario
    searchInput.value = initialSearch;
    tagsFilter.value = initialCategory;
    priceFilter.value = initialPrice;
    priceValue.textContent = `${initialPrice}€`;

    // Renderizar los productos iniciales según los filtros
    const filteredProducts = filterProducts(products, initialSearch, initialCategory, initialPrice);
    renderProducts(filteredProducts);

    // Configurar filtros y menú
    fillTagFilter(products);
    setupFilters(products);
    setupMenu(products);
  })
  .catch((error) => {
    console.error("Hubo un problema con la carga del JSON:", error);
  });

// Configurar el menú para filtrar productos
function setupMenu(products) {
  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const category = item.dataset.category; // Obtener la categoría del atributo data-category

      // Actualizar el formulario
      tagsFilter.value = category;

      // Actualizar los productos filtrados
      const filteredProducts = filterProducts(products, searchInput.value, category, priceFilter.value);
      renderProducts(filteredProducts);

      // Actualizar la URL sin recargar la página
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("category", category);
      urlParams.set("search", searchInput.value);
      urlParams.set("price", priceFilter.value);
      history.pushState(null, "", `?${urlParams.toString()}`);

      // Cerrar el menú
      menuOverlay.classList.add("hidden");
      document.body.style.overflow = "auto";
    });
  });
}

// Renderizar productos en la página
function renderProducts(products) {
  productsContainer.innerHTML = ""; // Limpiar productos previos

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
}

// Llenar las opciones de filtro de etiquetas
function fillTagFilter(products) {
  const tags = new Set();
  products.forEach(product => {
    product.tags.forEach(tag => tags.add(tag));
  });

  // Agregar una opción "todos"
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.innerText = "Todos";
  tagsFilter.appendChild(allOption);

  tags.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.innerText = tag;
    tagsFilter.appendChild(option);
  });
}

// Configurar eventos del formulario de filtros
function setupFilters(products) {
  searchInput.addEventListener("input", applyFilters);
  tagsFilter.addEventListener("change", applyFilters);
  priceFilter.addEventListener("input", () => {
    priceValue.textContent = `${priceFilter.value}€`;
    applyFilters();
  });

  function applyFilters() {
    const query = searchInput.value.toLowerCase();
    const tag = tagsFilter.value;
    const price = priceFilter.value;

    // Filtrar y renderizar productos
    const filteredProducts = filterProducts(products, query, tag, price);
    renderProducts(filteredProducts);

    // Actualizar la URL
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("category", tag);
    urlParams.set("search", query);
    urlParams.set("price", price);
    history.pushState(null, "", `?${urlParams.toString()}`);
  }
}

// Función de filtrado
function filterProducts(products, query, tag, price) {
  return products.filter(product => {
    const matchesQuery = product.title.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
    const matchesTag = tag ? product.tags.includes(tag) : true;
    const matchesPrice = product.price <= price;
    return matchesQuery && matchesTag && matchesPrice;
  });
}
