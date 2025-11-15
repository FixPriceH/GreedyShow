// server.js - Backend для GreedyShow
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(__dirname));

// Хранилище данных (в продакшене используйте базу данных)

const users = new Map();

// Секретный ключ для проверки подписи Telegram (замените на свой bot token)
const BOT_TOKEN = '7625566873:AAEZYKgg9y-po0K8IplhiNnrCim4nsIq4_Y';

// Функция проверки подписи Telegram WebApp
function verifyTelegramWebAppData(initData) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    // Сортируем параметры
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Создаем HMAC
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();
    
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Ошибка проверки подписи:', error);
    return false;
  }
}

// API: Получить данные пользователя
app.post('/api/user/get', (req, res) => {
  const { userId, initData } = req.body;
  
  // Проверяем подпись (в продакшене обязательно!)
  // if (!verifyTelegramWebAppData(initData)) {
  //   return res.status(401).json({ error: 'Неверная подпись' });
  // }
  
  if (!userId) {
    return res.status(400).json({ error: 'userId обязателен' });
  }
  
  let userData = users.get(String(userId));
  
  if (!userData) {
    // Создаем нового пользователя
    userData = {
      userId: userId,
      registeredAt: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      balance: 0,
      walletAddress: null,
      completedPacks: [],
      totalAdsWatched: 0,
      packProgress: {}
    };
    users.set(String(userId), userData);
  } else {
    // Обновляем последний визит
    userData.lastVisit = new Date().toISOString();
  }
  
  res.json({ success: true, data: userData });
});

// API: Обновить данные пользователя
app.post('/api/user/update', (req, res) => {
  const { userId, updates, initData } = req.body;
  
  // Проверяем подпись
  // if (!verifyTelegramWebAppData(initData)) {
  //   return res.status(401).json({ error: 'Неверная подпись' });
  // }
  
  if (!userId) {
    return res.status(400).json({ error: 'userId обязателен' });
  }
  
  let userData = users.get(String(userId));
  
  if (!userData) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  
  // Обновляем данные
  userData = { ...userData, ...updates };
  users.set(String(userId), userData);
  
  res.json({ success: true, data: userData });
});

// API: Обновить баланс
app.post('/api/user/balance', (req, res) => {
  const { userId, balance, initData } = req.body;
  
  if (!userId || balance === undefined) {
    return res.status(400).json({ error: 'userId и balance обязательны' });
  }
  
  let userData = users.get(String(userId));
  
  if (!userData) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  
  userData.balance = balance;
  users.set(String(userId), userData);
  
  res.json({ success: true, balance: userData.balance });
});

// API: Привязать кошелек
app.post('/api/user/wallet', (req, res) => {
  const { userId, walletAddress, initData } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId обязателен' });
  }
  
  let userData = users.get(String(userId));
  
  if (!userData) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  
  userData.walletAddress = walletAddress;
  users.set(String(userId), userData);
  
  res.json({ success: true, walletAddress: userData.walletAddress });
});

// API: Обновить прогресс просмотра
app.post('/api/user/progress', (req, res) => {
  const { userId, packSize, viewed, initData } = req.body;
  
  if (!userId || !packSize) {
    return res.status(400).json({ error: 'userId и packSize обязательны' });
  }
  
  let userData = users.get(String(userId));
  
  if (!userData) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  
  if (!userData.packProgress) {
    userData.packProgress = {};
  }
  
  userData.packProgress[packSize] = viewed;
  users.set(String(userId), userData);
  
  res.json({ success: true, progress: userData.packProgress });
});

// API: Завершить пакет
app.post('/api/user/complete-pack', (req, res) => {
  const { userId, packSize, reward, initData } = req.body;
  
  if (!userId || !packSize || !reward) {
    return res.status(400).json({ error: 'userId, packSize и reward обязательны' });
  }
  
  let userData = users.get(String(userId));
  
  if (!userData) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  
  // Добавляем награду
  userData.balance += reward;
  
  // Добавляем в историю
  userData.completedPacks.push({
    packSize: packSize,
    reward: reward,
    completedAt: new Date().toISOString()
  });
  
  // Очищаем прогресс этого пакета
  if (userData.packProgress) {
    delete userData.packProgress[packSize];
  }
  
  users.set(String(userId), userData);
  
  res.json({ success: true, balance: userData.balance });
});

// Статистика для админа
app.get('/api/admin/stats', (req, res) => {
  const stats = {
    totalUsers: users.size,
    totalBalance: 0,
    totalAdsWatched: 0,
    totalPacksCompleted: 0
  };
  
  users.forEach(user => {
    stats.totalBalance += user.balance;
    stats.totalAdsWatched += user.totalAdsWatched;
    stats.totalPacksCompleted += user.completedPacks.length;
  });
  
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📊 API доступен по адресу http://localhost:${PORT}/api`);
});
