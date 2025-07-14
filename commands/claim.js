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
    .setName("claim")
    .setDescription("👑 Nhận quyền làm chủ kênh voice hiện tại"),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ Bạn đang không trong một voice chat!",
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

    const currentOwner = voiceChannel.members.find((m) =>
      voiceChannel.permissionsFor(m).has(PermissionFlagsBits.ManageChannels),
    );

    if (!currentOwner) {
      await voiceChannel.permissionOverwrites.edit(member.id, {
        ManageChannels: true,
      });

      return interaction.reply({
        content: `👑 Bạn đã trở thành **chủ phòng** của ${voiceChannel.name}`,
        ephemeral: true,
      });
    }

    if (currentOwner.id === member.id) {
      return interaction.reply({
        content: `✅ Bạn **đã là** chủ phòng rồi!`,
        ephemeral: true,
      });
    } else {
      return interaction.reply({
        content: `❌ Chủ phòng hiện tại vẫn đang trong kênh: **${currentOwner.user.tag}**`,
        ephemeral: true,
      });
    }
  },
};
