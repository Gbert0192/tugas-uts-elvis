document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("myForm").addEventListener("submit", function (e) {
    const noHpInput = document.getElementById("noHp");
    let noHpValue = noHpInput.value;

    if (!noHpValue.startsWith("62")) {
      if (noHpValue.startsWith("0")) {
        noHpInput.value = "62" + noHpValue.slice(1);
      } else {
        noHpInput.value = "62" + noHpValue;
      }
    } else {
      return;
    }
  });
});

const togglePasswordButton = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const toggleText = document.getElementById("toggleText");

togglePasswordButton.addEventListener("click", () => {
  const isPasswordVisible = passwordInput.type === "text";
  passwordInput.type = isPasswordVisible ? "password" : "text";
  toggleText.textContent = isPasswordVisible ? "Show" : "Hide";
});

document.querySelector("form").addEventListener("submit", function () {
  document.getElementById("loading-spinner").classList.remove("hidden");
});
