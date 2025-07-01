module.exports = {
  data: 'hide',  // Phải đúng với phần [1] khi split customId

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
      // Kiểm tra xem đang bị ẩn không (deny ViewChannel)
      const isHidden = perms?.deny.has('ViewChannel');

      // Đảo trạng thái ViewChannel
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        ViewChannel: isHidden ? true : false,
      });

      await interaction.reply({
        content: isHidden
          ? '👁️ Đã hiện kênh trở lại cho @everyone.'
          : '🙈 Đã ẩn kênh khỏi @everyone.',
        ephemeral: true,
      });
    } catch (err) {
      console.error('❌ Lỗi khi ẩn/hiện kênh:', err);
      await interaction.reply({ content: '❌ Không thể cập nhật quyền xem kênh.', ephemeral: true });
    }
  }
};
