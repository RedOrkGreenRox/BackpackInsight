$workDir = (Get-Location).Path
Write-Host "=======================================================" -ForegroundColor Magenta
Write-Host "Работаем в директории: $workDir" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Magenta

# 0. Проверка наличия NConvert в системе
if (-not (Get-Command "nconvert" -ErrorAction SilentlyContinue)) {
    Write-Host "ОШИБКА: Утилита nconvert не найдена!" -ForegroundColor Red
    Write-Host "Пожалуйста, добавьте её в PATH, закройте это окно PowerShell, откройте новое и попробуйте снова." -ForegroundColor Yellow
    return
}

# ==============================================================================
# 1. ПЕРЕИМЕНОВАНИЕ ФАЙЛОВ В НИЖНИЙ РЕГИСТР
# ==============================================================================
Write-Host "1. Переименование файлов..." -ForegroundColor Cyan
Get-ChildItem -Path $workDir -Recurse -File | ForEach-Object {
    $lowerName = $_.Name.ToLower()
    if ($_.Name -cne $lowerName) {
        $tempName = $_.Name + ".tmp_rename"
        Rename-Item -Path $_.FullName -NewName $tempName -Force
        $tempPath = Join-Path $_.DirectoryName $tempName
        Rename-Item -Path $tempPath -NewName $lowerName -Force
    }
}

# ==============================================================================
# 2. ПЕРЕИМЕНОВАНИЕ ПАПОК В НИЖНИЙ РЕГИСТР
# ==============================================================================
Write-Host "2. Переименование папок..." -ForegroundColor Cyan
Get-ChildItem -Path $workDir -Recurse -Directory | Sort-Object FullName -Descending | ForEach-Object {
    $lowerName = $_.Name.ToLower()
    if ($_.Name -cne $lowerName) {
        $tempName = $_.Name + "_tmp_rename"
        Rename-Item -Path $_.FullName -NewName $tempName -Force
        $tempPath = Join-Path $_.Parent.FullName $tempName
        Rename-Item -Path $tempPath -NewName $lowerName -Force
    }
}

# ==============================================================================
# 3. УДАЛЕНИЕ ИЗОБРАЖЕНИЙ ВИДА *02-skinXX
# ==============================================================================
Write-Host "3. Удаление дубликатов скинов (02-skin)..." -ForegroundColor Cyan
Get-ChildItem -Path $workDir -Recurse -File | Where-Object { $_.BaseName -match '02-skin\d{2}$' } | ForEach-Object {
    Write-Host "Удален: $($_.Name)" -ForegroundColor Red
    Remove-Item -Path $_.FullName -Force
}

# ==============================================================================
# 4. КОНВЕРТАЦИЯ *01-skinXX -> СОЗДАНИЕ WEBP И AVIF
# ==============================================================================
Write-Host "4. Конвертация и сортировка форматов (WebP / AVIF)..." -ForegroundColor Cyan
Get-ChildItem -Path $workDir -Recurse -File | ForEach-Object {
    if ($_.BaseName -match '^(.+?)01-skin(\d{2})$') {
        $textPart  = $Matches[1]
        $digitPart = $Matches[2]
        
        # Будущее чистое имя файла (без расширения)
        $newNameBase = "$textPart$digitPart"
        
        $parentDir = $_.DirectoryName
        # Если файл по какой-то причине уже лежал в папке с названием формата — поднимаемся на уровень выше
        if ($_.Directory.Name -match '^(webp|avif|png|jpg|jpeg)$') {
            $parentDir = $_.Directory.Parent.FullName
        }
        
        # Определяем пути для новых папок
        $webpDir = Join-Path $parentDir "webp"
        $avifDir = Join-Path $parentDir "avif"
        
        # Создаем папки, если их нет
        if (-not (Test-Path -Path $webpDir)) { New-Item -ItemType Directory -Path $webpDir -Force | Out-Null }
        if (-not (Test-Path -Path $avifDir)) { New-Item -ItemType Directory -Path $avifDir -Force | Out-Null }
        
        # Полные пути для будущих файлов
        $targetWebp = Join-Path $webpDir "$newNameBase.webp"
        $targetAvif = Join-Path $avifDir "$newNameBase.avif"
        
        Write-Host "Конвертирую: $($_.Name) -> .webp и .avif" -ForegroundColor DarkCyan
        
        # Вызываем nconvert для создания WebP и AVIF (-quiet отключает спам в консоли)
        & nconvert -quiet -out webp -o $targetWebp $_.FullName
        & nconvert -quiet -out avif -o $targetAvif $_.FullName
        
        # Предохранитель: проверяем, что nconvert успешно создал ОБА файла
        if ((Test-Path -Path $targetWebp) -and (Test-Path -Path $targetAvif)) {
            # Только если оба файла появились, безвозвратно удаляем исходник (например, PNG)
            Remove-Item -Path $_.FullName -Force
            Write-Host "  [OK] Готово! Исходный файл удален." -ForegroundColor Green
        } else {
            Write-Host "  [ОШИБКА] Не удалось сгенерировать файлы для $($_.Name). Исходник сохранен." -ForegroundColor Red
        }
    }
}

Write-Host "Все операции успешно выполнены!" -ForegroundColor Green