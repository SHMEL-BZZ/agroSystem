# agroSystem — клиент

React + [Vite](https://vite.dev).

## Команды

- `npm install` — установить зависимости
- `npm start` (или `npm run dev`) — dev-сервер на http://localhost:3000
- `npm run build` — production-сборка в папку `build`
- `npm run preview` — локальный просмотр собранной версии
- `npm test` — тесты (Vitest)

## Переменные окружения

Переменные клиента должны начинаться с `VITE_` и читаются через `import.meta.env`.

```
VITE_API_URL='http://localhost:5000/'
```
