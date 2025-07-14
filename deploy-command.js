const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Đệ quy lấy tất cả file lệnh (trong cả subfolder nếu có)
const getAllCommandFiles = (dirPath) => {
  let results = [];
  const list = fs.readdirSync(dirPath);

  for (const file of list) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllCommandFiles(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  }

  return results;
};

const commandFiles = getAllCommandFiles(commandsPath);

for (const file of commandFiles) {
  const command = require(file);

  if (!command.data || typeof command.data.toJSON !== 'function') {
    console.warn(`[⚠️] Lệnh bị lỗi ở file "${file}": thiếu hoặc sai định dạng 'data'`);
    continue;
  }

  if (typeof command.execute !== 'function') {
    console.warn(`[⚠️] Lệnh ở "${file}" thiếu hàm 'execute'`);
    continue;
  }

  commands.push(command.data.toJSON());
  console.log(`✅ Đã thêm lệnh: ${command.data.name}`);
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔁 Đang cập nhật lệnh slash (global)...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('✅ Đã cập nhật lệnh slash toàn cục!');
  } catch (error) {
    console.error('❌ Lỗi khi deploy:', error);
  }
})();
