// 🌐 Web server cho Render Free (mở port sớm để tránh timeout)
const express = require('express');
const app = express();

app.get('/', (req, res) => res.status(200).send('💖 Bot voice is alive!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server is running on port ${PORT}`);
});

// === 📦 Phần Discord bot phía dưới ===

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// === 🧠 Khởi tạo các bộ sưu tập ===
client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();

// === 📦 Tải lệnh slash ===
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// === 📦 Tải buttons ===
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
for (const file of buttonFiles) {
  const button = require(`./buttons/${file}`);
  client.buttons.set(button.id, button); // 🔧 Sửa: dùng button.id thay vì button.data
}

// === 📦 Tải modals ===
const modalFiles = fs.readdirSync('./modals').filter(file => file.endsWith('.js'));
for (const file of modalFiles) {
  const modal = require(`./modals/${file}`);
  client.modals.set(modal.id, modal); // 🔧 Sửa: dùng modal.id thay vì modal.data
}

// === ⚡️ Lắng nghe tương tác người dùng ===
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isButton()) {
      const buttonKey = interaction.customId.split('_')[1];
      const button = client.buttons.get(buttonKey);
      if (button) await button.execute(interaction);
    }

    else if (interaction.isModalSubmit()) {
      const modalKey = interaction.customId.split('_')[0];
      const modal = client.modals.get(modalKey);
      if (modal) await modal.execute(interaction);
    }

    else if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
    }
  } catch (error) {
    console.error('❌ Lỗi khi xử lý tương tác:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: '❌ Có lỗi xảy ra.', ephemeral: true });
    }
  }
});

// === 🔊 Sự kiện voice ===
const voiceEvent = require('./events/voiceStateUpdate');
client.on(Events.VoiceStateUpdate, voiceEvent.execute);

// === ✅ Khi bot sẵn sàng ===
client.once(Events.ClientReady, client => {
  console.log(`✅ Bot đã sẵn sàng với tên: ${client.user.tag}`);
});

// === 🚀 Đăng nhập ===
client.login(process.env.TOKEN);

// === 🛡️ Bắt lỗi không mong muốn để tự restart ===
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
