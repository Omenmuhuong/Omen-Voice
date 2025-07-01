const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDescription('✏️ Đổi tên kênh voice của bạn')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Tên mới cho kênh voice')
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice?.channel;
    const newName = interaction.options.getString('name');

    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Bạn đang không trong một kênh voice chat.',
        ephemeral: true
      });
    }

    try {
      await voiceChannel.setName(newName);

      await interaction.reply({
        content: `✅ Đã đổi tên kênh thành: **${newName}**`,
        ephemeral: true
      });
    } catch (err) {
      console.error('Lỗi khi đổi tên kênh:', err);
      await interaction.reply({
        content: '❌ Có lỗi xảy ra khi đổi tên kênh!',
        ephemeral: true
      });
    }
  }
};
