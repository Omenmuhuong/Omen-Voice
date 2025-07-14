const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("💖 Bot voice is alive!"));

// 🔧 CHỈ DÙNG CỔNG 3000 (Replit sẽ tự ánh xạ)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌐 Web server is running on port ${PORT}`);
});

// 📦 Phần chính của bot
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();

// === Load commands
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// === Interaction handler
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
    } else if (interaction.isButton()) {
      const buttonId = interaction.customId.split("_")[1];
      const button = client.buttons.get(buttonId);
      if (button) await button.execute(interaction);
    } else if (interaction.isModalSubmit()) {
      const modalId = interaction.customId.split("_").slice(0, 2).join("_");
      const modal = client.modals.get(modalId);
      if (modal) await modal.execute(interaction);
    }
  } catch (err) {
    console.error("❌ Lỗi xử lý tương tác:", err);
    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Lỗi không xác định.",
        ephemeral: true,
      });
    }
  }
});

// === Voice event
const voiceEvent = require("./events/voiceStateUpdate");
client.on(Events.VoiceStateUpdate, voiceEvent.execute);

// === Ready
client.once(Events.ClientReady, (c) => {
  console.log(`✅ Bot đã sẵn sàng với tên: ${c.user.tag}`);
});

// === Login
client.login(process.env.TOKEN);

// === Bắt lỗi ngoài ý muốn
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
