let currentDate = new Date();
let selectedDate = new Date();
let taskGroups = [
  {
    id: 'group-1',
    title: 'Задачи на неделю',
    tasks: [
      { id: 'weekly-task-1', title: 'Придумать подарок', completed: false },
      { id: 'weekly-task-2', title: 'Придумать подарок', completed: true }
    ]
  }
];

document.addEventListener('DOMContentLoaded', function() {
  currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  selectedDate = new Date(currentDate);
  
  updateCurrentDate();
  generateWeekDates();
  loadDailyTasks();
  loadWeeklyTasks();
  updateProgress();
  addDeleteButtonsEventListeners();
});

function updateCurrentDate() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateElement = document.getElementById('currentDate');
  dateElement.textContent = `${currentDate.getDate()} ${months[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;
}

function generateWeekDates() {
  const dateList = document.getElementById('dateList');
  dateList.innerHTML = '';
  
  const monday = new Date(selectedDate);
  monday.setDate(selectedDate.getDate() - selectedDate.getDay() + (selectedDate.getDay() === 0 ? -6 : 1));
  
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    
    const dateItem = document.createElement('li');
    dateItem.className = 'date-item';
    if (date.toDateString() === selectedDate.toDateString()) {
      dateItem.classList.add('active');
    }
    
    dateItem.innerHTML = `
      <div class="date-number">${date.getDate()}</div>
      <div class="weekday">${weekDays[i]}</div>
    `;
    
    dateItem.addEventListener('click', () => {
      selectedDate = date;
      generateWeekDates();
      loadDailyTasks();
      updateProgress();
    });
    
    dateList.appendChild(dateItem);
  }
}

function changeWeek(direction) {
  selectedDate.setDate(selectedDate.getDate() + direction * 7);
  generateWeekDates();
  loadDailyTasks();
  updateProgress();
}

function loadDailyTasks() {
  const dailyTasks = document.getElementById('dailyTasks');
  const dateKey = selectedDate.toISOString().split('T')[0];

  fetch(`/todolist`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка сети' + response.statusText);
        }
        return response.json();
      })
      .then(tasks => {
        dailyTasks.innerHTML = '';

        const dailyTasksForDate = tasks.filter(task => task.deadline === dateKey);

        dailyTasksForDate.forEach(task => {
          const taskElement = document.createElement('div');
          taskElement.className = 'task-item';
          taskElement.dataset.taskId = task.id;
          taskElement.innerHTML = `
          <input type="checkbox" id="${task.id}" class="task-checkbox" ${task.completed ? 'checked' : ''}
            onchange="toggleTaskCompletion('${dateKey}', '${task.id}')">
          <div class="task-text">
            <div class="task-title" contenteditable="false">${task.title}</div>
            <div class="task-details" contenteditable="false">${task.description}</div>
          </div>
          <div class="task-actions">
            <button class="edit-button" data-task-id="${task.id}" data-task-type="daily">✏️</button>
            <button class="delete-button" data-task-id="${task.id}" data-task-type="daily">×</button>
          </div>
        `;
          dailyTasks.appendChild(taskElement);
        });
        addDeleteButtonsEventListeners();
      })
      .catch(error => {
        console.error('Ошибка:', error);
      });
}

function toggleTaskCompletion(dateKey, taskId) {
  const checkbox = document.getElementById(taskId);
  const completed = checkbox.checked;

  fetch(`/todolist/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ completed: completed })
  })
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка сети' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        console.log('Задача обновлена:', data);
        updateProgress();
      })
      .catch(error => {
        console.error('Ошибка:', error);
        checkbox.checked = !completed;
      });
}

function loadWeeklyTasks() {
  const container = document.getElementById('weeklyTasksContainer');
  container.innerHTML = '';

  taskGroups.forEach(group => {
    const groupElement = document.createElement('div');
    groupElement.className = 'weekly-task-block';
    groupElement.innerHTML = `
      <div class="weekly-task-header">
        <span class="editable-group-name">${group.title}</span>
        <button onclick="showWeeklyTaskInput(this)">+</button>
        <button class="delete-group-button" data-group-id="${group.id}">×</button>
      </div>
      ${group.tasks.map(task => `
         <div class="weekly-task-item" data-task-id="${task.id}" data-group-id="${group.id}">
          <div class="task-content">
            <input type="checkbox" id="${task.id}" class="weekly-task-checkbox" ${task.completed ? 'checked' : ''}>
            <label for="${task.id}" class="weekly-task-label">${task.title}</label>
          </div>
          <div class="task-actions">
            <button class="delete-button" data-task-id="${task.id}" data-task-group="${group.id}" data-task-type="weekly">×</button>
          </div>
        </div>
      `).join('')}
      <input type="text" class="weekly-task-input" placeholder="Введите задачу">
    `;
    container.appendChild(groupElement);
  });

  document.querySelectorAll('.editable-group-name').forEach(el => {
    el.contentEditable = true;
    el.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.blur();
      }
    });
  });

  const addGroupBtn = document.createElement('button');
  addGroupBtn.className = 'add-group-btn';
  addGroupBtn.textContent = 'Добавить группу';
  addGroupBtn.onclick = addNewTaskGroup;
  container.appendChild(addGroupBtn);
  addDeleteButtonsEventListeners();
}

function showWeeklyTaskInput(button) {
  const taskBlock = button.closest('.weekly-task-block');
  const input = taskBlock.querySelector('.weekly-task-input');

  input.style.display = 'block';
  input.focus();

  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && input.value.trim()) {
      const newId = 'weekly-task-' + Date.now();
      const newTask = document.createElement('div');
      newTask.className = 'weekly-task-item';
      newTask.innerHTML = `
         <div class="task-content">
          <input type="checkbox" id="${newId}" class="weekly-task-checkbox">
          <label for="${newId}" class="weekly-task-label">${input.value.trim()}</label>
        </div>
        <div class="task-actions">
          <button class="edit-button" data-task-id="${newId}" data-task-group="${taskBlock.querySelector('.editable-group-name').textContent.toLowerCase().replace(' ', '-')}" data-task-type="weekly">✏️</button>
          <button class="delete-button" data-task-id="${newId}" data-task-group="${taskBlock.querySelector('.editable-group-name').textContent.toLowerCase().replace(' ', '-')}" data-task-type="weekly">×</button>
        </div>
      `;

      taskBlock.insertBefore(newTask, input);
      input.value = '';
      input.style.display = 'none';
      addDeleteButtonsEventListeners();
    }
  });
}

function addNewTaskGroup() {
  const container = document.getElementById('weeklyTasksContainer');
  const newGroup = document.createElement('div');
  newGroup.className = 'weekly-task-block';

  const header = document.createElement('div');
  header.className = 'weekly-task-header';

  const nameSpan = document.createElement('span');
  nameSpan.textContent = 'Новая группа';
  nameSpan.contentEditable = true;
  nameSpan.className = 'editable-group-name';

  nameSpan.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.blur();
    }
  });

  const addButton = document.createElement('button');
  addButton.textContent = '+';
  addButton.onclick = function() { showWeeklyTaskInput(this); };

  header.appendChild(nameSpan);
  header.appendChild(addButton);

  newGroup.appendChild(header);

  const taskInput = document.createElement('input');
  taskInput.type = 'text';
  taskInput.className = 'weekly-task-input';
  taskInput.placeholder = 'Введите задачу';

  newGroup.appendChild(taskInput);

  const addButtonElement = container.querySelector('.add-group-btn');
  container.insertBefore(newGroup, addButtonElement);

  nameSpan.focus();

  const range = document.createRange();
  range.selectNodeContents(nameSpan);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  addDeleteButtonsEventListeners();
}

function addTask() {
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  
  if (!title) return;

  const deadline = selectedDate.toISOString().split('T')[0];

  const task = {
    title: title,
    description: description,
    deadline: deadline,
    completed: false
  };

  fetch('/todolist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  })
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка сети' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        console.log('Задача добавлена:', data);
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        loadDailyTasks();
      })
      .catch(error => {
        console.error('Ошибка:', error);
      });
}

function updateProgress() {
  const dateKey = selectedDate.toISOString().split('T')[0];

  fetch(`/todolist`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка сети'+ response.statusText);
        }
        return response.json();
      })
      .then(tasks => {
        const dailyTasksForDate = tasks.filter(task => task.deadline === dateKey);

        if (dailyTasksForDate.length === 0) {
          document.getElementById('progressPercentage').textContent = '0%';
          updateCircleProgress(0);
          return;
        }

        const completedTasks = dailyTasksForDate.filter(task => task.completed).length;
        const progress = Math.round((completedTasks / dailyTasksForDate.length) * 100);

        document.getElementById('progressPercentage').textContent = progress + '%';
        updateCircleProgress(progress);
      })
      .catch(error => {
        console.error('Ошибка при загрузке задач:', error);
        document.getElementById('progressPercentage').textContent = '0%';
        updateCircleProgress(0);
      });
}

function updateCircleProgress(percent) {
  const circle = document.querySelector('.progress-ring-circle');
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

function addDeleteButtonsEventListeners() {
  const deleteButtons = document.querySelectorAll('.delete-button');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const taskId = Number(this.dataset.taskId);
      const taskType = this.dataset.taskType;
      const taskGroup = this.dataset.taskGroup;

      if (taskType === 'daily') {
        fetch(`/todolist/${taskId}`, {
          method: 'DELETE'
        })
            .then(response => {
              if (!response.ok) {
                throw new Error('Ошибка при удалении задачи на сервере');
              }
              loadDailyTasks();
              updateProgress();
            })
            .catch(error => {
              alert('Не удалось удалить задачу. Попробуйте позже.');
              console.error(error);
            });
      } else if (taskType === 'weekly') {
        console.log('Удаление недельной задачи');
        taskGroups.forEach(group => {
          if (group.id === taskGroup || group.title.toLowerCase().replace(' ', '-') === taskGroup) {
            group.tasks = group.tasks.filter(task => task.id !== taskId);
          }
        });
        loadWeeklyTasks();
      }
    });
  });

  const editButtons = document.querySelectorAll('.edit-button');
  editButtons.forEach(button => {
    button.addEventListener('click', function() {
      const taskId = this.dataset.taskId;
      const taskType = this.dataset.taskType;
      const taskGroup = this.dataset.taskGroup;
      editTask(taskId, taskType, taskGroup);
    });
  });

  const deleteGroupButtons = document.querySelectorAll('.delete-group-button');
  deleteGroupButtons.forEach(button => {
    button.addEventListener('click', function() {
      const groupId = this.dataset.groupId;
      taskGroups = taskGroups.filter(group => group.id !== groupId);
      loadWeeklyTasks();
    });
  });
}

function editTask(taskId, taskType, taskGroup = null) {
  if (taskType === 'daily') {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const task = tasksStorage[dateKey].find(t => t.id === taskId);
    if (task) {
      document.getElementById('task-title').value = task.title;
      document.getElementById('task-description').value = task.description || '';

      tasksStorage[dateKey] = tasksStorage[dateKey].filter(t => t.id !== taskId);

      document.getElementById('task-title').focus();
    }
  } else if (taskType === 'weekly') {
    const group = taskGroups.find(g => g.id === taskGroup);
    if (group) {
      const task = group.tasks.find(t => t.id === taskId);
      if (task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';

        group.tasks = group.tasks.filter(t => t.id !== taskId);

        document.getElementById('task-title').focus();
      }
    }
  }
}

const editButtons = document.querySelectorAll('.task-item .edit-button');
editButtons.forEach(button => {
  button.addEventListener('click', function(e) {
    e.stopPropagation();
    const taskId = this.dataset.taskId;
    const taskElement = this.closest('.task-item');

    // Включаем редактирование только для daily задач
    enableTaskEditing(taskElement, 'daily');
  });
});

function enableTaskEditing(taskElement, taskType) {
  if (taskType !== 'daily') return;

  const titleElement = taskElement.querySelector('.task-title');
  const detailsElement = taskElement.querySelector('.task-details');
  const taskId = taskElement.dataset.taskId;

  titleElement.contentEditable = true;
  titleElement.focus();

  if (detailsElement) {
    detailsElement.contentEditable = true;
  }

  // Выделяем весь текст для удобства редактирования
  const range = document.createRange();
  range.selectNodeContents(titleElement);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  const saveHandler = () => {
    titleElement.contentEditable = false;
    if (detailsElement) detailsElement.contentEditable = false;

    const newTitle = titleElement.textContent.trim();
    const newDescription = detailsElement ? detailsElement.textContent.trim() : '';

    // Отправляем обновленные данные на сервер
    fetch(`/todolist/${taskId}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription
      })
    })
        .then(response => {
          if (!response.ok) {
            throw new Error('Ошибка при обновлении задачи');
          }
          return response.json();
        })
        .then(updatedTask => {
          console.log('Задача успешно обновлена:', updatedTask);
          // Обновляем локальное представление
          loadDailyTasks();
        })
        .catch(error => {
          console.error('Ошибка при обновлении задачи:', error);
          // В случае ошибки возвращаем предыдущие значения
          titleElement.textContent = taskElement.dataset.originalTitle || '';
          if (detailsElement) {
            detailsElement.textContent = taskElement.dataset.originalDescription || '';
          }
        });

    titleElement.removeEventListener('blur', saveHandler);
    document.removeEventListener('keydown', keyDownHandler);
  };

  const keyDownHandler = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveHandler();
    }
  };

  // Сохраняем оригинальные значения на случай ошибки
  taskElement.dataset.originalTitle = titleElement.textContent;
  if (detailsElement) {
    taskElement.dataset.originalDescription = detailsElement.textContent;
  }

  titleElement.addEventListener('blur', saveHandler);
  document.addEventListener('keydown', keyDownHandler);
}

