const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  UserSelectMenuBuilder,
  ComponentType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('❌ Đá một người khỏi voice hiện tại'),

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

    // Danh sách người có thể kick
    const members = voiceChannel.members.filter(m => !m.user.bot && m.id !== member.id);

    if (members.size === 0) {
      return interaction.reply({
        content: '❌ Không có ai để kick trong voice này (ngoài bạn và bot)!',
        ephemeral: true
      });
    }

    // Gửi select menu
    const select = new UserSelectMenuBuilder()
      .setCustomId('kick_user_select')
      .setPlaceholder('Chọn người để kick khỏi voice')
      .setMinValues(1)
      .setMaxValues(1);

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({
      content: '🔽 Chọn người bạn muốn **kick** khỏi voice:',
      components: [row],
      ephemeral: true
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.UserSelect,
      time: 15_000,
      max: 1,
      filter: i => i.user.id === interaction.user.id
    });

    collector.on('collect', async selectInteraction => {
      const targetId = selectInteraction.values[0];
      const targetMember = voiceChannel.members.get(targetId);

      if (!targetMember) {
        return selectInteraction.update({
          content: '❌ Người này không còn trong voice!',
          components: []
        });
      }

      const owner = voiceChannel.members.find(m =>
        voiceChannel.permissionsFor(m).has(PermissionFlagsBits.ManageChannels)
      );

      if (owner?.id === targetId) {
        return selectInteraction.update({
          content: '❌ Bạn không thể kick chủ phòng!',
          components: []
        });
      }

      await targetMember.voice.disconnect();

      await selectInteraction.update({
        content: `❌ Đã kick <@${targetId}> khỏi voice chat.`,
        components: []
      });
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({
          content: '⏱️ Hết thời gian chọn người để kick.',
          components: []
        });
      }
    });
  }
};
