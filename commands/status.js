const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const { ping } = require("bedrock-protocol");

const embedStatus = new Discord.MessageEmbed().setAuthor({
  name: "Brocraft Server Status",
  iconURL:
    "https://cdn.discordapp.com/attachments/869110993127604244/914825838090944523/Brocraft_S6_logo_1.png",
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("This command pings the server and gets it's status."),
  async execute(interaction) {
    ping({ host: "mc.playbrocraft.ga", port: 25863 })
      .then((res) => {
        embedStatus
          .setColor("#80b45c")
          .setFields({
            name: "__**Brocraft**__",
            value: `\`\`\`properties\nMOTD          : ${res.motd}\nVersion       : ${res.version}\nPlayersOnline : ${res.playersOnline}/${res.playersMax}\`\`\``,
            inline: true,
          })
          .setFooter({
            text: "Server is online.",
            iconURL:
              "https://cdn.discordapp.com/attachments/948023384439136306/948023592455651408/greenthing.png",
          });

        console.log(res);
        interaction.reply({ embeds: [embedStatus] });
      })
      .catch((error) => {
        embedStatus
          .setColor("#e02c44")
          .setFields({
            name: "__**Brocraft**__",
            value: `\`\`\`properties\nMOTD          : -\nVersion       : -\nPlayersOnline : N/A\`\`\``,
            inline: true,
          })
          .setFooter({
            text: "Server is offline.",
            iconURL:
              "https://cdn.discordapp.com/attachments/948023384439136306/948023592229146644/redthing.png",
          });

        console.log(error);
        interaction.reply({ embeds: [embedStatus] });
      });
  },
};
