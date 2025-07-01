// 📁 commands/setup.js

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Đường dẫn file lưu dữ liệu cấu hình
const dataPath = path.join(__dirname, '../data/voices.json');

// Hàm đọc file
function loadData() {
  if (!fs.existsSync(dataPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (err) {
    console.error('❌ Lỗi khi đọc voices.json:', err);
    return {};
  }
}

// Hàm ghi file
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
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild) // ✅ Chỉ quản lý server mới dùng được
    .addSubcommand(sub =>
      sub
        .setName('tempvoice')
        .setDescription('🎤 Thiết lập kênh gốc để tạo tempvoice')
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('Tên kênh voice gốc (phải đúng 100%)')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('couple')
        .setDescription('💑 Thiết lập kênh gốc để tạo couple voice')
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('Tên kênh voice gốc (phải đúng 100%)')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const name = interaction.options.getString('name');
    const guildId = interaction.guild.id;

    const data = loadData();
    if (!data[guildId]) data[guildId] = {};

    if (sub === 'tempvoice') {
      data[guildId].tempvoice = name;
      await interaction.reply({
        content: `✅ Đã thiết lập voice gốc cho tempvoice là: **${name}**`,
        ephemeral: true,
      });
    }

    if (sub === 'couple') {
      data[guildId].couple = name;
      await interaction.reply({
        content: `💖 Đã thiết lập voice gốc cho couple voice là: **${name}**`,
        ephemeral: true,
      });
    }

    saveData(data);
  }
};
