// Fungsi untuk mengubah harga menjadi format IDR
function priceToIdr(value) {
  return value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const decreaseButton = document.getElementById("decrease");
  const increaseButton = document.getElementById("increase");
  const quantityDisplay = document.getElementById("quantity");

  let quantity = parseInt(quantityDisplay.textContent);

  decreaseButton.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      quantityDisplay.textContent = quantity;
    }
  });

  increaseButton.addEventListener("click", () => {
    quantity++;
    quantityDisplay.textContent = quantity;
  });
});
updateCartInOffcanvas();
updateCartBadge();
// Fungsi untuk menambah produk ke keranjang
async function addToCart(button) {
  const productId = button.getAttribute("data-product-id");
  console.log(`Menambahkan produk dengan ID: ${productId} ke keranjang.`);

  const product = await getProductData(productId);

  if (!product) {
    console.error("Produk tidak ditemukan atau data tidak lengkap!");
    return; // Hentikan eksekusi jika produk tidak ditemukan
  }

  const quantityDisplay = document.getElementById("quantity");
  let quantity = parseInt(quantityDisplay.textContent) || 1;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingProduct = cart.find((item) => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    product.quantity = quantity;
    cart.push(product);
  }

  // Simpan ke localStorage
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartInOffcanvas();
  updateCartBadge();
}

async function addToCartHome(button) {
  const productId = button.getAttribute("data-product-id");
  console.log(
    `Menambahkan produk dengan ID: ${productId} ke keranjang (quantity tetap 1).`
  );

  const product = await getProductData(productId);

  if (!product) {
    console.error("Produk tidak ditemukan atau data tidak lengkap!");
    return;
  }

  // Tetapkan quantity ke 1
  const quantity = 1;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingProduct = cart.find((item) => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity += quantity; // Tambah jumlah jika sudah ada
  } else {
    product.quantity = quantity; // Set quantity menjadi 1
    cart.push(product); // Tambah produk baru
  }

  // Simpan ke localStorage
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartInOffcanvas();
  updateCartBadge();
}

// Fungsi untuk mengambil data produk berdasarkan ID
async function getProductData(productId) {
  console.log(productId);
  try {
    const response = await fetch(`https://dummyjson.com/products/${productId}`);

    if (!response.ok) {
      throw new Error("Produk tidak ditemukan");
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.title,
      price: data.price,
      image: data.thumbnail,
    };
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil data produk:", error);
    return null;
  }
}

// Fungsi untuk memperbarui tampilan keranjang di offcanvas
function updateCartInOffcanvas() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cart-items");
  cartContainer.innerHTML = "";

  const checkoutButton = document.getElementById("checkout-products");

  if (cart.length === 0) {
    // Jika keranjang kosong, tampilkan pesan "Keranjang Kosong" dan disable tombol checkout
    const emptyCartMessage = document.createElement("div");
    emptyCartMessage.classList.add(
      "flex",
      "items-center",
      "justify-center",
      "h-full",
      "text-gray-500",
      "text-lg",
      "animate-pulse"
    );
    emptyCartMessage.innerHTML = `<p>Keranjang Kosong :(</p>`;
    cartContainer.appendChild(emptyCartMessage);

    checkoutButton.disabled = true; // Disable tombol checkout jika keranjang kosong
  } else {
    // Jika keranjang tidak kosong, tampilkan produk-produk di keranjang
    cart.forEach((product) => {
      const productDiv = document.createElement("div");
      productDiv.classList.add(
        "flex",
        "items-center",
        "justify-between",
        "p-2",
        "border-b"
      );
      productDiv.innerHTML = `
        <div class="flex items-center">
            <img src="${product.image}" alt="${
        product.name
      }" class="w-12 h-12" />
            <div class="ml-4">
            <h4 class="text-sm font-semibold">${product.name}</h4>
            <p class="text-xs text-gray-500">Price: ${priceToIdr(
              product.price * 16000
            )}</p>
            </div>
        </div>
        <div class="flex items-center">
            <button class="text-gray-500" onclick="updateQuantity(${
              product.id
            }, -1)">-</button>
            <span class="mx-2">${product.quantity}</span>
            <button class="text-gray-500" onclick="updateQuantity(${
              product.id
            }, 1)">+</button>
            <span class="ml-4 text-sm font-semibold">${priceToIdr(
              product.price * product.quantity * 16000
            )}</span>
            <button class="text-red-500 ml-4" onclick="removeFromCart(${
              product.id
            })">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="garbage" class="w-6 h-6">
                <g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <path d="M19 23H5L3 5h18l-2 18zM1 5h22M9 5V4a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v1M7 10l1 8M17 10l-1 8M12 9v10"></path>
                </g>
            </svg>
            </button>
        </div>
        `;
      cartContainer.appendChild(productDiv);
    });

    checkoutButton.disabled = false; // Aktifkan tombol checkout jika keranjang tidak kosong
  }

  const total = calculateTotal(cart);
  const totalDiv = document.getElementById("cart-total");
  totalDiv.textContent = `Total: ${priceToIdr(total)}`;
}

function calculateTotal(cart) {
  return cart.reduce((total, product) => {
    return total + product.price * product.quantity * 16000;
  }, 0);
}
// Fungsi untuk memperbarui jumlah produk di keranjang
function updateQuantity(productId, delta) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = cart.find((item) => item.id === productId);
  if (product) {
    product.quantity += delta;
    if (product.quantity <= 0) {
      product.quantity = 1;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartInOffcanvas();
    updateCartBadge();
  }
}

// Fungsi untuk menghapus produk dari keranjang
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((product) => product.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartInOffcanvas();
  updateCartBadge(); // Memperbarui badge setelah menghapus produk
}

// Fungsi untuk menghitung jumlah produk unik di keranjang
function countUniqueItemsInCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const uniqueProducts = new Set(cart.map((product) => product.id));
  return uniqueProducts.size;
}

// Fungsi untuk memperbarui badge jumlah produk di keranjang
function updateCartBadge() {
  const uniqueItemCount = countUniqueItemsInCart();
  const cartBadge = document.getElementById("badge-count");

  cartBadge.textContent = uniqueItemCount > 0 ? uniqueItemCount : 0;
}

document
  .getElementById("checkout-products")
  .addEventListener("click", function () {
    sendCartToBackend();
  });

function sendCartToBackend() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    console.log("Keranjang kosong, tidak ada yang dikirim.");
    return;
  }

  const data = {
    cart: cart,
    total: calculateTotal(cart),
  };

  const pathSegments = window.location.pathname.split("/");
  const userId = pathSegments[2];

  console.log("User ID di frontend:", userId);

  fetch(`/checkout/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

document.getElementById("add-to-cart").addEventListener("click", function () {
  addToCart(this);
});

// Memperbarui tampilan keranjang saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  updateCartInOffcanvas();
  updateCartBadge();
  toggleCheckoutButton();
});

// Event listener untuk menutup offcanvas
document.querySelector(".fa-times").addEventListener("click", function () {
  document.getElementById("offcanvas-right").classList.add("translate-x-full");
  document.getElementById("offcanvas-right").classList.remove("translate-x-0");
});
