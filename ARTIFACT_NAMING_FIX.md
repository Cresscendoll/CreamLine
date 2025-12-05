# Исправление именования установщика CreamLine

## Проблема

После `npm run dist` создавался файл:
```
CreamLine Setup 1.1.3.exe  ❌ (с пробелами)
```

Вместо ожидаемого:
```
CreamLine-Setup-1.1.3.exe  ✅ (с дефисами)
```

## Причина

У вас была конфигурация в **двух местах**:

1. **`package.json`** → секция `"build"`
2. **`electron-builder.yml`**

**Electron-builder читает конфигурацию в таком порядке:**
1. Сначала `package.json` → секция `"build"`
2. Потом `electron-builder.yml` (если что-то не указано в package.json)

**Проблема:** В `package.json` НЕ БЫЛО поля `artifactName`, поэтому electron-builder использовал **дефолтное поведение**:
```
${productName} ${version}.${ext}
```
Результат: `CreamLine Setup 1.1.3.exe` (с пробелами)

При этом `electron-builder.yml` содержал правильный `artifactName`, но он **игнорировался**, потому что `package.json` имеет приоритет.

## Решение

Добавил `artifactName` в **`package.json`** в двух местах:

### 1. В секции `"build"` (строка 14):
```json
{
  "build": {
    "appId": "com.creamline.app",
    "productName": "CreamLine",
    "artifactName": "CreamLine-Setup-${version}.${ext}",  // ← ДОБАВЛЕНО
    ...
  }
}
```

### 2. В секции `"nsis"` (строка 31):
```json
{
  "build": {
    ...
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "shortcutName": "CreamLine",
      "artifactName": "CreamLine-Setup-${version}.${ext}"  // ← ДОБАВЛЕНО
    }
  }
}
```

## Почему это работает

### `artifactName` на уровне `build`:
- Контролирует имя **всех** артефактов (exe, zip, dmg, etc.)
- Формат: `"CreamLine-Setup-${version}.${ext}"`
- `${version}` автоматически берётся из `"version": "1.1.3"`
- `${ext}` подставляет расширение (.exe)

### `artifactName` на уровне `nsis`:
- Контролирует имя **конкретно NSIS-установщика**
- Переопределяет общий `artifactName` для Windows-установщика
- Гарантирует, что даже если что-то пойдёт не так на верхнем уровне, NSIS создаст правильное имя

## Результат после `npm run dist`

```
dist/
  ├── CreamLine-Setup-1.1.3.exe          ✅ Установщик
  ├── CreamLine-Setup-1.1.3.exe.blockmap ✅ Blockmap (автоматически)
  └── latest.yml                          ✅ Метаданные
```

### Содержимое `latest.yml`:
```yaml
version: 1.1.3
files:
  - url: CreamLine-Setup-1.1.3.exe
    sha512: ...
    size: ...
path: CreamLine-Setup-1.1.3.exe
sha512: ...
```

## Автообновления работают

Electron-updater ищет файл по пути:
```
https://github.com/Cresscendoll/CreamLine/releases/download/v1.1.3/CreamLine-Setup-1.1.3.exe
```

И находит файл с **точно таким именем**! ✅

## Важные моменты

### ✅ Что правильно:
- `"productName": "CreamLine"` - БЕЗ пробелов, БЕЗ "Setup", БЕЗ версии
- `"artifactName": "CreamLine-Setup-${version}.${ext}"` - жёстко задано
- `${version}` берётся из `"version": "1.1.3"` автоматически
- Blockmap создаётся автоматически с правильным именем

### ❌ Что НЕ нужно делать:
- НЕ используйте `${buildVersion}` - это кастомная переменная
- НЕ добавляйте `extraMetadata.version` - это дублирование
- НЕ пишите версию в `productName` - она подставится автоматически
- НЕ используйте пробелы в `artifactName` - ломает URL

## Где менять версию

**ТОЛЬКО в `package.json`:**
```json
{
  "version": "1.1.3"  // ← Единственное место
}
```

После изменения версии на `1.1.4`:
```bash
npm run dist
```

Получите:
```
CreamLine-Setup-1.1.4.exe  ✅
```

## Приоритет конфигурации

Electron-builder читает конфигурацию в таком порядке:
1. **`package.json` → `"build"`** (высший приоритет)
2. **`electron-builder.yml`** (если что-то не указано в package.json)
3. **Дефолтные значения** (если нигде не указано)

**Рекомендация:** Используйте **либо** `package.json`, **либо** `electron-builder.yml`, но не оба одновременно. В вашем случае проще использовать `package.json`, так как там уже есть основная конфигурация.

## Проверка

После сборки проверьте:
```bash
ls dist/
```

Должны увидеть:
```
CreamLine-Setup-1.1.3.exe
CreamLine-Setup-1.1.3.exe.blockmap
latest.yml
```

Если видите `CreamLine Setup 1.1.3.exe` (с пробелами) - значит `artifactName` не применился.
