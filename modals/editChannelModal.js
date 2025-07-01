module.exports = {
  data: 'editChannelModal',
  async execute(interaction) {
    const channelId = interaction.customId.split('_')[1];
    const newName = interaction.fields.getTextInputValue('newChannelName');
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel) {
      return interaction.reply({ content: '❌ Không tìm thấy kênh.', ephemeral: true });
    }

    try {
      await channel.setName(newName);
      await interaction.reply({ content: `✅ Đã đổi tên kênh thành **${newName}**`, ephemeral: true });
    } catch (err) {
      console.error('❌ Lỗi khi đổi tên kênh:', err);
      await interaction.reply({ content: '❌ Không thể đổi tên kênh.', ephemeral: true });
    }
  }
};
