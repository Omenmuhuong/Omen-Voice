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
    .setName("rename")
    .setDescription("✏️ Đổi tên kênh voice của bạn")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Tên mới cho kênh voice")
        .setRequired(true),
    ),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice?.channel;
    const newName = interaction.options.getString("name");

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ Bạn đang không trong một kênh voice chat.",
        ephemeral: true,
      });
    }

    // ✅ Giới hạn trong kênh voice tạm
    const tempChannels = loadTempChannels();
    if (!tempChannels.includes(voiceChannel.id)) {
      return interaction.reply({
        content: "❌ Lệnh này chỉ dùng trong kênh voice tạm!",
        ephemeral: true,
      });
    }

    // ✅ Kiểm tra quyền chủ phòng
    const hasManagePermission = voiceChannel
      .permissionsFor(member)
      .has(PermissionFlagsBits.ManageChannels);

    if (!hasManagePermission) {
      return interaction.reply({
        content: "❌ Bạn không phải là chủ phòng!",
        ephemeral: true,
      });
    }

    try {
      await voiceChannel.setName(newName);

      await interaction.reply({
        content: `✅ Đã đổi tên kênh thành: **${newName}**`,
        ephemeral: false,
      });
    } catch (err) {
      console.error("Lỗi khi đổi tên kênh:", err);
      await interaction.reply({
        content: "❌ Có lỗi xảy ra khi đổi tên kênh!",
        ephemeral: false,
      });
    }
  },
};
