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
  client.buttons.set(button.data, button);
}

// === 📦 Tải modals ===
const modalFiles = fs.readdirSync('./modals').filter(file => file.endsWith('.js'));
for (const file of modalFiles) {
  const modal = require(`./modals/${file}`);
  client.modals.set(modal.data, modal);
}

// === ⚡️ Lắng nghe tương tác người dùng ===
client.on(Events.InteractionCreate, async interaction => {
  // 🟦 Nút bấm
  if (interaction.isButton()) {
    const buttonKey = interaction.customId.split('_')[1];
    const button = client.buttons.get(buttonKey);
    if (!button) return;

    try {
      await button.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Có lỗi khi xử lý nút.', ephemeral: true });
    }
    return;
  }

  // 🟨 Modal (biểu mẫu)
  if (interaction.isModalSubmit()) {
    const modalKey = interaction.customId.split('_')[0];
    const modal = client.modals.get(modalKey);
    if (!modal) return;

    try {
      await modal.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Có lỗi khi xử lý biểu mẫu.', ephemeral: true });
    }
    return;
  }

  // 🟩 Slash command
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Có lỗi khi xử lý lệnh.', ephemeral: true });
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
  process.exit(1); // Render sẽ restart
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1); // Render sẽ restart
});

// === 🌐 Giữ bot hoạt động 24/7 trên Render ===
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Web server is running'));
