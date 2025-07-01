module.exports = {
  data: 'owner',
  async execute(interaction) {
    const channelId = interaction.customId.split('_')[2];
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel) {
      return interaction.reply({ content: '❌ Không tìm thấy kênh.', ephemeral: true });
    }

    const members = [...channel.members.values()].filter(m => m.id !== interaction.user.id);

    if (members.length === 0) {
      return interaction.reply({ content: '❌ Không có ai khác trong kênh để chuyển quyền.', ephemeral: true });
    }

    const newOwner = members[0]; // chọn người đầu tiên
    try {
      await channel.permissionOverwrites.edit(newOwner.id, {
        ManageChannels: true,
      });

      await channel.permissionOverwrites.edit(interaction.user.id, {
        ManageChannels: false,
      });

      await interaction.reply({
        content: `👑 Đã chuyển quyền chủ kênh cho <@${newOwner.id}>.`,
        ephemeral: true,
      });
    } catch (err) {
      console.error('❌ Lỗi khi đổi chủ kênh:', err);
      await interaction.reply({ content: '❌ Không thể chuyển quyền.', ephemeral: true });
    }
  }
};
