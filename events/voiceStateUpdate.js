const fs = require("fs");
const path = require("path");
const {
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");

const dataPath = path.join(__dirname, "../data/voices.json");
const tempPath = path.join(__dirname, "../data/tempChannels.json");

// ==== 📥 Đọc dữ liệu cấu hình ====
function loadData() {
  if (!fs.existsSync(dataPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
  } catch (err) {
    console.error("❌ Lỗi khi đọc voices.json:", err);
    return {};
  }
}

// ==== 📥 Đọc danh sách kênh tạm (bằng ID) ====
function loadTempChannels() {
  if (!fs.existsSync(tempPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(tempPath, "utf8"));
  } catch (err) {
    console.error("❌ Lỗi khi đọc tempChannels.json:", err);
    return [];
  }
}

// ==== 💾 Ghi danh sách kênh tạm ====
function saveTempChannels(channels) {
  fs.writeFileSync(tempPath, JSON.stringify(channels, null, 2));
}

module.exports = {
  name: "voiceStateUpdate",

  async execute(oldState, newState) {
    const member = newState.member || oldState.member;
    const guild = member.guild;
    const data = loadData();
    const config = data[guild.id];
    if (!config) return;

    const joinedChannel = newState.channel;

    const isTempVoiceRoot =
      joinedChannel && joinedChannel.id === config.tempvoice;
    const isCoupleVoiceRoot =
      joinedChannel && joinedChannel.id === config.couple;

    // ==== ✅ TẠO KÊNH TEMP VOICE ====
    if (isTempVoiceRoot) {
      try {
        const createdChannel = await guild.channels.create({
          name: `👻| Phòng của ${member.user.username}`,
          type: ChannelType.GuildVoice,
          parent: joinedChannel.parent,
          permissionOverwrites: [
            {
              id: guild.id,
              allow: [
                PermissionsBitField.Flags.Connect,
                PermissionsBitField.Flags.ViewChannel,
              ],
            },
            {
              id: member.id,
              allow: [PermissionsBitField.Flags.ManageChannels],
            },
          ],
        });

        await member.voice.setChannel(createdChannel);
        console.log(`🎤 Đã tạo kênh tạm: ${createdChannel.name}`);

        const tempChannels = loadTempChannels();
        tempChannels.push(createdChannel.id);
        saveTempChannels(tempChannels);
      } catch (err) {
        console.error("❌ Lỗi khi tạo kênh temp voice:", err);
      }
    }

    // ==== ✅ TẠO KÊNH COUPLE ====
    if (isCoupleVoiceRoot) {
      try {
        const createdChannel = await guild.channels.create({
          name: "Double room 😪",
          type: ChannelType.GuildVoice,
          parent: joinedChannel.parent,
          userLimit: 2,
          permissionOverwrites: [
            {
              id: guild.id,
              allow: [
                PermissionsBitField.Flags.Connect,
                PermissionsBitField.Flags.ViewChannel,
              ],
            },
            {
              id: member.id,
              allow: [PermissionsBitField.Flags.ManageChannels],
            },
          ],
        });

        await member.voice.setChannel(createdChannel);
        console.log(`💑 Đã tạo kênh couple: ${createdChannel.name}`);

        const guideEmbed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setTitle(
            `🔒 **Double room** của **${member.user.username}** vừa được tạo!`,
          )
          .setDescription(
            `\n👥 Phòng sẽ **tự ẩn khi có đủ 2 người**.\n🎵 Nếu muốn gọi bot nhạc, hãy **vào trước rồi gọi bot vào sau**.\n\n✨ **Have fun!**`,
          )
          .setTimestamp();

        if ("send" in createdChannel) {
          await createdChannel.send({ embeds: [guideEmbed] });
        }
      } catch (err) {
        console.error("❌ Lỗi khi tạo kênh couple voice:", err);
      }
    }

    // ==== ✅ XOÁ KÊNH TEMP/COUPLE ====
    if (
      oldState.channel &&
      oldState.channel.members.size === 0 &&
      oldState.channel.deletable
    ) {
      const tempChannels = loadTempChannels();
      const index = tempChannels.indexOf(oldState.channel.id);

      const isTemp = index !== -1;
      const isCouple = oldState.channel.name === "Double room 😪";

      if (isTemp || isCouple) {
        try {
          await oldState.channel.delete();
          console.log(`🗑️ Đã xoá kênh voice: ${oldState.channel.name}`);

          if (isTemp) {
            tempChannels.splice(index, 1);
            saveTempChannels(tempChannels);
          }
        } catch (err) {
          console.error("❌ Không thể xoá kênh:", err);
        }
      }
    }

    // ==== ✅ ẨN PHÒNG COUPLE ====
    const currentChannel = newState.channel || oldState.channel;
    if (
      currentChannel &&
      !loadTempChannels().includes(currentChannel.id) &&
      config.couple &&
      currentChannel.parentId ===
        (await guild.channels.fetch(config.couple)).parentId
    ) {
      const memberCount = currentChannel.members.size;

      try {
        if (memberCount === 2) {
          await currentChannel.permissionOverwrites.edit(guild.roles.everyone, {
            ViewChannel: false,
          });
          console.log(
            `👀 Ẩn ${currentChannel.name} khỏi @everyone (đủ 2 người)`,
          );
        } else if (memberCount <= 1) {
          await currentChannel.permissionOverwrites.edit(guild.roles.everyone, {
            ViewChannel: true,
          });
          console.log(
            `👁️ Hiện lại ${currentChannel.name} cho @everyone (còn ${memberCount} người)`,
          );
        }
      } catch (err) {
        console.error("❌ Lỗi khi cập nhật quyền ẩn/hiện:", err);
      }
    }
  },
};
  