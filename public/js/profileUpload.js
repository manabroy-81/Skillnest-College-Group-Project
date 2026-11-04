const setPreview = (selector, source) => {
  if (!selector || !source) return;
  const preview = document.querySelector(selector);
  if (preview && source) preview.src = source;
};

document.querySelectorAll("[data-image-target]").forEach((input) => {
  input.addEventListener("change", () => {
    const [file] = input.files;
    const target = document.querySelector(input.dataset.imageTarget);
    if (!file || !target) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
      alert("Choose a PNG, JPEG, GIF, or WebP image smaller than 2 MB.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      target.value = reader.result;
      setPreview(input.dataset.imagePreview, reader.result);
    });
    reader.readAsDataURL(file);
  });
});

document.querySelectorAll("[data-image-preview]:not([data-image-target])").forEach((input) => {
  input.addEventListener("change", () => setPreview(input.dataset.imagePreview, input.value.trim()));
});
