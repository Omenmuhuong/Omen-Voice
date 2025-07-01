const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(`[⚠️] Lệnh "${file}" bị thiếu 'data' hoặc 'execute'.`);
  }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔁 Đang cập nhật lệnh slash (global)...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // GLOBAL
      { body: commands },
    );

    console.log('✅ Đã cập nhật lệnh slash toàn cục!');
  } catch (error) {
    console.error('❌ Lỗi khi deploy:', error);
  }
})();
