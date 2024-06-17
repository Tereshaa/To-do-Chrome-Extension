document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const categorySelect = document.getElementById('categorySelect');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    let editingTaskId = null;
    let tasks = []; 
    
    // Load tasks from storage when popup opens
    chrome.storage.sync.get('tasks', function(data) {
        tasks = data.tasks || []; // Assign retrieved tasks to global tasks variable
        renderTasks(tasks);
    });
    
    // Add task event listener
    addTaskBtn.addEventListener('click', function() {
        const taskText = taskInput.value.trim();
        const category = categorySelect.value;
        
        if (taskText === '') return;
        
        if (editingTaskId !== null) {
            // Editing existing task
            editTask(editingTaskId, taskText, category);
            editingTaskId = null; // Reset editing state
        } else {
            // Create new task object
            const newTask = {
                text: taskText,
                category: category,
                completed: false,
                id: Date.now() // Unique ID for each task
            };
            
            // Save task to storage and update tasks array
            tasks.push(newTask);
            chrome.storage.sync.set({ 'tasks': tasks }, function() {
                renderTasks(tasks);
            });
        }
        
        // Clear input fields
        taskInput.value = '';
        taskInput.focus();
    });
    
    // Render tasks
    function renderTasks(tasks) {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = createTaskElement(task);
            taskList.appendChild(li);
        });
    }
    
    // Create task element
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.textContent = task.text;
        li.classList.add('task-item', task.category); // Add task-item class for styling
        li.classList.toggle('completed', task.completed);
        
        // Create category icon
        const categoryIcon = document.createElement('i');
        categoryIcon.classList.add('category-icon', 'fas');
        if (task.category === 'dsa') {
            categoryIcon.classList.add('fa-code'); // DSA icon
        } else if (task.category === 'dev') {
            categoryIcon.classList.add('fa-laptop-code'); // Dev icon
        } else if (task.category === 'personal') {
            categoryIcon.classList.add('fa-user'); // Personal icon
        }
        li.appendChild(categoryIcon); 
        
        // Create edit icon
        const editIcon = document.createElement('i');
        editIcon.classList.add('fas', 'fa-edit', 'edit-icon');
        editIcon.addEventListener('click', function() {
            editTaskStart(task);
        });
        li.appendChild(editIcon);
        
        // Create delete icon
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fas', 'fa-trash', 'delete-icon');
        deleteIcon.addEventListener('click', function() {
            deleteTask(task.id);
        });
        li.appendChild(deleteIcon); 
        
        // Task click event to toggle completion
        li.addEventListener('click', function() {
            task.completed = !task.completed;
            chrome.storage.sync.set({ 'tasks': tasks }, function() {
                renderTasks(tasks);
            });
        });
        
        return li;
    }
    
    // Edit task start
    function editTaskStart(task) {
        taskInput.value = task.text;
        categorySelect.value = task.category;
        editingTaskId = task.id;
    }
    
    // Edit task
    function editTask(taskId, newText, newCategory) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].text = newText;
            tasks[taskIndex].category = newCategory;
            chrome.storage.sync.set({ 'tasks': tasks }, function() {
                renderTasks(tasks);
            });
        }
    }
    
    // Delete task function
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        chrome.storage.sync.set({ 'tasks': tasks }, function() {
            renderTasks(tasks);
        });
    }
});
