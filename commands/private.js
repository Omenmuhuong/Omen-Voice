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
    .setName("private")
    .setDescription("🔒 Khoá kênh voice chat, không cho người khác vào"),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice?.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ Bạn đang không trong một kênh voice chat.",
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

    try {
      // Khoá @everyone không cho connect
      await voiceChannel.permissionOverwrites.edit(
        voiceChannel.guild.roles.everyone,
        { Connect: false },
      );

      await interaction.reply({
        content: `🔒 Kênh **${voiceChannel.name}** đã được khoá, người khác không thể vào.`,
        ephemeral: false,
      });
    } catch (err) {
      console.error("Lỗi khi khoá kênh:", err);
      await interaction.reply({
        content: "❌ Có lỗi xảy ra khi khoá kênh!",
        ephemeral: true,
      });
    }
  },
};
