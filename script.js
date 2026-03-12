// Размер сетки
const SIZE = 4;
let gridData = [];  // двумерный массив со значениями плиток (0 по умолчанию)
let score = 0; // текущий счёт
let history = []; // массив объектов {board, score} для отмены ходов
const MAX_HISTORY = 10; // максимальное количество отменяемых ходов

// DOM элементы
const gridElement = document.getElementById('grid');
const tilesContainer = document.getElementById('tiles-container');
const scoreSpan = document.getElementById('score');
const newGameBtn = document.getElementById('new-game');
const undoBtn = document.getElementById('undo');

// DOM для модальных окон
const gameOverModal = document.getElementById('game-over-modal');
const gameOverMessage = document.getElementById('game-over-message');
const playerNameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score-btn');
const restartFromModalBtn = document.getElementById('restart-from-modal');
const showLeaderboardBtn = document.getElementById('show-leaderboard');
const leaderboardModal = document.getElementById('leaderboard-modal');
const leaderboardBody = document.getElementById('leaderboard-body');
const closeLeaderboardBtn = document.getElementById('close-leaderboard');

// Массив лидеров
let leaders = [];

// Переменная для активации/деактивации управления, по умолчанию активна
let isGameActive = true;

// Функция для включения/отключения управления
function setGameActive(active) {
    isGameActive = active;
}

// Создание фоновой сетки при инициализации
function createGridBackground() {
    // Очистка
    while (gridElement.firstChild) {
        gridElement.removeChild(gridElement.firstChild);
    }
    // Заполнение
    for (let i = 0; i < SIZE * SIZE; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        gridElement.appendChild(cell);
    }
}

// Создание нового состояния
function initGame() {
    // Пустая матрица 4x4
    gridData = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    score = 0;
    history = [];  // очистка истории
    updateScore();

    // От 1 до 3 случайных плиток
    const initialTilesCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < initialTilesCount; i++) {
        addRandomTile();
    }
}

// Добавление одной случайной плитки в свободную клетку
function addRandomTile() {
    const emptyCells = [];
    // Находим пустые клетки
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (gridData[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }
    if (emptyCells.length === 0) return; // нет свободных клеток

    // Случайный индекс
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];
    // 2 - 90%, 4 - 10% появления
    const value = Math.random() < 0.9 ? 2 : 4;
    gridData[row][col] = value;
}

// Обновление счёта на экране
function updateScore() {
    scoreSpan.textContent = score;
}

// Отрисовка плиток на основе gridData
function renderBoard() {
    // Очистка
    while (tilesContainer.firstChild) {
        tilesContainer.removeChild(tilesContainer.firstChild);
    }

    // Плитки позиционируются абсолютно в рамках игрового поля
    const boardWidth = tilesContainer.clientWidth;
    const boardHeight = tilesContainer.clientHeight;
    const gap = 10; // отступ между плитками
    const tileSize = (boardWidth - gap * (SIZE - 1)) / SIZE; // сторона плитки

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const value = gridData[row][col];
            if (value !== 0) {
                // Если плитка непустая, создаём элемент
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.setAttribute('data-value', value);
                tile.textContent = value;

                // Вычисляем позицию
                const left = col * (tileSize + gap);
                const top = row * (tileSize + gap);

                // Ширина, высота и смещение
                tile.style.width = `${tileSize}px`;
                tile.style.height = `${tileSize}px`;
                tile.style.left = `${left}px`;
                tile.style.top = `${top}px`;

                tilesContainer.appendChild(tile);
            }
        }
    }
}

// Обработка линии из 4 чисел с многоступенчатым слиянием
function processLine(line, scoreAccumulator) {
    // Извлечение ненулевых значений
    let numbers = line.filter(val => val !== 0);
    
    // Многоступенчатое слияние, например [2,2,2,2] -> [8,0,0,0]
    let changed = true;
    while (changed && numbers.length > 1) {
        changed = false;
        let newNumbers = []; // временный массив для новых значений
        for (let i = 0; i < numbers.length; i++) {
            if (i < numbers.length - 1 && numbers[i] === numbers[i + 1]) {
                // Слияние при равенстве значений
                const mergedValue = numbers[i] * 2;
                newNumbers.push(mergedValue);
                scoreAccumulator.value += mergedValue; // накопление очков в переданном объекте
                i++; // пропуск следующего элемента
                changed = true;
            } else {
                newNumbers.push(numbers[i]); // пропуск, если не равны
            }
        }
        numbers = newNumbers; // обновление основного массива
    }
    
    // Дополнение нулями до длины SIZE
    const result = [...numbers];
    while (result.length < SIZE) {
        result.push(0);
    }
    return result; // новый массив
}

// Сеттеры и геттеры для строк и столбцов
function getRow(row) {
    return gridData[row];
}

function setRow(row, newRow) {
    gridData[row] = [...newRow];
}

function getCol(col) {
    const column = [];
    for (let row = 0; row < SIZE; row++) {
        column.push(gridData[row][col]);
    }
    return column;
}

function setCol(col, newCol) {
    for (let row = 0; row < SIZE; row++) {
        gridData[row][col] = newCol[row];
    }
}

// Сохранение текущего состояния в историю (перед ходом)
function pushToHistory(board, currentScore) {
    const state = {
        board: JSON.parse(JSON.stringify(board)),
        score: currentScore
    };
    history.push(state);
    if (history.length > MAX_HISTORY) {
        history.shift(); // удаление самой старой записи
    }
}

// Отмена последнего хода
function undo() {
    // При отсутствии истории
    if (history.length === 0) {
        console.log('Нет ходов для отмены');
        return;
    }

    // Извлечение последнего сохранённого состояния
    const prevState = history.pop();
    gridData = prevState.board;
    score = prevState.score;

    // Обновление и сохранение в localStorage
    updateScore();
    renderBoard();
    saveGameToLocalStorage();
    checkGameOverAndShowModal(); // проверка окончания игры
}

// Сохранение текущего состояния игры в localStorage
function saveGameToLocalStorage() {
    const gameState = {
        board: gridData,
        score: score,
        history: history
    };
    localStorage.setItem('game2048', JSON.stringify(gameState));
}

// Загрузка состояния игры из localStorage
function loadGameFromLocalStorage() {
    const saved = localStorage.getItem('game2048');
    if (saved) {
        try {
            const gameState = JSON.parse(saved);
            gridData = gameState.board;
            score = gameState.score;
            history = gameState.history || []; // на случай, если истории нет
            updateScore();
        } catch (e) {
            console.error('Ошибка загрузки сохранения', e);
            initGame(); // если ошибка, начать новую игру
        }
    } else {
        initGame(); // если пусто, начать новую игру
    }

    // Обновление и проверка окончания игры
    renderBoard();
    checkGameOverAndShowModal();
}

// Основная функция движения
function move(direction) {
    if (!isGameActive) return;

    // Сохранение текущего состояния для проверки изменений
    const oldGrid = JSON.parse(JSON.stringify(gridData));
    const oldScore = score;
    
    // Очки за этот ход
    const addedScore = { value: 0 };
    
    // Обработка в зависимости от направления
    if (direction === 'left') {
        for (let row = 0; row < SIZE; row++) {
            const line = getRow(row);
            const newLine = processLine(line, addedScore);
            setRow(row, newLine);
        }
    } else if (direction === 'right') {
        // Разворачиваем строку, обрабатываем как left, разворачиваем обратно
        for (let row = 0; row < SIZE; row++) {
            const line = getRow(row).reverse(); // реверсируем
            const newLine = processLine(line, addedScore);
            setRow(row, newLine.reverse()); // обратно
        }
    } else if (direction === 'up') {
        for (let col = 0; col < SIZE; col++) {
            const line = getCol(col);
            const newLine = processLine(line, addedScore);
            setCol(col, newLine);
        }
    } else if (direction === 'down') {
        for (let col = 0; col < SIZE; col++) {
            const line = getCol(col).reverse(); // реверсируем
            const newLine = processLine(line, addedScore);
            setCol(col, newLine.reverse()); // обратно
        }
    }
    
    // Проверка, изменения поля (stringify подходит для небольшого массива)
    if (JSON.stringify(oldGrid) !== JSON.stringify(gridData)) {
        // Сохранение состояния до хода в историю
        pushToHistory(oldGrid, oldScore);

        // Обновление счёта
        score += addedScore.value;
        updateScore();
        
        // Добавление новых плиток (1 или 2)
        const tilesToAdd = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < tilesToAdd; i++) {
            addRandomTile();
        }
        
        // Обновление и сохранение
        renderBoard();
        saveGameToLocalStorage();
        checkGameOverAndShowModal(); // проверка окончания игры
    } else {
        // Если поле не изменилось, ничего не делать
        console.log('Невозможный ход');
    }
}

// Инициализация управления (клавиатура + свайпы)
function initControls() {
    const board = document.querySelector('.game-board');
    
    // Клавиатура
    window.addEventListener('keydown', (e) => {
        if (!isGameActive) return;
        
        const key = e.key;
        // Только стрелки
        if (key.startsWith('Arrow')) {
            e.preventDefault(); // предотвращение прокрутки страницы
            const direction = key.replace('Arrow', '').toLowerCase();
            move(direction);
        }
    });
    
    // Свайпы
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false; // флаг движения для отличия от тапа
    
    // Момент касания экрана
    board.addEventListener('touchstart', (e) => {
        if (!isGameActive) return;
        
        const touch = e.touches[0]; // первый коснувшийся палец
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchMoved = false;
    }, { passive: true });
    
    // Процесс движения после касания
    board.addEventListener('touchmove', (e) => {
        if (!isGameActive) return;
        
        e.preventDefault(); // предотвращение прокрутки
        touchMoved = true; // флаг движения
    }, { passive: false });
    
    // Окончания движения и касания
    board.addEventListener('touchend', (e) => {
        if (!isGameActive) return;
        
        // Если не было движения (тап), не обрабатывать
        if (!touchMoved) return;
        
        const touch = e.changedTouches[0]; // первый изменивший состояние палец
        if (!touch) return;
        
        // Разница координат по горизонтали и вертикали
        const diffX = touch.clientX - touchStartX;
        const diffY = touch.clientY - touchStartY;
        
        const minDistance = 30; // минимальная длина свайпа - 30 пикселей
        
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minDistance) {
            // Горизонтальный свайп
            if (diffX > 0) {
                move('right');
            } else {
                move('left');
            }
        } else if (Math.abs(diffY) > minDistance) {
            // Вертикальный свайп
            if (diffY > 0) {
                move('down');
            } else {
                move('up');
            }
        }
    }, { passive: true });
}

// Загрузка лидеров из local storage
function loadLeaders() {
    const stored = localStorage.getItem('leaderboard2048');
    leaders = stored ? JSON.parse(stored) : [];
}

// Сохранение 10 лидеров в local storage
function saveLeaders() {
    leaders.sort((a, b) => b.score - a.score);
    leaders = leaders.slice(0, 10);
    localStorage.setItem('leaderboard2048', JSON.stringify(leaders));
}

// Запись в массив лидеров
function addLeader(name, score) {
    const date = new Date().toLocaleDateString('ru-RU');
    leaders.push({ name, score, date });
    saveLeaders(); // сохранить
}

// Рендеринг таблицы лидеров
function renderLeaderboard() {
    // Очистка
    while (leaderboardBody.firstChild) {
        leaderboardBody.removeChild(leaderboardBody.firstChild);
    }
    
    leaders.forEach(entry => {
        // Построчно
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td'); // имя
        nameCell.textContent = entry.name;
        row.appendChild(nameCell);
        
        const scoreCell = document.createElement('td'); // счёт
        scoreCell.textContent = entry.score;
        row.appendChild(scoreCell);
        
        const dateCell = document.createElement('td'); // дата
        dateCell.textContent = entry.date;
        row.appendChild(dateCell);
        
        leaderboardBody.appendChild(row);
    });
}

// Проверка наличия плитки 2048 или больше (победа)
function hasWon() {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (gridData[row][col] >= 2048) return true;
        }
    }
    return false;
}

// Проверка окончания игры при невозможности хода
function isGameOver() {
    // Есть пустые клетки?
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (gridData[row][col] === 0) return false;
        }
    }

    // Горизонтальные слияния?
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE - 1; col++) {
            if (gridData[row][col] === gridData[row][col + 1]) return false;
        }
    }

    // Вертикальные слияния?
    for (let col = 0; col < SIZE; col++) {
        for (let row = 0; row < SIZE - 1; row++) {
            if (gridData[row][col] === gridData[row + 1][col]) return false;
        }
    }

    return true; // если ничего нет, то игра окончена
}

// Модальное окно окончания игры
function showGameOverModal(isWin) {
    gameOverModal.classList.remove('hidden');
    playerNameInput.value = '';
    playerNameInput.classList.remove('hidden');
    saveScoreBtn.classList.remove('hidden');
    restartFromModalBtn.classList.remove('hidden');

    // Обычное либо выигрышное сообщение
    if (isWin) {
        gameOverMessage.textContent = 'Победа! Вы достигли 2048! Введите имя для сохранения рекорда:';
    } else {
        gameOverMessage.textContent = 'Игра окончена! Введите имя для сохранения рекорда:';
    }
}

// Скрытие окна окончания игры
function hideGameOverModal() {
    gameOverModal.classList.add('hidden');
}

// Проверка окончания игры, показ/скрытие модального окна
function checkGameOverAndShowModal() {
    const won = hasWon();
    const over = isGameOver();
    
    // Если победа или поражение, окончить игру
    if (won || over) {
        setGameActive(false);
        showGameOverModal(won); // передаём флаг о победе
    } else {
        setGameActive(true);
        hideGameOverModal();
    }
}

// Обработчик кнопки сохранения результата
saveScoreBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (!name) { // требуется ввести имя
        alert('Введите имя');
        return;
    }

    // Сохранение в таблицу лидеров и её отображение
    addLeader(name, score);
    renderLeaderboard();

    // Изменение интерфейса, сообщение о сохранении
    gameOverMessage.textContent = 'Ваш рекорд сохранён!';
    playerNameInput.classList.add('hidden');
    saveScoreBtn.classList.add('hidden');
});

// Обработчик кнопки начала новой игры из модального окна
restartFromModalBtn.addEventListener('click', () => {
    hideGameOverModal();
    setGameActive(true);
    history = [];
    initGame();
    renderBoard();
    saveGameToLocalStorage();
});

// Обработчик кнопки показа таблицы лидеров из основного окна
showLeaderboardBtn.addEventListener('click', () => {
    setGameActive(false);
    loadLeaders(); // подгрузка актуальных данных
    renderLeaderboard();
    leaderboardModal.classList.remove('hidden');
});

// Обработчик кнопки закрытия таблицы лидеров
closeLeaderboardBtn.addEventListener('click', () => {
    leaderboardModal.classList.add('hidden');
    setGameActive(true);
    
    // Активация игрового поля, если игра не была окончена
    if (hasWon() || isGameOver()) {
        setGameActive(false);
    } else {
        setGameActive(true);
    }
});

// Обработчик кнопки новой игры
newGameBtn.addEventListener('click', () => {
    hideGameOverModal();
    leaderboardModal.classList.add('hidden');
    history = []; // очистка истории
    initGame();
    renderBoard();
    saveGameToLocalStorage(); // сохранение текущего нового состояния
    checkGameOverAndShowModal();
});

// Обработчик кнопки назад
undoBtn.addEventListener('click', () => {
    undo();
});

// Создание фоновой сетки при загрузке
createGridBackground();

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    loadGameFromLocalStorage();
    loadLeaders();
    initControls(); // инициализация управления
});

// Обновление отрисовки при изменении размеров окна
window.addEventListener('resize', () => {
    renderBoard();
});