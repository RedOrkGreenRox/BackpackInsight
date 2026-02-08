const area = document.getElementById('uploadArea');
const input = document.getElementById('jsonInput');
const fInput = document.getElementById('fileInput');
const hint = document.getElementById('uploadHint');

function read(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => {
        input.value = e.target.result;
        hint.style.display = 'none';
    };
    r.readAsText(file);
}

// КЛИК (Мобилки + ПК)
if (area) {
    area.addEventListener('click', (e) => {
        if (input.value.trim() === "") fInput.click();
    });
}

// DRAG & DROP (Важно: вешаем на input, чтобы отменить вставку пути)
if (input) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(n => {
        input.addEventListener(n, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    input.addEventListener('dragover', () => area.classList.add('drag-over'));
    input.addEventListener('dragleave', () => area.classList.remove('drag-over'));
    input.addEventListener('drop', (e) => {
        area.classList.remove('drag-over');
        read(e.dataTransfer.files[0]);
    });

    // PASTE (Вставка файла через Ctrl+V)
    input.addEventListener('paste', (e) => {
        // Проверяем, есть ли файлы в буфере обмена
        if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
            e.preventDefault(); // Отменяем стандартную вставку (имени файла)
            read(e.clipboardData.files[0]); // Читаем первый файл
        }
        // Если файлов нет, позволяем стандартную вставку текста
    });

    input.addEventListener('input', () => hint.style.display = input.value ? 'none' : 'flex');
}

if (fInput) {
    fInput.addEventListener('change', (e) => read(e.target.files[0]));
}
