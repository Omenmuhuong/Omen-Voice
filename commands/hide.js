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
    .setName("hide")
    .setDescription("🙈 Ẩn kênh voice chat của bạn khỏi mọi người"),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice?.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ Bạn đang không trong một kênh voice chat.",
        ephemeral: true,
      });
    }

    const tempChannels = loadTempChannels();
    if (!tempChannels.includes(voiceChannel.id)) {
      return interaction.reply({
        content: "❌ Lệnh này chỉ dùng trong kênh voice tạm!",
        ephemeral: true,
      });
    }

    try {
      await voiceChannel.permissionOverwrites.edit(
        voiceChannel.guild.roles.everyone,
        { ViewChannel: false },
      );

      await interaction.reply({
        content: `🙈 Kênh **${voiceChannel.name}** đã được ẩn khỏi mọi người.`,
        ephemeral: false,
      });
    } catch (err) {
      console.error("❌ Lỗi khi ẩn kênh:", err);
      await interaction.reply({
        content: "❌ Có lỗi xảy ra khi ẩn kênh!",
        ephemeral: true,
      });
    }
  },
};
