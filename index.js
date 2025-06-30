const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Lắng nghe lệnh slash
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ Có lỗi khi xử lý lệnh.', ephemeral: true });
  }
});

// Load sự kiện voice
const voiceEvent = require('./events/voiceStateUpdate');
client.on(Events.VoiceStateUpdate, voiceEvent.execute);

// Khi bot ready
client.once(Events.ClientReady, client => {
  console.log(`✅ Bot đã sẵn sàng với tên: ${client.user.tag}`);
});

// Khởi động bot
client.login(process.env.TOKEN);
