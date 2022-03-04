const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

const listEmbed = new Discord.MessageEmbed().setColor("#8f00ff").setAuthor({
  name: "Brocraft Server Status",
  iconURL:
    "https://cdn.discordapp.com/attachments/869110993127604244/914825838090944523/Brocraft_S6_logo_1.png",
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playerlist")
    .setDescription("List players currently online in the server."),
  async execute(interaction) {
    const { bot } = require("../index.js");
    let playerList = new Promise((resolve, reject) => {
      bot.queue('command_request', {
        command: `/list`,
        origin: {
          size: 0,
          type: 0,
          uuid: "",
          request_id: "",
          player_entity_id: ""
        }
      })
      bot.on('command_output', (packet) => {
        if (!packet.output[0]['message_id'] === 'commands.players.list') {
          reject
        } else {
          resolve(packet.output)
        }
      })
    })

    playerList
      .then((res) => {
        playerNames = res[1]['parameters'][0]
        listEmbed.setFields({
          name: `${res[0]["parameters"][0]}/${res[0]["parameters"][1]} players are online.`,
          value: `\`\`\`\n${playerNames.split(', ').join('\n')}\n\`\`\``,
          inline: true
        })
        console.log(playerNames.split(', ').join('\n'))
        interaction.reply({embeds: [listEmbed]})
      })
      .catch((err) => console.log(err))
  },
};
