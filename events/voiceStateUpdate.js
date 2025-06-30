const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/voices.json');

function loadData() {
  if (!fs.existsSync(dataPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (err) {
    console.error('❌ Lỗi khi đọc voices.json:', err);
    return {};
  }
}

module.exports = {
  name: 'voiceStateUpdate',

  async execute(oldState, newState) {
    const member = newState.member || oldState.member;
    const guild = member.guild;

    // Nếu không join voice hoặc chỉ chuyển giữa các kênh thì bỏ qua
    if (!newState.channelId || oldState.channelId === newState.channelId) return;

    const data = loadData();
    const config = data[guild.id];
    if (!config) return;

    const joinedChannel = newState.channel;

    // ==== ✅ TẠO KÊNH TEMP VOICE ====
    if (joinedChannel?.name === config.tempvoice) {
      try {
        const createdChannel = await guild.channels.create({
          name: `${member.user.username}'s Room`,
          type: 2, // voice
          parent: joinedChannel.parent,
          permissionOverwrites: [
            { id: guild.id, allow: ['Connect', 'ViewChannel'] },
            { id: member.id, allow: ['ManageChannels'] },
          ],
        });

        await member.voice.setChannel(createdChannel);
        console.log(`🎤 Đã tạo kênh tạm: ${createdChannel.name}`);

        // TODO: gửi dashboard điều khiển vào text channel (sau)
      } catch (err) {
        console.error('❌ Lỗi khi tạo kênh temp voice:', err);
      }
    }

    // ==== ✅ TẠO KÊNH COUPLE VOICE ====
    if (joinedChannel?.name === config.couple) {
      try {
        const createdChannel = await guild.channels.create({
          name: 'Couple room 💑',
          type: 2,
          parent: joinedChannel.parent,
          userLimit: 2,
          permissionOverwrites: [
            { id: guild.id, allow: ['Connect', 'ViewChannel'] },
            { id: member.id, allow: ['ManageChannels'] },
          ],
        });

        await member.voice.setChannel(createdChannel);
        console.log(`💑 Đã tạo kênh couple: ${createdChannel.name}`);

        // TODO: gửi hướng dẫn sử dụng (sau)
      } catch (err) {
        console.error('❌ Lỗi khi tạo kênh couple voice:', err);
      }
    }

    // ==== ✅ XOÁ KÊNH NẾU LÀ KÊNH TẠM VÀ TRỐNG ====
    if (
      oldState.channelId && // Có kênh cũ
      (!newState.channelId || newState.channelId !== oldState.channelId) // Rời hoặc chuyển kênh
    ) {
      const oldChannel = oldState.channel;
      if (
        oldChannel &&
        oldChannel.deletable && // Đảm bảo bot có quyền xoá
        oldChannel.members.size === 0 &&
        (oldChannel.name?.startsWith('Phòng của ') || oldChannel.name === 'Couple room 💑')
      ) {
        try {
          await oldChannel.delete();
          console.log(`🗑️ Đã xoá kênh voice trống: ${oldChannel.name}`);
        } catch (err) {
          console.error('❌ Không thể xoá kênh:', err);
        }
      }
    }
// ==== ✅ ẨN HOẶC HIỆN KÊNH DỰA TRÊN SỐ NGƯỜI ====
    const currentChannel = newState.channel || oldState.channel;

    if (
      currentChannel &&
      (currentChannel.name?.startsWith('Phòng của ') || currentChannel.name === 'Couple room 💑')
    ) {
      const memberCount = currentChannel.members.size;

      try {
        if (memberCount === 2) {
          await currentChannel.permissionOverwrites.edit(guild.roles.everyone, {
            ViewChannel: false
          });
          console.log(`👀 Đã ẩn kênh ${currentChannel.name} khỏi @everyone (đủ 2 người)`);
        } else if (memberCount === 1) {
          await currentChannel.permissionOverwrites.edit(guild.roles.everyone, {
            ViewChannel: true
          });
          console.log(`👁️ Đã hiển thị lại kênh ${currentChannel.name} cho @everyone (còn 1 người)`);
        }
      } catch (err) {
        console.error('❌ Lỗi khi cập nhật quyền ẩn/hiện kênh:', err);
      }
    }
  } // <- ĐÓNG HÀM execute
};   // <- ĐÓNG module.exports