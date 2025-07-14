const fs = require("fs");
const path = require("path");
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  UserSelectMenuBuilder,
  ComponentType,
} = require("discord.js");

const tempPath = path.join(__dirname, "../data/tempChannels.json");

function loadTempChannels() {
  if (!fs.existsSync(tempPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(tempPath, "utf8"));
  } catch (err) {
    console.error("❌ Lỗi khi đọc tempChannels.json:", err);
    return [];
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("⛔ Cấm một người khỏi voice hiện tại"),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    // ❌ Không ở trong voice chat
    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ Bạn đang không trong một voice chat!",
        ephemeral: true,
      });
    }

    // ❌ Không phải kênh tạm
    const tempChannels = loadTempChannels();
    if (!tempChannels.includes(voiceChannel.id)) {
      return interaction.reply({
        content: "❌ Lệnh này chỉ dùng trong kênh voice tạm!",
        ephemeral: true,
      });
    }

    // Danh sách người có thể ban
    const members = voiceChannel.members.filter(
      (m) => !m.user.bot && m.id !== member.id,
    );
    if (members.size === 0) {
      return interaction.reply({
        content: "❌ Không có ai để ban trong voice này (ngoài bạn và bot)!",
        ephemeral: true,
      });
    }

    // Gửi select menu để chọn người
    const select = new UserSelectMenuBuilder()
      .setCustomId("ban_user_select")
      .setPlaceholder("Chọn người để ban khỏi voice")
      .setMinValues(1)
      .setMaxValues(1);

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({
      content: "🔽 Chọn người bạn muốn ban khỏi voice:",
      components: [row],
      ephemeral: true,
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.UserSelect,
      time: 15_000,
      max: 1,
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on("collect", async (selectInteraction) => {
      const targetId = selectInteraction.values[0];
      const targetMember = voiceChannel.members.get(targetId);

      if (!targetMember) {
        return selectInteraction.update({
          content: "❌ Người này không còn trong voice!",
          components: [],
        });
      }

      const owner = voiceChannel.members.find((m) =>
        voiceChannel.permissionsFor(m).has(PermissionFlagsBits.ManageChannels),
      );

      if (owner?.id === targetId) {
        return selectInteraction.update({
          content: "❌ Bạn không thể ban chủ phòng!",
          components: [],
        });
      }

      await voiceChannel.permissionOverwrites.edit(targetId, {
        Connect: false,
        ViewChannel: false,
      });

      await selectInteraction.update({
        content: `⛔ Đã ban <@${targetId}> khỏi voice chat.`,
        components: [],
      });
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.editReply({
          content: "⏱️ Hết thời gian chọn người để ban.",
          components: [],
        });
      }
    });
  },
};
