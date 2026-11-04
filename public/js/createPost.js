const createPostForm = document.querySelector(".create-post-form");
const createOverlay = document.querySelector(".create-overlay");
const postImageUpload = document.querySelector("#postImageUpload");
const postImagePreview = document.querySelector("#postImagePreview");
const postPreviewWrap = document.querySelector(".upload-area__preview");
const removePostImage = document.querySelector(".upload-area__remove");
const caption = document.querySelector("#caption");
const captionCount = document.querySelector("#captionCount");

const setCreatePostOpen = (isOpen) => {
  if (!createOverlay) return;
  createOverlay.style.display = isOpen ? "flex" : "none";
  createOverlay.setAttribute("aria-hidden", String(!isOpen));
  if (isOpen) caption?.focus();
};

const clearPostImage = () => {
  if (postImageUpload) postImageUpload.value = "";
  if (postImagePreview) postImagePreview.removeAttribute("src");
  if (postPreviewWrap) postPreviewWrap.hidden = true;
};

document.querySelectorAll(".createPostBtn").forEach((button) => {
  button.addEventListener("click", () => setCreatePostOpen(true));
});

document.querySelector(".close-btn")?.addEventListener("click", () =>
  setCreatePostOpen(false),
);

createOverlay?.addEventListener("click", (event) => {
  if (event.target === createOverlay) setCreatePostOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && createOverlay?.style.display === "flex") {
    setCreatePostOpen(false);
  }
});

caption?.addEventListener("input", () => {
  if (captionCount) captionCount.textContent = `${caption.value.length} / 1000`;
});

postImageUpload?.addEventListener("change", () => {
  const [file] = postImageUpload.files;
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
    alert("Choose a PNG, JPEG, GIF, or WebP image smaller than 2 MB.");
    clearPostImage();
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    if (postImagePreview) postImagePreview.src = reader.result;
    if (postPreviewWrap) postPreviewWrap.hidden = false;
  });
  reader.readAsDataURL(file);
});

removePostImage?.addEventListener("click", clearPostImage);

createPostForm?.addEventListener("reset", () => {
  window.setTimeout(() => {
    clearPostImage();
    if (captionCount) captionCount.textContent = "0 / 1000";
  });
});
