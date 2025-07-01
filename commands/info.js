// 📁 commands/info.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('📌 Hướng dẫn sử dụng bot'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🛠️ Setup server của bạn nào!')
      .setColor(0x00bfff)
      .setDescription(`
📌 **Lệnh điều khiển kênh của bạn:**
> 🔧 \`/setup couple (Tên voice)\` – Setup voice đôi (ẩn khi có 2 người)
> 🧱 \`/setup tempvoice (Tên voice)\` – Setup tempvoice bình thường
> ⛔ \`/ban @user\` – Cấm user khỏi voice
> ❌ \`/kick @user\` – Kick user khỏi voice
> 🚩 \`/claim\` – Trở thành chủ phòng nếu chủ cũ rời
> 🔢 \`/limit\` – Giới hạn số người trong voice
> 👁️ \`/show\` – Hiện kênh
> 🔒 \`/private\` – Chuyển kênh thành riêng tư
> 🌐 \`/public\` – Chuyển kênh thành công khai
> 👻 \`/hide\` – Ẩn kênh
> ✏️ \`/rename\` – Đổi tên kênh

🔐 **Chỉ quản trị viên có thể dùng:**
> 🛠️ \`/setup\`

🌐 **Thông tin bot:**
> 🤖 Bot made by: **Edater Hater**
> 🏠 Server: [Discord Support](https://discord.gg/3gP8aKHvPv)

❤️ Cảm ơn vì đã chọn bot của tui!\nRất cảm kích đấy!
      `);

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
