module.exports = {
  data: 'private',  // Phải đúng với phần [1] khi split customId

  async execute(interaction) {
    // Lấy channelId từ phần thứ 3 của customId
    const channelId = interaction.customId.split('_')[2];
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel) {
      return interaction.reply({ content: '❌ Không tìm thấy kênh.', ephemeral: true });
    }

    try {
      // Lấy quyền hiện tại của @everyone cho kênh này
      const perms = channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id);
      // Kiểm tra xem có đang private (deny Connect)
      const isPrivate = perms?.deny.has('Connect');

      // Đảo trạng thái Connect
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        Connect: isPrivate ? true : false,
      });

      await interaction.reply({
        content: isPrivate
          ? '🌐 Kênh đã mở lại cho @everyone.'
          : '🔒 Kênh đã chuyển sang chế độ **Private**.',
        ephemeral: true,
      });
    } catch (err) {
      console.error('❌ Lỗi khi đổi chế độ Private:', err);
      await interaction.reply({ content: '❌ Không thể cập nhật quyền.', ephemeral: true });
    }
  }
};
