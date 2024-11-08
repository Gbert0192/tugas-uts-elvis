let countdown = 10;

function updateCountdown() {
  localStorage.removeItem("cart");

  const pathSegments = window.location.pathname.split("/");
  const userId = pathSegments[2];
  document.getElementById("countdown").innerText = countdown;
  if (countdown === 0) {
    window.location.href = "/main/" + userId;
  } else {
    countdown--;
    setTimeout(updateCountdown, 1000);
  }
}

window.onload = updateCountdown;
