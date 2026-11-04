function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("main-content");
  if (!sidebar) return;

  const isCompact = window.matchMedia("(max-width: 991.98px)").matches;
  if (isCompact) {
    sidebar.classList.toggle("show");
    document.body.classList.toggle("sidebar-open", sidebar.classList.contains("show"));
    return;
  }

  sidebar.classList.toggle("hide");
  const isHidden = sidebar.classList.contains("hide");
  if (content) content.classList.toggle("full", isHidden);
  document.body.classList.toggle("sidebar-collapsed", isHidden);
}

