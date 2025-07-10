const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('show')
    .setDescription('👁️ Hiện kênh voice chat của bạn cho mọi người'),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice?.channel;

    // Kiểm tra người dùng có trong voice không
    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Bạn đang không trong một kênh voice chat.',
        ephemeral: true
      });
    }

    try {
      await voiceChannel.permissionOverwrites.edit(
        voiceChannel.guild.roles.everyone,
        { ViewChannel: true }
      );

      await interaction.reply({
        content: `✅ Kênh **${voiceChannel.name}** đã được hiển thị lại cho mọi người.`,
        ephemeral: false
      });
    } catch (err) {
      console.error('Lỗi khi hiện kênh:', err);
      await interaction.reply({
        content: '❌ Có lỗi xảy ra khi hiện kênh!',
        ephemeral: true
      });
    }
  }
};
