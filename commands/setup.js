// 📁 commands/setup.js

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/voices.json');

function loadData() {
  if (!fs.existsSync(dataPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (err) {
    console.error('❌ Lỗi khi đọc voices.json:', err);
    return {};
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Lỗi khi ghi voices.json:', err);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('🛠 Thiết lập kênh gốc cho hệ thống voice')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub
        .setName('tempvoice')
        .setDescription('Thiết lập kênh gốc để tạo tempvoice')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Chọn kênh voice gốc')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('couple')
        .setDescription('Thiết lập kênh gốc để tạo double voice')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Chọn kênh voice gốc')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guild.id;

    const data = loadData();
    if (!data[guildId]) data[guildId] = {};

    if (sub === 'tempvoice') {
      data[guildId].tempvoice = channel.id;
      saveData(data);
      return interaction.reply({
        content: `✅ Đã thiết lập <#${channel.id}> làm kênh gốc **Temp Voice**.`,
        ephemeral: true,
      });
    }

    if (sub === 'couple') {
      data[guildId].couple = channel.id;
      saveData(data);
      return interaction.reply({
        content: `💖 Đã thiết lập <#${channel.id}> làm kênh gốc **Couple Voice**.`,
        ephemeral: true,
      });
    }
  }
};
