(() => {
  const widget = document.querySelector(".ai-chat");
  if (!widget) return;

  const storageKey = "skillnest-ai-chat-history";
  const maxChats = 20;
  const launcher = widget.querySelector(".ai-chat__launcher");
  const panel = widget.querySelector(".ai-chat__panel");
  const closeButton = widget.querySelector(".ai-chat__close");
  const form = widget.querySelector(".ai-chat__form");
  const input = widget.querySelector(".ai-chat__input");
  const messagesContainer = widget.querySelector(".ai-chat__messages");
  const sendButton = widget.querySelector(".ai-chat__send");
  const cancelEditButton = widget.querySelector(".ai-chat__cancel-edit");
  const historyPanel = widget.querySelector(".ai-chat__history");
  const historyToggle = widget.querySelector(".ai-chat__history-toggle");
  const historyBack = widget.querySelector(".ai-chat__history-back");
  const historyList = widget.querySelector(".ai-chat__history-list");
  const newChatButton = widget.querySelector(".ai-chat__new-chat");
  const clearHistoryButton = widget.querySelector(".ai-chat__clear-history");

  const createChat = () => ({
    id: crypto.randomUUID(),
    updatedAt: Date.now(),
    messages: [],
  });
  const readSavedChats = () => {
    try {
      const chats = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(chats)
        ? chats.filter((chat) => Array.isArray(chat.messages))
        : [];
    } catch (_) {
      return [];
    }
  };

  let savedChats = readSavedChats();
  let activeChat = savedChats[0] || createChat();
  let editState = null;

  const setOpen = (isOpen) => {
    panel.hidden = !isOpen;
    launcher.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) input.focus();
  };

  const setHistoryOpen = (isOpen) => {
    historyPanel.hidden = !isOpen;
    historyToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) renderHistory();
  };

  const resizeInput = () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 110)}px`;
  };

  const cancelEdit = () => {
    editState = null;
    cancelEditButton.hidden = true;
    input.value = "";
    resizeInput();
    renderMessages();
  };

  const chatTitle = (chat) => {
    const firstQuestion = chat.messages.find(
      (message) => message.role === "user",
    );
    return firstQuestion ? firstQuestion.text.slice(0, 48) : "New conversation";
  };

  const storeChats = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedChats));
    } catch (_) {
      // Chatting still works if browser storage is unavailable.
    }
  };

  const saveActiveChat = () => {
    if (!activeChat.messages.length) {
      savedChats = savedChats.filter((chat) => chat.id !== activeChat.id);
      storeChats();
      return;
    }
    activeChat.updatedAt = Date.now();
    savedChats = savedChats.filter((chat) => chat.id !== activeChat.id);
    savedChats.unshift(activeChat);
    savedChats = savedChats.slice(0, maxChats);
    storeChats();
  };

  const appendMessage = (message, index) => {
    const bubble = document.createElement("div");
    bubble.className = `ai-chat__message ai-chat__message--${message.role}`;
    if (editState?.messageIndex === index)
      bubble.classList.add("ai-chat__message--editing");

    if (message.role === "model") {
      const label = document.createElement("div");
      label.className = "ai-chat__message-label";
      label.innerHTML =
        '<i class="fa-solid fa-sparkles" aria-hidden="true"></i> Gemini Flash';
      bubble.append(label);
    }
    const text = document.createElement("span");
    text.className = "ai-chat__message-text";
    text.textContent = message.text;
    bubble.append(text);

    if (message.role === "user") {
      const editButton = document.createElement("button");
      editButton.className = "ai-chat__edit-message";
      editButton.type = "button";
      editButton.dataset.messageIndex = String(index);
      editButton.setAttribute("aria-label", "Edit this message");
      editButton.innerHTML =
        '<i class="fa-solid fa-pen" aria-hidden="true"></i>';
      bubble.append(editButton);
    }
    messagesContainer.append(bubble);
  };

  const renderMessages = () => {
    messagesContainer.replaceChildren();
    if (!activeChat.messages.length) {
      appendMessage(
        {
          role: "model",
          text: "Hi there! Welcome to SkillNest. How can I help you with your learning today?",
        },
        -1,
      );
    } else {
      activeChat.messages.forEach(appendMessage);
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const addTemporaryMessage = (text) => {
    const bubble = document.createElement("div");
    bubble.className =
      "ai-chat__message ai-chat__message--model ai-chat__message--loading";
    bubble.textContent = text;
    messagesContainer.append(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return bubble;
  };

  const renderHistory = () => {
    historyList.replaceChildren();
    if (!savedChats.length) {
      const empty = document.createElement("p");
      empty.className = "ai-chat__history-empty";
      empty.textContent = "Your saved conversations will appear here.";
      historyList.append(empty);
      return;
    }

    savedChats.forEach((chat) => {
      const item = document.createElement("div");
      item.className = "ai-chat__history-item";
      const openButton = document.createElement("button");
      openButton.className = "ai-chat__history-chat";
      openButton.type = "button";
      openButton.dataset.chatId = chat.id;
      openButton.textContent = chatTitle(chat);
      const deleteButton = document.createElement("button");
      deleteButton.className = "ai-chat__history-delete";
      deleteButton.type = "button";
      deleteButton.dataset.deleteChatId = chat.id;
      deleteButton.setAttribute(
        "aria-label",
        `Delete conversation: ${chatTitle(chat)}`,
      );
      deleteButton.innerHTML =
        '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
      item.append(openButton, deleteButton);
      historyList.append(item);
    });
  };

  const startNewChat = () => {
    editState = null;
    cancelEditButton.hidden = true;
    activeChat = createChat();
    renderMessages();
    setHistoryOpen(false);
    input.focus();
  };

  launcher.addEventListener("click", () => setOpen(panel.hidden));
  closeButton.addEventListener("click", () => setOpen(false));
  historyToggle.addEventListener("click", () =>
    setHistoryOpen(historyPanel.hidden),
  );
  historyBack.addEventListener("click", () => setHistoryOpen(false));
  newChatButton.addEventListener("click", startNewChat);
  cancelEditButton.addEventListener("click", () => {
    cancelEdit();
    input.focus();
  });
  clearHistoryButton.addEventListener("click", () => {
    if (!savedChats.length || !window.confirm("Delete all saved chat history?"))
      return;
    savedChats = [];
    storeChats();
    startNewChat();
    renderHistory();
  });

  messagesContainer.addEventListener("click", (event) => {
    const editButton = event.target.closest(".ai-chat__edit-message");
    if (!editButton || sendButton.disabled) return;
    const messageIndex = Number(editButton.dataset.messageIndex);
    const message = activeChat.messages[messageIndex];
    if (!message || message.role !== "user") return;

    editState = { messageIndex, originalText: message.text };
    input.value = message.text;
    cancelEditButton.hidden = false;
    renderMessages();
    resizeInput();
    input.focus();
  });

  historyList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-chat-id]");
    if (deleteButton) {
      const { deleteChatId } = deleteButton.dataset;
      savedChats = savedChats.filter((chat) => chat.id !== deleteChatId);
      storeChats();
      if (activeChat.id === deleteChatId) {
        activeChat = createChat();
        editState = null;
        cancelEditButton.hidden = true;
        input.value = "";
        resizeInput();
      }
      renderMessages();
      renderHistory();
      return;
    }

    const openButton = event.target.closest("[data-chat-id]");
    if (!openButton) return;
    const selectedChat = savedChats.find(
      (chat) => chat.id === openButton.dataset.chatId,
    );
    if (!selectedChat) return;
    activeChat = selectedChat;
    editState = null;
    cancelEditButton.hidden = true;
    input.value = "";
    resizeInput();
    renderMessages();
    setHistoryOpen(false);
  });

  input.addEventListener("input", resizeInput);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || sendButton.disabled) return;

    const messagesBeforeEdit = editState
      ? activeChat.messages.slice(0, editState.messageIndex)
      : activeChat.messages;
    const requestHistory = messagesBeforeEdit.slice(-10);
    if (editState) activeChat.messages = messagesBeforeEdit;
    editState = null;
    cancelEditButton.hidden = true;
    activeChat.messages.push({ role: "user", text });
    saveActiveChat();
    renderMessages();
    input.value = "";
    resizeInput();
    input.focus();
    sendButton.disabled = true;
    const loadingMessage = addTemporaryMessage("Thinking...");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: requestHistory }),
      });
      const data = await response.json();
      loadingMessage.remove();
      if (!response.ok) throw new Error(data.error || "Something went wrong.");

      activeChat.messages.push({ role: "model", text: data.answer });
      saveActiveChat();
      renderMessages();
    } catch (error) {
      loadingMessage.textContent =
        error.message || "I couldn't reply right now. Please try again.";
      loadingMessage.classList.remove("ai-chat__message--loading");
    } finally {
      sendButton.disabled = false;
    }
  });

  renderMessages();
})();
