// 📁 commands/ping.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  // Đây là phần metadata để đăng ký slash command
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('📶 Kiểm tra xem bot còn sống không'),

  // Đây là hàm xử lý khi user dùng lệnh
  async execute(interaction) {
    try {
      await interaction.reply('👋 Gọi cái giề, đang ngủ 😪');
    } catch (err) {
      console.error('❌ Lỗi khi xử lý lệnh /ping:', err);
      await interaction.reply({ content: '🚨 Bot bị lỗi không trả lời được!', ephemeral: true });
    }
  }
};
