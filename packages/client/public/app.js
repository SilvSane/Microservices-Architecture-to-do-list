const GATEWAY_URL = window.APP_CONFIG.GATEWAY_URL;

let currentToken = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let isRegisterMode = false;
let isRefreshing = false;
let refreshSubscribers = [];

function getUserFriendlyErrorMessage(err) {
  const msg = err.message || String(err);
  if (msg === 'Failed to fetch' || msg.includes('Failed to fetch') || msg.includes('NetworkError'))
    return 'Ошибка сервера!';
  if (
    msg.includes('Unauthorized') ||
    msg.includes('Invalid credentials') ||
    msg.includes('Authentication failed') ||
    msg.includes('already exists')
  )
    return 'Проверьте введённые данные.';
  return msg;
}

async function fetchWithAuth(url, options = {}) {
  const headers = options.headers || {};
  if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`;
  const fetchOptions = { ...options, headers, credentials: 'include' };
  let response = await fetch(url, fetchOptions);
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      fetchOptions.headers = headers;
      response = await fetch(url, fetchOptions);
    } else {
      logout();
      throw new Error('Сессия истекла. Войдите заново.');
    }
  }
  return response;
}

async function refreshAccessToken() {
  if (isRefreshing) {
    return new Promise((resolve) => refreshSubscribers.push(resolve));
  }
  isRefreshing = true;
  try {
    const res = await fetch(`${GATEWAY_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Refresh failed');
    }
    const data = await res.json();
    const newAccessToken = data.accessToken;
    currentToken = newAccessToken;
    localStorage.setItem('token', newAccessToken);
    refreshSubscribers.forEach((cb) => cb(newAccessToken));
    refreshSubscribers = [];
    return newAccessToken;
  } catch (err) {
    console.error(err);
    logout();
    return null;
  } finally {
    isRefreshing = false;
  }
}

function init() {
  if (currentToken && currentUser) {
    showAppScreen();
    updateUserUI();
    loadTasks();
  } else {
    showAuthScreen();
  }
}

function openDrawer() {
  document.getElementById('drawerOverlay').classList.add('active');
  document.getElementById('drawer').classList.add('open');
}
function closeDrawer() {
  document.getElementById('drawerOverlay').classList.remove('active');
  document.getElementById('drawer').classList.remove('open');
}

function updateUserUI() {
  if (!currentUser) return;
  const name = currentUser.name || 'User';
  const email = currentUser.email || '';
  document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('drawerAvatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('drawerName').textContent = name;
  document.getElementById('drawerEmail').textContent = email;
}

function showTaskError(msg) {
  const el = document.getElementById('taskError');
  el.textContent = msg || 'Пожалуйста, введите задачу!';
  el.classList.add('show');
}
function hideTaskError() {
  document.getElementById('taskError').classList.remove('show');
}
function showAuthError(msg) {
  const el = document.getElementById('authError');
  el.textContent = msg || 'Ошибка аутентификации!';
  el.classList.add('show');
}
function hideAuthError() {
  document.getElementById('authError').classList.remove('show');
}

function toggleAuthMode(isReg) {
  isRegisterMode = isReg;
  document.getElementById('authTitle').innerText = isReg ? 'Регистрация' : 'Вход в систему';
  document.getElementById('nameGroup').style.display = isReg ? 'block' : 'none';
  document.getElementById('authButton').innerText = isReg ? 'Создать аккаунт' : 'Войти';
  document.getElementById('authToggle').innerHTML = isReg
    ? 'Уже есть аккаунт? <a onclick="toggleAuthMode(false)">Войти</a>'
    : 'Нет аккаунта? <a onclick="toggleAuthMode(true)">Зарегистрироваться</a>';
  hideAuthError();
}

async function handleAuthSubmit() {
  hideAuthError();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value.trim();
  const name = document.getElementById('regName').value.trim();

  if (!email || !password) {
    showAuthError(
      isRegisterMode ? 'Пожалуйста, заполните все поля!' : 'Пожалуйста, заполните email и пароль!',
    );
    return;
  }

  const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
  const payload = isRegisterMode ? { email, password, name } : { email, password };

  try {
    const res = await fetch(`${GATEWAY_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Authentication failed');
    }
    const data = await res.json();

    currentToken = data.accessToken || data.token;
    localStorage.setItem('token', currentToken);

    if (isRegisterMode) {
      currentUser = { name: data.user.name, email: data.user.email };
    } else {
      const saved = JSON.parse(localStorage.getItem('user'));
      if (saved && saved.email === email) {
        currentUser = saved;
      } else {
        currentUser = { name: email.split('@')[0], email };
      }
    }
    localStorage.setItem('user', JSON.stringify(currentUser));

    updateUserUI();
    showAppScreen();
    loadTasks();
    closeDrawer();
  } catch (err) {
    const msg = getUserFriendlyErrorMessage(err);
    showAuthError(isRegisterMode ? `Ошибка регистрации! ${msg}` : `Ошибка входа! ${msg}`);
  }
}

function logout() {
  fetch(`${GATEWAY_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {});
  currentToken = null;
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  closeDrawer();
  showAuthScreen();
}

async function loadTasks() {
  if (!currentToken) {
    isRegisterMode = false;
    showAuthScreen();
    return;
  }
  try {
    const res = await fetchWithAuth(`${GATEWAY_URL}/tasks`);
    if (!res.ok) throw new Error('Failed to load tasks');
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    console.error(err);
  }
}

async function addTask() {
  if (!currentToken) {
    isRegisterMode = false;
    showAuthScreen();
    return;
  }
  const input = document.getElementById('taskTitleInput');
  const title = input.value.trim();
  if (!title) {
    showTaskError('Пожалуйста, введите задачу!');
    return;
  }
  hideTaskError();

  try {
    const res = await fetchWithAuth(`${GATEWAY_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to create task');
    input.value = '';
    loadTasks();
  } catch (err) {
    showTaskError(getUserFriendlyErrorMessage(err));
  }
}

function showDeleteConfirm(taskId) {
  document.querySelectorAll('.confirm-box').forEach((box) => box.classList.remove('active'));
  const confirmBox = document.querySelector(`.confirm-box[data-task-id="${taskId}"]`);
  if (confirmBox) {
    confirmBox.classList.add('active');
    const deleteBtn = document.querySelector(`.task-delete-btn[data-task-id="${taskId}"]`);
    if (deleteBtn) deleteBtn.style.display = 'none';
  }
}
function cancelDelete(taskId) {
  const confirmBox = document.querySelector(`.confirm-box[data-task-id="${taskId}"]`);
  if (confirmBox) {
    confirmBox.classList.remove('active');
    const deleteBtn = document.querySelector(`.task-delete-btn[data-task-id="${taskId}"]`);
    if (deleteBtn) deleteBtn.style.display = 'flex';
  }
}
async function confirmDelete(taskId) {
  try {
    const res = await fetchWithAuth(`${GATEWAY_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
    loadTasks();
  } catch (err) {
    alert(getUserFriendlyErrorMessage(err));
  }
}

function renderTasks(tasks) {
  const list = document.getElementById('taskList');
  if (!Array.isArray(tasks) || tasks.length === 0) {
    list.innerHTML = `<div class="empty-message"><i class="fas fa-inbox" style="display:block; font-size:32px; margin-bottom:12px; color:#b0a0c8;"></i>Список задач пуст</div>`;
    return;
  }
  list.innerHTML = tasks
    .map(
      (t) => `
    <li class="task-item" data-task-id="${t.id}">
      <input class="task-check" type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTaskStatus(${t.id}, ${t.done})">
      <span class="task-title ${t.done ? 'completed' : ''}" onclick="toggleTaskStatus(${t.id}, ${t.done})">
        ${t.title}
      </span>
      <div class="task-actions">
        <button class="task-delete-btn" data-task-id="${t.id}" onclick="showDeleteConfirm(${t.id})">
          <i class="fas fa-trash-alt"></i>
        </button>
        <div class="confirm-box" data-task-id="${t.id}">
          <span>Удалить?</span>
          <button class="confirm-btn danger" onclick="confirmDelete(${t.id})">Да</button>
          <button class="confirm-btn cancel" onclick="cancelDelete(${t.id})">Нет</button>
        </div>
      </div>
    </li>
  `,
    )
    .join('');

  document.querySelectorAll('.confirm-box').forEach((box) => box.classList.remove('active'));
  document.querySelectorAll('.task-delete-btn').forEach((btn) => (btn.style.display = 'flex'));
}

async function toggleTaskStatus(id, currentDone) {
  try {
    const res = await fetchWithAuth(`${GATEWAY_URL}/tasks/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !currentDone }),
    });
    if (!res.ok) throw new Error('Failed to update task');
    loadTasks();
  } catch (err) {
    alert(getUserFriendlyErrorMessage(err));
  }
}

function showAuthScreen() {
  document.getElementById('authContainer').style.display = 'block';
  document.getElementById('appContent').style.display = 'none';
}
function showAppScreen() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('appContent').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('taskTitleInput').addEventListener('input', hideTaskError);
  document.getElementById('authEmail').addEventListener('input', hideAuthError);
  document.getElementById('authPassword').addEventListener('input', hideAuthError);
});

init();
