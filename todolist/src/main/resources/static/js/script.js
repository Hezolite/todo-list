let currentDate = new Date();
let selectedDate = new Date();

document.addEventListener('DOMContentLoaded', function () {
  currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  selectedDate = new Date(currentDate);

  updateCurrentDate();
  generateWeekDates();
  loadDailyTasks();
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

  return fetch(`/todolist`)
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
      updateProgress();
    })
    .catch(error => {
      checkbox.checked = !completed;
    });
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
        throw new Error('Ошибка сети' + response.statusText);
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
    button.addEventListener('click', function () {
      const taskId = Number(this.dataset.taskId);
      const taskType = this.dataset.taskType;

      if (taskType === 'daily') {
        fetch(`/todolist/${taskId}`, {
          method: 'DELETE'
        })
          .then(response => {
            loadDailyTasks();
            updateProgress();
          })
          .catch(error => {
            alert('Не удалось удалить задачу. Попробуйте позже.');
          });
      }
    });
  });

  const editButtons = document.querySelectorAll('.edit-button');
  editButtons.forEach(button => {
    button.addEventListener('click', function () {
      const taskId = this.dataset.taskId;
      const taskType = this.dataset.taskType;
      editTask(taskId, taskType);
    });
  });
}

function editTask(taskId, taskType) {
  if (taskType === 'daily') {
    fetch(`/todolist/${taskId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка при получении задачи');
        }
        return response.json();
      })
      .then(task => {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';

        const addButton = document.querySelector('button[onclick="addTask()"]');
        const originalOnClick = addButton.onclick;

        addButton.onclick = function () {
          const title = document.getElementById('task-title').value.trim();
          const description = document.getElementById('task-description').value.trim();

          if (!title) return;

          const updatedTask = {
            title: title,
            description: description || ''
          };

          fetch(`/todolist/${taskId}/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTask)
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Ошибка при обновлении задачи');
              }
              return response.json();
            })
            .then(updatedTask => {
              document.getElementById('task-title').value = '';
              document.getElementById('task-description').value = '';
              addButton.onclick = originalOnClick;
              return loadDailyTasks();
            })
            .then(() => {
              return updateProgress();
            })
            .catch(error => {
              console.error('Ошибка при обновлении задачи:', error);
              alert('Не удалось обновить задачу');
            });
        };

        document.getElementById('task-title').focus();
      })
      .catch(error => {
        console.error('Ошибка при получении задачи:', error);
        alert('Не удалось загрузить задачу для редактирования');
      });
  }
}

const editButtons = document.querySelectorAll('.task-item .edit-button');
editButtons.forEach(button => {
  button.addEventListener('click', function (e) {
    e.stopPropagation();
    const taskId = this.dataset.taskId;
    const taskElement = this.closest('.task-item');
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
        loadDailyTasks();
      })
      .catch(error => {
        console.error('Ошибка при обновлении задачи:', error);
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

  taskElement.dataset.originalTitle = titleElement.textContent;
  if (detailsElement) {
    taskElement.dataset.originalDescription = detailsElement.textContent;
  }

  titleElement.addEventListener('blur', saveHandler);
  document.addEventListener('keydown', keyDownHandler);
}

