document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  const input = document.querySelector(button.dataset.passwordToggle);
  const icon = button.querySelector("i");
  if (!input || !icon) return;

  button.addEventListener("click", () => {
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    button.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    button.setAttribute("aria-pressed", String(isHidden));
    icon.classList.toggle("fa-eye", !isHidden);
    icon.classList.toggle("fa-eye-slash", isHidden);
  });
});
