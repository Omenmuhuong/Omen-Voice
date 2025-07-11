// === 🌐 Web server mở port sớm để tránh Render timeout ===
const express = require('express');
const app = express();

app.get('/', (req, res) => res.status(200).send('💖 Bot voice is alive!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server is running on port ${PORT}`);
});

// === 📦 Phần Discord bot ===
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// === 🧠 Khởi tạo collection lệnh, nút và modal ===
client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();

// === 📂 Load lệnh Slash ===
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// === 📂 Load buttons ===
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
for (const file of buttonFiles) {
  const button = require(`./buttons/${file}`);
  if (button.id && button.execute) {
    client.buttons.set(button.id, button);
  }
}

// === 📂 Load modals ===
const modalFiles = fs.readdirSync('./modals').filter(file => file.endsWith('.js'));
for (const file of modalFiles) {
  const modal = require(`./modals/${file}`);
  if (modal.id && modal.execute) {
    client.modals.set(modal.id, modal);
  }
}

// === ⚡ Xử lý tương tác ===
client.on(Events.InteractionCreate, async interaction => {
  try {
    // 👉 Slash command
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      console.log(`📩 Slash command: /${interaction.commandName} từ ${interaction.user.tag}`);
      await command.execute(interaction);
    }

    // 👉 Button
    else if (interaction.isButton()) {
      const key = interaction.customId.split('_')[1];
      const button = client.buttons.get(key);
      if (!button) return;
      console.log(`🔘 Button: ${interaction.customId} từ ${interaction.user.tag}`);
      await button.execute(interaction);
    }

    // 👉 Modal
    else if (interaction.isModalSubmit()) {
      const key = interaction.customId.split('_')[0];
      const modal = client.modals.get(key);
      if (!modal) return;
      console.log(`📋 Modal: ${interaction.customId} từ ${interaction.user.tag}`);
      await modal.execute(interaction);
    }

  } catch (err) {
    console.error('❌ Lỗi khi xử lý interaction:', err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ Đã xảy ra lỗi.', ephemeral: true }).catch(() => {});
    }
  }
});

// === 🔊 Sự kiện voiceStateUpdate ===
const voiceEvent = require('./events/voiceStateUpdate');
client.on(Events.VoiceStateUpdate, voiceEvent.execute);

// === ✅ Khi bot online ===
client.once(Events.ClientReady, () => {
  console.log(`✅ Bot đã sẵn sàng với tên: ${client.user.tag}`);
});

// === 🔐 Đăng nhập ===
client.login(process.env.TOKEN);

// === 🛡️ Auto restart khi crash ===
process.on('unhandledRejection', reason => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});
process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
