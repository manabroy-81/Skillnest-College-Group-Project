const createPostForm = document.querySelector(".create-post-form");
const createOverlay = document.querySelector(".create-overlay");
const postImageUpload = document.querySelector("#postImageUpload");
const postImagePreview = document.querySelector("#postImagePreview");
const postPreviewWrap = document.querySelector(".upload-area__preview");
const removePostImage = document.querySelector(".upload-area__remove");
const caption = document.querySelector("#caption");
const captionCount = document.querySelector("#captionCount");
const postShareStatus = document.querySelector("#postShareStatus");
const shareButton = createPostForm?.querySelector(".share-btn");
const shareButtonLabel = shareButton?.querySelector(".share-btn__label");
const shareButtonLoading = shareButton?.querySelector(".share-btn__loading");
let previewUrl;

const setCreatePostOpen = (isOpen) => {
  if (!createOverlay) return;
  createOverlay.style.display = isOpen ? "flex" : "none";
  createOverlay.setAttribute("aria-hidden", String(!isOpen));
  if (isOpen) caption?.focus();
};

const clearPostImage = () => {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = undefined;
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

  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  if (postImagePreview) postImagePreview.src = previewUrl;
  if (postPreviewWrap) postPreviewWrap.hidden = false;
  if (postShareStatus)
    postShareStatus.textContent = "Your image will upload when you share.";
});

removePostImage?.addEventListener("click", clearPostImage);

createPostForm?.addEventListener("reset", () => {
  window.setTimeout(() => {
    clearPostImage();
    if (captionCount) captionCount.textContent = "0 / 1000";
  });
});

createPostForm?.addEventListener("submit", (event) => {
  if (!createPostForm.checkValidity() || !shareButton) return;

  shareButton.disabled = true;
  shareButtonLabel.hidden = true;
  shareButtonLoading.hidden = false;
  if (postShareStatus) {
    postShareStatus.textContent = postImageUpload?.files.length
      ? "Uploading image and sharing your post…"
      : "Sharing your post…";
  }
  createOverlay?.setAttribute("aria-busy", "true");
  event.currentTarget.querySelector(".close-btn")?.setAttribute("disabled", "");
});
