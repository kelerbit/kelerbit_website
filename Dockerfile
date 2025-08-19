# Базовый образ Node.js
FROM node:20-alpine

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости (только продакшн, без devDependencies)
RUN npm ci --omit=dev

# Копируем весь код проекта внутрь контейнера
COPY . .

# Переменные окружения
ENV PORT=3000

# Открываем порт
EXPOSE 3000

# Запускаем сервер
CMD ["node", "index.js"]
