const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('private')
    .setDescription('🔒 Khoá kênh voice chat, không cho người khác vào'),

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
      // Khoá @everyone không cho connect
      await voiceChannel.permissionOverwrites.edit(
        voiceChannel.guild.roles.everyone,
        { Connect: false }
      );

      await interaction.reply({
        content: `🔒 Kênh **${voiceChannel.name}** đã được khoá, người khác không thể vào.`,
        ephemeral: false
      });
    } catch (err) {
      console.error('Lỗi khi khoá kênh:', err);
      await interaction.reply({
        content: '❌ Có lỗi xảy ra khi khoá kênh!',
        ephemeral: true
      });
    }
  }
};
