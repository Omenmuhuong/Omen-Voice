const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('public')
    .setDescription('🔓 Mở khoá kênh voice chat, cho phép mọi người vào'),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice?.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Bạn đang không trong một kênh voice chat.',
        ephemeral: true
      });
    }

    try {
      // Mở Connect cho everyone
      await voiceChannel.permissionOverwrites.edit(
        voiceChannel.guild.roles.everyone,
        { Connect: true }
      );

      await interaction.reply({
        content: `🔓 Kênh **${voiceChannel.name}** đã được mở.`,
        ephemeral: true
      });
    } catch (err) {
      console.error('Lỗi khi mở khoá kênh:', err);
      await interaction.reply({
        content: '❌ Có lỗi xảy ra khi mở khoá kênh!',
        ephemeral: true
      });
    }
  }
};
