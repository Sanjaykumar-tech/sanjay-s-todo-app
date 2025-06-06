document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const themeSwitcher = document.getElementById('theme-switcher');
  const nameInput = document.getElementById('name');
  const todoForm = document.getElementById('new-todo-form');
  const todoInput = document.getElementById('content');
  const todoList = document.getElementById('todo-list');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const totalCount = document.getElementById('total-count');
  const completedCount = document.getElementById('completed-count');
  const clearCompletedButton = document.getElementById('clear-completed');

  // State
  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  let currentFilter = 'all';
  let darkMode = localStorage.getItem('darkMode') === 'true';

  // Initialize
  initTheme();
  renderTodos();
  updateStats();

  // Event Listeners
  themeSwitcher.addEventListener('click', toggleTheme);
  nameInput.addEventListener('change', updateName);
  todoForm.addEventListener('submit', addTodo);
  clearCompletedButton.addEventListener('click', clearCompletedTodos);

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.filter;
      renderTodos();
    });
  });

  // Functions
  function initTheme() {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      themeSwitcher.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      document.body.classList.remove('dark-mode');
      themeSwitcher.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }

  function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    initTheme();
  }

  function updateName(e) {
    localStorage.setItem('username', e.target.value);
  }

  function addTodo(e) {
    e.preventDefault();
    
    const content = todoInput.value.trim();
    if (!content) return;
    
    const category = document.querySelector('input[name="category"]:checked').value;
    
    const newTodo = {
      id: Date.now(),
      content,
      category,
      done: false,
      createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    updateStats();
    
    todoInput.value = '';
    todoInput.focus();
  }

  function renderTodos() {
    todoList.innerHTML = '';
    
    const filteredTodos = todos.filter(todo => {
      if (currentFilter === 'all') return true;
      return todo.category === currentFilter;
    });
    
    if (filteredTodos.length === 0) {
      todoList.innerHTML = '<p class="empty-message">No todos found</p>';
      return;
    }
    
    filteredTodos.forEach(todo => {
      const todoElement = document.createElement('div');
      todoElement.classList.add('todo-item');
      if (todo.done) todoElement.classList.add('done');
      
      todoElement.innerHTML = `
        <label>
          <input type="checkbox" ${todo.done ? 'checked' : ''} data-id="${todo.id}">
          <span class="bubble ${todo.category}"></span>
          <div class="todo-content">
            <input type="text" value="${todo.content}" data-id="${todo.id}">
          </div>
        </label>
        <div class="actions">
          <button class="delete-btn" data-id="${todo.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      
      todoList.appendChild(todoElement);
    });
    
    // Add event listeners to new elements
    document.querySelectorAll('.todo-item input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', toggleTodo);
    });
    
    document.querySelectorAll('.todo-content input').forEach(input => {
      input.addEventListener('change', updateTodoContent);
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', deleteTodo);
    });
  }

  function toggleTodo(e) {
    const id = parseInt(e.target.dataset.id);
    const todo = todos.find(t => t.id === id);
    todo.done = e.target.checked;
    saveTodos();
    renderTodos();
    updateStats();
  }

  function updateTodoContent(e) {
    const id = parseInt(e.target.dataset.id);
    const todo = todos.find(t => t.id === id);
    todo.content = e.target.value.trim();
    saveTodos();
  }

  function deleteTodo(e) {
    const id = parseInt(e.target.closest('button').dataset.id);
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
    updateStats();
  }

  function clearCompletedTodos() {
    todos = todos.filter(t => !t.done);
    saveTodos();
    renderTodos();
    updateStats();
  }

  function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.done).length;
    
    totalCount.textContent = `${total} ${total === 1 ? 'item' : 'items'}`;
    completedCount.textContent = `${completed} completed`;
  }

  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  // Load saved name if exists
  const savedName = localStorage.getItem('username');
  if (savedName) {
    nameInput.value = savedName;
  }
});