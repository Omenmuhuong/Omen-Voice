const fs = require('fs');
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');

const dataPath = path.join(__dirname, '../data/voices.json');
const tempPath = path.join(__dirname, '../data/tempChannels.json');

// ==== 📥 Đọc dữ liệu cấu hình ====
function loadData() {
  if (!fs.existsSync(dataPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (err) {
    console.error('❌ Lỗi khi đọc voices.json:', err);
    return {};
  }
}

// ==== 📥 Đọc danh sách kênh tạm (bằng ID) ====
function loadTempChannels() {
  if (!fs.existsSync(tempPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(tempPath, 'utf8'));
  } catch (err) {
    console.error('❌ Lỗi khi đọc tempChannels.json:', err);
    return [];
  }
}

// ==== 💾 Ghi danh sách kênh tạm ====
function saveTempChannels(channels) {
  fs.writeFileSync(tempPath, JSON.stringify(channels, null, 2));
}

module.exports = {
  name: 'voiceStateUpdate',

  async execute(oldState, newState) {
    const member = newState.member || oldState.member;
    const guild = member.guild;
    const data = loadData();
    const config = data[guild.id];
    if (!config) return;

    const joinedChannel = newState.channel;

    // ==== ✅ TẠO KÊNH TEMP VOICE ====
    if (
      joinedChannel &&
      joinedChannel.name === config.tempvoice
    ) {
      try {
        const createdChannel = await guild.channels.create({
          name: `Phòng của ${member.user.username}`,
          type: 2,
          parent: joinedChannel.parent,
          permissionOverwrites: [
            { id: guild.id, allow: ['Connect', 'ViewChannel'] },
            { id: member.id, allow: ['ManageChannels'] },
          ],
        });

        await member.voice.setChannel(createdChannel);
        console.log(`🎤 Đã tạo kênh tạm: ${createdChannel.name}`);

        // 👉 Ghi lại ID kênh tạm để xoá bằng ID sau này
        const tempChannels = loadTempChannels();
        tempChannels.push(createdChannel.id);
        saveTempChannels(tempChannels);

        // === 📤 GỬI DASHBOARD CHO TEMP VOICE ===
        const embed = new EmbedBuilder()
          .setTitle(`${member.user.username}'s Trò chuyện riêng tư`)
          .setDescription(`Chào mừng <@${member.id}> đến với cuộc trò chuyện riêng tư của bạn!\n\nChỉ những người dùng được kết nối với kênh của bạn mới thấy cuộc trò chuyện này và nó sẽ bị **xóa** sau khi mọi người rời đi.\n\n**Kênh của bạn là:**\n🌐 Public\n👁 Visible\n\nSử dụng các nút bên dưới để chỉnh sửa kênh.`)
          .setColor(0x2b2d31);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`voice_private_${createdChannel.id}`)
            .setLabel('🔒 Private')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`voice_hide_${createdChannel.id}`)
            .setLabel('👁 Hide')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`voice_edit_${createdChannel.id}`)
            .setLabel('✏️ Chỉnh sửa kênh')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`voice_owner_${createdChannel.id}`)
            .setLabel('👑 Change Owner')
            .setStyle(ButtonStyle.Success)
        );

        try {
          if ('send' in createdChannel) {
            await createdChannel.send({ embeds: [embed], components: [row] });
            console.log(`📩 Đã gửi dashboard điều khiển vào voice: ${createdChannel.name}`);
          } else {
            console.warn('⚠️ Voice channel này không hỗ trợ gửi tin nhắn.');
          }
        } catch (err) {
          console.error('❌ Không thể gửi dashboard vào voice:', err.message);
        }

      } catch (err) {
        console.error('❌ Lỗi khi tạo kênh temp voice:', err);
      }
    }

    // ==== ✅ TẠO KÊNH COUPLE VOICE ====
    if (
      joinedChannel &&
      joinedChannel.name === config.couple
    ) {
      try {
        const createdChannel = await guild.channels.create({
          name: 'Double room 😪',
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

        const guideEmbed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setTitle(`🔒 **Double room** của **${member.user.username}** vừa được tạo!`)
          .setDescription(`\n👥 Phòng sẽ **tự ẩn khi có đủ 2 người**.\n🎵 Nếu muốn gọi bot nhạc, hãy **vào trước rồi gọi bot vào sau**.\n\n✨ **Have fun!**`)
          .setTimestamp();

        try {
          if ('send' in createdChannel) {
            await createdChannel.send({ embeds: [guideEmbed] });
          }
        } catch (err) {
          console.warn('⚠️ Không gửi được hướng dẫn vào voice channel:', err.message);
        }

      } catch (err) {
        console.error('❌ Lỗi khi tạo kênh couple voice:', err);
      }
    }

    // ==== ✅ XOÁ KÊNH TEMP/COUPLE KHI TRỐNG (DÙ ĐỔI TÊN) ====
    if (
      oldState.channel &&
      oldState.channel.members.size === 0 &&
      oldState.channel.deletable
    ) {
      const tempChannels = loadTempChannels();
      const index = tempChannels.indexOf(oldState.channel.id);
      const isCouple = oldState.channel.name === 'Double room 😪';

      if (index !== -1 || isCouple) {
        try {
          await oldState.channel.delete();
          console.log(`🗑️ Đã xoá kênh voice: ${oldState.channel.name}`);

          // Nếu là kênh tạm thì xoá ID khỏi danh sách
          if (index !== -1) {
            tempChannels.splice(index, 1);
            saveTempChannels(tempChannels);
          }

        } catch (err) {
          console.error('❌ Không thể xoá kênh:', err);
        }
      }
    }

    // ==== ✅ ẨN/HIỆN CHỈ VỚI COUPLE ====
    const currentChannel = newState.channel || oldState.channel;

    if (
      currentChannel &&
      currentChannel.name === 'Double room 😪'
    ) {
      const memberCount = currentChannel.members.size;

      try {
        if (memberCount === 2) {
          await currentChannel.permissionOverwrites.edit(guild.roles.everyone, {
            ViewChannel: false,
          });
          console.log(`👀 Ẩn ${currentChannel.name} khỏi @everyone (đủ 2 người)`);
        } else if (memberCount <= 1) {
          await currentChannel.permissionOverwrites.edit(guild.roles.everyone, {
            ViewChannel: true,
          });
          console.log(`👁️ Hiện lại ${currentChannel.name} cho @everyone (còn ${memberCount} người)`);
        }
      } catch (err) {
        console.error('❌ Lỗi khi cập nhật quyền ẩn/hiện:', err);
      }
    }
  }
};
