const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: 'edit',
  async execute(interaction) {
    const channelId = interaction.customId.split('_')[2];

    const modal = new ModalBuilder()
      .setCustomId(`editChannelModal_${channelId}`)
      .setTitle('📝 Chỉnh sửa tên kênh');

    const input = new TextInputBuilder()
      .setCustomId('newChannelName')
      .setLabel('Nhập tên kênh mới')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
};
