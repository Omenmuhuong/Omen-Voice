// events/interactionCreate.js

const cooldowns = new Map();

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const userId = interaction.user.id;
  const now = Date.now();
  const cooldownKey = `${interaction.commandName}_${userId}`;

  // Nếu user chưa từng xài lệnh này → khởi tạo mảng thời gian
  if (!cooldowns.has(cooldownKey)) {
    cooldowns.set(cooldownKey, []);
  }

  const timestamps = cooldowns.get(cooldownKey);

  // Xoá các lần gọi cũ hơn 5 giây
  const recentTimestamps = timestamps.filter(t => now - t < 5000);
  cooldowns.set(cooldownKey, recentTimestamps);

  if (recentTimestamps.length >= 3) {
    const lastTime = recentTimestamps[recentTimestamps.length - 1];
    const timeLeft = 10000 - (now - lastTime);
    if (timeLeft > 0) {
      return interaction.reply({
        content: `⏳ Bạn đang thao tác quá nhanh, vui lòng chờ **${Math.ceil(timeLeft / 1000)} giây** trước khi dùng lại.`,
        ephemeral: true,
      });
    }
  }

  // Lưu timestamp lần dùng mới
  cooldowns.get(cooldownKey).push(now);

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('❌ Lỗi khi thực thi lệnh:', error);
    await interaction.reply({
      content: '❌ Đã xảy ra lỗi khi thực thi lệnh.',
      ephemeral: true,
    });
  }
};
