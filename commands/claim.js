const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('👑 Nhận quyền làm chủ kênh voice hiện tại'),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    // ❌ Không ở trong voice chat
    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Bạn đang không trong một voice chat!',
        ephemeral: true
      });
    }

    // Tìm thành viên trong kênh có quyền ManageChannels
    const currentOwner = voiceChannel.members.find(m =>
      voiceChannel.permissionsFor(m).has(PermissionFlagsBits.ManageChannels)
    );

    // ✅ Nếu chưa có chủ phòng
    if (!currentOwner) {
      await voiceChannel.permissionOverwrites.edit(member.id, {
        ManageChannels: true
      });

      return interaction.reply({
        content: `👑 Bạn đã trở thành **chủ phòng** của ${voiceChannel.name}`,
        ephemeral: true
      });
    }

    // ❌ Đã có chủ phòng
    if (currentOwner.id === member.id) {
      return interaction.reply({
        content: `✅ Bạn **đã là** chủ phòng rồi!`,
        ephemeral: true
      });
    } else {
      return interaction.reply({
        content: `❌ Chủ phòng hiện tại vẫn đang trong kênh: **${currentOwner.user.tag}**`,
        ephemeral: true
      });
    }
  }
};
