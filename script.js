const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const themeToggle = document.getElementById('themeToggle');
const toast = document.getElementById('toast');

let tasks = JSON.parse(localStorage.getItem('taskmateTasks') || '[]');
let toastTimer;

function saveTasks() {
  localStorage.setItem('taskmateTasks', JSON.stringify(tasks));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function formatDate(dateString) {
  if (!dateString) return 'Tanpa deadline';
  return new Date(dateString + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function updateStats() {
  const completed = tasks.filter(task => task.done).length;
  const total = tasks.length;
  const pending = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  document.getElementById('totalCount').textContent = total;
  document.getElementById('pendingCount').textContent = pending;
  document.getElementById('doneCount').textContent = completed;
  document.getElementById('heroCompleted').textContent = completed;
  document.getElementById('heroPercent').textContent = percent + '%';
  document.getElementById('heroProgress').style.width = percent + '%';
}

function renderTasks() {
  const keyword = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;
  const filtered = tasks.filter(task => {
    const matchesText = task.title.toLowerCase().includes(keyword) ||
      task.subject.toLowerCase().includes(keyword);
    const matchesStatus = filter === 'all' ||
      (filter === 'done' && task.done) ||
      (filter === 'pending' && !task.done);
    return matchesText && matchesStatus;
  });

  document.getElementById('visibleCount').textContent = filtered.length + ' tugas';
  updateStats();

  if (!filtered.length) {
    taskList.innerHTML = `<div class="empty-state"><div>✎</div><strong>${tasks.length ? 'Tugas tidak ditemukan' : 'Belum ada tugas'}</strong><p>${tasks.length ? 'Coba kata kunci atau filter lain.' : 'Tambahkan tugas pertamamu melalui formulir.'}</p></div>`;
    return;
  }

  taskList.innerHTML = '';
  filtered.forEach(task => {
    const item = document.createElement('article');
    item.className = 'task-item' + (task.done ? ' completed' : '');
    item.innerHTML = `
      <input class="task-check" type="checkbox" aria-label="Tandai selesai" ${task.done ? 'checked' : ''}>
      <div class="task-info">
        <strong></strong>
        <p></p>
      </div>
      <span class="priority ${task.priority}"></span>
      <button class="delete-btn" aria-label="Hapus tugas" title="Hapus tugas">×</button>`;
    item.querySelector('.task-info strong').textContent = task.title;
    item.querySelector('.task-info p').textContent = task.subject + ' • Deadline: ' + formatDate(task.date);
    item.querySelector('.priority').textContent = task.priority;
    item.querySelector('.task-check').addEventListener('change', () => toggleTask(task.id));
    item.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
    taskList.appendChild(item);
  });
}

function clearErrors() {
  document.getElementById('titleError').textContent = '';
  document.getElementById('subjectError').textContent = '';
  document.getElementById('dateError').textContent = '';
}

taskForm.addEventListener('submit', event => {
  event.preventDefault();
  clearErrors();

  const title = document.getElementById('taskTitle').value.trim();
  const subject = document.getElementById('taskSubject').value.trim();
  const date = document.getElementById('taskDate').value;
  const priority = document.getElementById('taskPriority').value;
  let valid = true;

  if (title.length < 3) {
    document.getElementById('titleError').textContent = 'Nama tugas minimal 3 karakter.';
    valid = false;
  }
  if (subject.length < 2) {
    document.getElementById('subjectError').textContent = 'Nama mata kuliah wajib diisi.';
    valid = false;
  }
  if (!date) {
    document.getElementById('dateError').textContent = 'Pilih tanggal deadline.';
    valid = false;
  }
  if (!valid) return;

  tasks.unshift({ id: Date.now(), title, subject, date, priority, done: false });
  saveTasks();
  renderTasks();
  taskForm.reset();
  showToast('Tugas berhasil ditambahkan!');
});

function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, done: !task.done } : task);
  saveTasks();
  renderTasks();
  showToast('Status tugas diperbarui.');
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  showToast('Tugas berhasil dihapus.');
}

searchInput.addEventListener('input', renderTasks);
filterSelect.addEventListener('change', renderTasks);

document.getElementById('clearDone').addEventListener('click', () => {
  const before = tasks.length;
  tasks = tasks.filter(task => !task.done);
  saveTasks();
  renderTasks();
  showToast(before === tasks.length ? 'Belum ada tugas selesai.' : 'Semua tugas selesai dihapus.');
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('taskmateDark', isDark ? 'yes' : 'no');
});

if (localStorage.getItem('taskmateDark') === 'yes') {
  document.body.classList.add('dark');
  themeToggle.textContent = '☀️';
}

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('navbar').classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
    document.getElementById('navbar').classList.remove('open');
  });
});

const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
document.getElementById('taskDate').min = localToday;

renderTasks();
