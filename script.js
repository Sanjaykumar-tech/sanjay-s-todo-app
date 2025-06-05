window.addEventListener('load', () => {
  // Initialize todos and UI
  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  const nameInput = document.querySelector('#name');
  const newTodoForm = document.querySelector('#new-todo-form');
  const todoList = document.querySelector('#todo-list');
  const themeSwitcher = document.querySelector('#theme-switcher');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.querySelector('#clear-completed');
  const totalCount = document.querySelector('#total-count');
  const completedCount = document.querySelector('#completed-count');

  // Set username
  const username = localStorage.getItem('username') || '';
  nameInput.value = username;

  nameInput.addEventListener('change', (e) => {
    localStorage.setItem('username', e.target.value);
  });

  // Theme switcher
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  themeSwitcher.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

  themeSwitcher.addEventListener('click', () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeSwitcher.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });

  // Form submission
  newTodoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = e.target.elements.content.value.trim();
    if (!content) return;

    const todo = {
      id: Date.now(),
      content,
      category: e.target.elements.category.value,
      done: false,
      createdAt: new Date().getTime(),
    };

    todos.push(todo);
    saveAndRender();
    e.target.reset();
    e.target.elements.content.focus();
  });

  // Filter todos
  let currentFilter = 'all';
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.filter;
      renderTodos();
    });
  });

  // Clear completed
  clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.done);
    saveAndRender();
  });

  // Render todos
  function renderTodos() {
    todoList.innerHTML = '';
    
    const filteredTodos = currentFilter === 'all' 
      ? todos 
      : todos.filter(todo => todo.category === currentFilter);

    updateStats();

    if (filteredTodos.length === 0) {
      todoList.innerHTML = `<p class="empty-message">No ${currentFilter === 'all' ? '' : currentFilter} todos found</p>`;
      return;
    }

    filteredTodos.forEach(todo => {
      const todoItem = document.createElement('div');
      todoItem.classList.add('todo-item');
      if (todo.done) todoItem.classList.add('done');

      todoItem.innerHTML = `
        <label>
          <input type="checkbox" ${todo.done ? 'checked' : ''}>
          <span class="bubble ${todo.category}"></span>
        </label>
        <div class="todo-content">
          <input type="text" value="${todo.content}" readonly>
        </div>
        <div class="actions">
          <button class="edit"><i class="fas fa-edit"></i></button>
          <button class="delete"><i class="fas fa-trash"></i></button>
        </div>
      `;

      const checkbox = todoItem.querySelector('input[type="checkbox"]');
      const contentInput = todoItem.querySelector('.todo-content input');
      const editBtn = todoItem.querySelector('.edit');
      const deleteBtn = todoItem.querySelector('.delete');

      checkbox.addEventListener('change', () => {
        todo.done = checkbox.checked;
        saveAndRender();
      });

      editBtn.addEventListener('click', () => {
        contentInput.removeAttribute('readonly');
        contentInput.focus();
      });

      contentInput.addEventListener('blur', () => {
        contentInput.setAttribute('readonly', true);
        todo.content = contentInput.value;
        saveTodos();
      });

      contentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          contentInput.blur();
        }
      });

      deleteBtn.addEventListener('click', () => {
        todos = todos.filter(t => t.id !== todo.id);
        saveAndRender();
      });

      todoList.appendChild(todoItem);
    });
  }

  // Update stats
  function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.done).length;
    totalCount.textContent = `${total} ${total === 1 ? 'item' : 'items'}`;
    completedCount.textContent = `${completed} completed`;
  }

  // Save todos
  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  // Save and render
  function saveAndRender() {
    saveTodos();
    renderTodos();
  }

  // Initial render
  renderTodos();
});