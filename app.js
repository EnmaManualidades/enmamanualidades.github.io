// Seleccionamos los elementos del DOM
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
    renderProducts(products);
    fillTagFilter(products);
    setupFilters(products);

    // Configurar eventos de clic para los elementos del menú
    menuItems.forEach((item) => {
      item.addEventListener("click", () => {
        const category = item.dataset.category; // Obtener la categoría del atributo data-category
        const filteredProducts = filterProducts(products, "", category, priceFilter.value); // Filtrar por categoría
        renderProducts(filteredProducts); // Renderizar los productos filtrados
        menuOverlay.classList.add("hidden"); // Cerrar el menú
        document.body.style.overflow = "auto"; // Rehabilitar scroll
      });
    });
  })
  .catch((error) => {
    console.error("Hubo un problema con la carga del JSON:", error);
  });

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

// Filtrar productos según los criterios
function setupFilters(products) {
  // Filtrar por búsqueda
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filteredProducts = filterProducts(products, query, tagsFilter.value, priceFilter.value);
    renderProducts(filteredProducts);
  });

  // Filtrar por etiquetas
  tagsFilter.addEventListener("change", () => {
    const query = searchInput.value.toLowerCase();
    const filteredProducts = filterProducts(products, query, tagsFilter.value, priceFilter.value);
    renderProducts(filteredProducts);
  });

  // Filtrar por rango de precios
  priceFilter.addEventListener("input", () => {
    priceValue.textContent = `${priceFilter.value}€`;
    const query = searchInput.value.toLowerCase();
    const filteredProducts = filterProducts(products, query, tagsFilter.value, priceFilter.value);
    renderProducts(filteredProducts);
  });
}

// Función de filtrado
function filterProducts(products, query, tag, price) {
  return products.filter(product => {
    const matchesQuery = product.title.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
    const matchesTag = tag ? product.tags.includes(tag) : true;

    let matchesPrice = true;
    if (price) {
      matchesPrice = product.price <= price;
    }

    return matchesQuery && matchesTag && matchesPrice;
  });
}
