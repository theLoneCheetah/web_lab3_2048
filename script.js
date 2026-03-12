// Размер сетки
const SIZE = 4;
let gridData = [];  // двумерный массив со значениями плиток (0 по умолчанию)
let score = 0; // текущий счёт

// DOM элементы
const gridElement = document.getElementById('grid');
const tilesContainer = document.getElementById('tiles-container');
const scoreSpan = document.getElementById('score');
const newGameBtn = document.getElementById('new-game');
const undoBtn = document.getElementById('undo');

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    initGame();
    renderBoard();
});

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

// Обработчик кнопки новой игры
newGameBtn.addEventListener('click', () => {
    initGame();
    renderBoard();
});

// Обработчик кнопки назад
undoBtn.addEventListener('click', () => {
    alert('Функция отмены будет позже');
});

// Создание фоновой сетки при загрузке
createGridBackground();

// Обновление отрисовки при изменении размеров окна
window.addEventListener('resize', () => {
    renderBoard();
});