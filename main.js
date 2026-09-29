/* ==========================================================================
   나의 할 일 목록 (To Do List) - 중복 방지, 필터링, 완료 일괄 삭제 (main.js)
   ========================================================================== */

// --- 1. 상수 및 상태 관리 변수 ---
const STORAGE_KEY = 'vibe_todo_list_data';

// 전체 할 일 목록 배열
let todos = [];

// 현재 선택된 필터 상태 ('all' | 'active' | 'completed')
let currentFilter = 'all';

// --- 2. DOM 요소 획득 ---
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const emptyTitle = document.getElementById('empty-title');
const emptyDesc = document.getElementById('empty-desc');
const totalCountEl = document.getElementById('total-count');
const completedCountEl = document.getElementById('completed-count');
const filterButtonsContainer = document.getElementById('filter-buttons');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

// --- 3. LocalStorage 데이터 읽기 / 쓰기 함수 ---
function loadTodos() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      todos = JSON.parse(savedData);
    } catch (e) {
      console.error('LocalStorage 데이터 파싱 실패:', e);
      todos = [];
    }
  } else {
    todos = [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// --- 4. 화면 렌더링 및 필터링 적용 함수 ---
/**
 * 현재 필터 상태(currentFilter)에 맞춰 할 일 목록과 통계/버튼 상태를 렌더링합니다.
 */
function render() {
  // 1) 전체 및 완료 통계 개수 계산
  const totalCount = todos.length;
  const completedCount = todos.filter((todo) => todo.completed).length;

  totalCountEl.textContent = totalCount;
  completedCountEl.textContent = completedCount;

  // 2) 완료된 항목 삭제 버튼 활성화/비활성화
  clearCompletedBtn.disabled = completedCount === 0;

  // 3) 현재 필터 상태에 따른 목록 필터링
  let filteredTodos = todos;
  if (currentFilter === 'active') {
    filteredTodos = todos.filter((todo) => !todo.completed);
  } else if (currentFilter === 'completed') {
    filteredTodos = todos.filter((todo) => todo.completed);
  }

  // 4) 필터링 결과가 비어있는 경우 Empty State 표시
  if (filteredTodos.length === 0) {
    emptyState.style.display = 'flex';
    todoList.innerHTML = '';

    if (todos.length === 0) {
      emptyTitle.textContent = '등록된 할 일이 없습니다 🎉';
      emptyDesc.textContent = '새로운 할 일을 추가하고 하루를 시작해보세요!';
    } else if (currentFilter === 'active') {
      emptyTitle.textContent = '진행 중인 할 일이 없습니다 ✨';
      emptyDesc.textContent = '모든 할 일을 마쳤거나 새로운 할 일을 추가해보세요.';
    } else if (currentFilter === 'completed') {
      emptyTitle.textContent = '완료된 할 일이 없습니다 📝';
      emptyDesc.textContent = '할 일을 완료하고 체크해 보세요!';
    }
    return;
  }

  // 5) 비어있지 않다면 Empty State 숨김 후 렌더링
  emptyState.style.display = 'none';
  todoList.innerHTML = '';

  filteredTodos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    // 체크박스 (완료/미완료 토글)
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    // 할 일 텍스트
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    // 개별 삭제 버튼
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
    deleteBtn.title = '삭제';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });
}

// --- 5. 할 일 추가 및 중복 방지 기능 ---
/**
 * 새로운 할 일을 추가합니다. 
 * 입력값이 빈 값이거나 중복된 내용이 있을 경우 경고창을 표시합니다.
 */
function addTodo() {
  const text = todoInput.value.trim();

  // 1) 빈 값 검사
  if (!text) {
    alert('할 일을 입력하세요');
    todoInput.focus();
    return;
  }

  // 2) 중복 방지 기능: 이미 동일한 텍스트(대소문자 구분 없이)가 등록되어 있는지 검사
  const isDuplicate = todos.some(
    (todo) => todo.text.toLowerCase() === text.toLowerCase()
  );

  if (isDuplicate) {
    alert('이미 등록된 할 일입니다');
    todoInput.focus();
    return;
  }

  // 3) 새로운 할 일 등록
  const newTodo = {
    id: Date.now(),
    text: text,
    completed: false
  };

  todos.push(newTodo);
  saveTodos(); // LocalStorage 저장

  todoInput.value = '';
  todoInput.focus();

  render();
}

// --- 6. 완료/미완료 토글 기능 ---
function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });

  saveTodos();
  render();
}

// --- 7. 단일 항목 삭제 기능 ---
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

// --- 8. 완료 항목 일괄 삭제 기능 ---
/**
 * 완료된 모든 할 일 항목(completed === true)을 일괄 삭제합니다.
 */
function clearCompleted() {
  const completedCount = todos.filter((todo) => todo.completed).length;
  if (completedCount === 0) return;

  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
}

// --- 9. 필터 버튼 이벤트 처리 ---
/**
 * 전체 / 진행중 / 완료 필터 버튼 클릭 시 강조 스타일 변경 및 화면을 필터링합니다.
 */
function setFilter(filterType) {
  currentFilter = filterType;

  // 필터 버튼 활성화 클래스(active) 갱신
  const buttons = filterButtonsContainer.querySelectorAll('.filter-btn');
  buttons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filterType);
  });

  render();
}

// --- 10. 이벤트 리스너 등록 및 앱 초기화 ---
function initApp() {
  loadTodos();

  // 추가 버튼 및 Enter 키 이벤트
  addBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addTodo();
    }
  });

  // 필터 버튼 클릭 이벤트 등록
  filterButtonsContainer.addEventListener('click', (e) => {
    const target = e.target.closest('.filter-btn');
    if (target && target.dataset.filter) {
      setFilter(target.dataset.filter);
    }
  });

  // 완료 항목 일괄 삭제 버튼 이벤트 등록
  clearCompletedBtn.addEventListener('click', clearCompleted);

  // 최초 렌더링
  render();
}

// DOM 준비 완료 시 실행
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
