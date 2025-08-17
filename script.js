// 투두리스트 애플리케이션
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentDate = new Date();
        this.editingTodo = null;
        
        // 기존 할 일 데이터에 기본 중요도 설정 (마이그레이션)
        this.migrateExistingTodos();
        
        this.initializeElements();
        this.bindEvents();
        this.renderTodoList();
        this.renderCalendar();
        this.setDefaultDate();
    }

    // 기존 할 일 데이터 마이그레이션
    migrateExistingTodos() {
        let needsUpdate = false;
        this.todos.forEach(todo => {
            if (!todo.priority) {
                todo.priority = 'medium';
                needsUpdate = true;
            }
        });
        
        if (needsUpdate) {
            this.saveToLocalStorage();
        }
    }

    // DOM 요소 초기화
    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.todoDate = document.getElementById('todoDate');
        this.todoPriority = document.getElementById('todoPriority');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.listViewBtn = document.getElementById('listViewBtn');
        this.calendarViewBtn = document.getElementById('calendarViewBtn');
        this.listView = document.getElementById('listView');
        this.calendarView = document.getElementById('calendarView');
        this.calendarDays = document.getElementById('calendarDays');
        this.currentMonthElement = document.getElementById('currentMonth');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.editModal = document.getElementById('editModal');
        this.editInput = document.getElementById('editInput');
        this.editDate = document.getElementById('editDate');
        this.editPriority = document.getElementById('editPriority');
        this.saveEditBtn = document.getElementById('saveEdit');
        this.cancelEditBtn = document.getElementById('cancelEdit');
    }

    // 이벤트 바인딩
    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        this.listViewBtn.addEventListener('click', () => this.switchView('list'));
        this.calendarViewBtn.addEventListener('click', () => this.switchView('calendar'));
        
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        
        // 모달 외부 클릭 시 닫기
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeEditModal();
        });
    }

    // 기본 날짜 설정 (오늘 날짜)
    setDefaultDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        this.todoDate.value = `${year}-${month}-${day}`;
    }

    // 할 일 추가
    addTodo() {
        const text = this.todoInput.value.trim();
        const date = this.todoDate.value;
        const priority = this.todoPriority.value;
        
        if (!text || !date) {
            alert('할 일과 날짜를 모두 입력해주세요.');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            date: date,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.saveToLocalStorage();
        this.renderTodoList();
        this.renderCalendar();
        
        // 입력 필드 초기화
        this.todoInput.value = '';
        this.todoInput.focus();
    }

    // 할 일 삭제
    deleteTodo(id) {
        if (confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveToLocalStorage();
            this.renderTodoList();
            this.renderCalendar();
        }
    }

    // 할 일 수정 모달 열기
    editTodo(todo) {
        this.editingTodo = todo;
        this.editInput.value = todo.text;
        this.editDate.value = todo.date;
        this.editPriority.value = todo.priority || 'medium';
        this.editModal.style.display = 'block';
        this.editInput.focus();
    }

    // 할 일 수정 저장
    saveEdit() {
        const text = this.editInput.value.trim();
        const date = this.editDate.value;
        const priority = this.editPriority.value;
        
        if (!text || !date) {
            alert('할 일과 날짜를 모두 입력해주세요.');
            return;
        }

        if (this.editingTodo) {
            this.editingTodo.text = text;
            this.editingTodo.date = date;
            this.editingTodo.priority = priority;
            this.saveToLocalStorage();
            this.renderTodoList();
            this.renderCalendar();
            this.closeEditModal();
        }
    }

    // 수정 모달 닫기
    closeEditModal() {
        this.editModal.style.display = 'none';
        this.editingTodo = null;
        this.editInput.value = '';
        this.editDate.value = '';
        this.editPriority.value = 'medium';
    }

    // 할 일 완료 상태 토글
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.renderTodoList();
            this.renderCalendar();
        }
    }

    // 뷰 전환
    switchView(view) {
        if (view === 'list') {
            this.listView.classList.add('active');
            this.calendarView.classList.remove('active');
            this.listViewBtn.classList.add('active');
            this.calendarViewBtn.classList.remove('active');
        } else {
            this.listView.classList.remove('active');
            this.calendarView.classList.add('active');
            this.listViewBtn.classList.remove('active');
            this.calendarViewBtn.classList.add('active');
        }
    }

    // 달력 월 변경
    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderCalendar();
    }

    // 할 일 목록 렌더링
    renderTodoList() {
        if (this.todos.length === 0) {
            this.todoList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">등록된 할 일이 없습니다.</p>';
            return;
        }

        // 중요도, 완료 상태, 날짜별로 정렬
        const sortedTodos = [...this.todos].sort((a, b) => {
            // 먼저 완료 상태로 정렬 (미완료가 위, 완료가 아래)
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            // 완료 상태가 같으면 중요도별로 정렬 (높음 > 보통 > 낮음)
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority || 'medium'];
            const bPriority = priorityOrder[b.priority || 'medium'];
            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }
            // 중요도가 같으면 날짜별로 정렬
            return new Date(a.date) - new Date(b.date);
        });
        
        this.todoList.innerHTML = sortedTodos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority || 'medium'}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="todoApp.toggleTodo(${todo.id})">
                <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                <div class="todo-priority ${todo.priority || 'medium'}">${this.getPriorityText(todo.priority)}</div>
                <div class="todo-date">${this.formatDate(todo.date)}</div>
                <div class="todo-actions">
                    <button class="edit-btn" onclick="todoApp.editTodo(${JSON.stringify(todo).replace(/"/g, '&quot;')})">수정</button>
                    <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">삭제</button>
                </div>
            </div>
        `).join('');
    }

    // 달력 렌더링
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 현재 월 표시 업데이트
        this.currentMonthElement.textContent = `${year}년 ${month + 1}월`;
        
        // 달력 시작일과 마지막일 계산
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        let calendarHTML = '';
        const today = new Date();
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = this.isSameDate(currentDate, today);
            const dateString = this.formatDateForCalendar(currentDate);
            const dayTodos = this.getTodosForDate(dateString);
            
            const dayClass = [
                'calendar-day',
                isCurrentMonth ? '' : 'other-month',
                isToday ? 'today' : ''
            ].filter(Boolean).join(' ');
            
            calendarHTML += `
                <div class="${dayClass}">
                    <div class="calendar-day-number">${currentDate.getDate()}</div>
                    <div class="calendar-todos">
                        ${dayTodos.map(todo => `
                            <div class="calendar-todo-item" title="${this.escapeHtml(todo.text)}">
                                ${this.escapeHtml(todo.text)}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        this.calendarDays.innerHTML = calendarHTML;
    }

    // 특정 날짜의 할 일 가져오기
    getTodosForDate(dateString) {
        return this.todos.filter(todo => todo.date === dateString);
    }

    // 날짜 비교 (년, 월, 일만)
    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    // 날짜 포맷팅 (YYYY-MM-DD)
    formatDateForCalendar(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 날짜 포맷팅 (사용자 친화적)
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (this.isSameDate(date, today)) {
            return '오늘';
        } else if (this.isSameDate(date, tomorrow)) {
            return '내일';
        } else {
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}월 ${day}일`;
        }
    }

    // 중요도 텍스트 반환
    getPriorityText(priority) {
        const priorityTexts = {
            high: '높음',
            medium: '보통',
            low: '낮음'
        };
        return priorityTexts[priority] || '보통';
    }

    // HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 로컬스토리지에 저장
    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// 애플리케이션 초기화
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});
