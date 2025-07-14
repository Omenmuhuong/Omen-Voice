const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const tempPath = path.join(__dirname, "../data/tempChannels.json");

// ==== 📥 Đọc danh sách kênh tạm ====
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
    .setName("limit")
    .setDescription("👥 Giới hạn số người trong voice hiện tại")
    .addIntegerOption((opt) =>
      opt
        .setName("số_lượng")
        .setDescription("Số người tối đa được vào voice (tối đa 99)")
        .setMinValue(1)
        .setMaxValue(99)
        .setRequired(true),
    ),

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

    // 🔐 Giới hạn lệnh chỉ dùng trong kênh voice tạm
    const tempChannels = loadTempChannels();
    if (!tempChannels.includes(voiceChannel.id)) {
      return interaction.reply({
        content: "❌ Lệnh này chỉ dùng trong kênh voice tạm!",
        ephemeral: true,
      });
    }

    // ❌ Không phải chủ phòng
    const hasManagePermission = voiceChannel
      .permissionsFor(member)
      .has(PermissionFlagsBits.ManageChannels);

    if (!hasManagePermission) {
      return interaction.reply({
        content: "❌ Bạn không phải là chủ phòng!",
        ephemeral: true,
      });
    }

    const limit = interaction.options.getInteger("số_lượng");

    try {
      await voiceChannel.setUserLimit(limit);
      return interaction.reply({
        content: `✅ Đã giới hạn voice còn **${limit} người**.`,
        ephemeral: false,
      });
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ Vui lòng nhập số hợp lệ!",
        ephemeral: true,
      });
    }
  },
};
