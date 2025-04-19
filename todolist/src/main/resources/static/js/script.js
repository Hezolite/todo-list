const tasksStorage = {};
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
  
  if (!tasksStorage[dateKey]) {
    tasksStorage[dateKey] = [
      {
        id: 'task-1',
        title: 'Заказать воду',
        description: 'Заказать 4 бутылки воды на вторник (1.04) к 16:00',
        completed: false
      },
      {
        id: 'task-2',
        title: 'Заказать воду',
        description: 'Заказать 4 бутылки воды на вторник (1.04) к 16:00',
        completed: false
      }
    ];
  }
  
  dailyTasks.innerHTML = '';
  
  tasksStorage[dateKey].forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.innerHTML = `
      <input type="checkbox" id="${task.id}" class="task-checkbox" ${task.completed ? 'checked' : ''} 
        onchange="toggleTaskCompletion('${dateKey}', '${task.id}')">
      <div class="task-text">
        <div class="task-title">${task.title}</div>
        <div class="task-details">${task.description}</div>
      </div>
    `;
    dailyTasks.appendChild(taskElement);
  });
}

function toggleTaskCompletion(dateKey, taskId) {
  const task = tasksStorage[dateKey].find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    updateProgress();
  }
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
      </div>
      ${group.tasks.map(task => `
        <div class="weekly-task-item">
          <input type="checkbox" id="${task.id}" class="weekly-task-checkbox" ${task.completed ? 'checked' : ''}>
          <label for="${task.id}" class="weekly-task-label">${task.title}</label>
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
        <input type="checkbox" id="${newId}" class="weekly-task-checkbox">
        <label for="${newId}" class="weekly-task-label">${input.value.trim()}</label>
      `;
      
      taskBlock.insertBefore(newTask, input);
      input.value = '';
      input.style.display = 'none';
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
}

function addTask() {
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  
  if (!title) return;
  
  const dateKey = selectedDate.toISOString().split('T')[0];
  const newId = 'task-' + Date.now();
  
  if (!tasksStorage[dateKey]) {
    tasksStorage[dateKey] = [];
  }
  
  tasksStorage[dateKey].push({
    id: newId,
    title: title,
    description: description,
    completed: false
  });
  
  loadDailyTasks();
  document.getElementById('task-title').value = '';
  document.getElementById('task-description').value = '';
  updateProgress();
}

function updateProgress() {
  const dateKey = selectedDate.toISOString().split('T')[0];
  const dailyTasks = tasksStorage[dateKey] || [];
  
  if (dailyTasks.length === 0) {
    document.getElementById('progressPercentage').textContent = '0%';
    updateCircleProgress(0);
    return;
  }
  
  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const progress = Math.round((completedTasks / dailyTasks.length) * 100);
  document.getElementById('progressPercentage').textContent = progress + '%';
  updateCircleProgress(progress);
}

function updateCircleProgress(percent) {
  const circle = document.querySelector('.progress-ring-circle');
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

