async function updateCart(productId, newQuantity) {
  const response = await fetch("/update-cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity: newQuantity }),
  });
  const result = await response.json();
  if (result.success) {
    console.log("Quantity updated successfully");
  }
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

// async function updateCart(productId, newQuantity) {
//   const response = await fetch(`/update-cart`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ productId, quantity: newQuantity }),
//   });

//   if (!response.ok) {
//     console.error("Terjadi kesalahan pada server", response.status);
//     alert("Terjadi kesalahan pada server.");
//     return;
//   }

//   try {
//     const result = await response.json();
//     if (result.success) {
//       console.log("Quantity updated successfully");
//     }
//   } catch (error) {
//     console.error("Gagal mengonversi respons ke JSON:", error);
//     alert("Terjadi kesalahan saat memproses respons dari server.");
//   }
// }
