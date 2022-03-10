const bedrock = require("bedrock-protocol");
const { deathMessages } = require("./death_messages.js");
require("dotenv").config();
const chatchannel = process.env.CHANNELID;
const guild = process.env.GUILDID;
const token = process.env.TOKEN;
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const Discord = require("discord.js");
const { isEntity, nameCorrection, hasMedia } = require("./functions.js");
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
  presence: {
    activities: [{
      name: 'on Brocraft',
      type: 'PLAYING'
    }]
  }
});
const fs = require("fs");
const webhooks = new Discord.WebhookClient(
  {
    url: process.env.WEBHOOK,
  },
  {
    allowedMentions: {
      parse: ["users"],
      users: []
    }
  }
);

const prefix = "bc!";

const commands = [];

client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

const CLIENT_ID = "870576516491268096";

client.once("ready", () => {
  console.log("Brocraft bot is now online!");

  const rest = new REST({ version: "9" }).setToken(token);

  (async () => {
    try {
      console.log("Started refreshing application (/) commands.");

      await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: commands,
      });

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  })();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    if (err) console.log(err);

    await interaction.reply({
      content: "An error occurred while executing that command.",
      ephemeral: true,
    });
  }
});

let bot = bedrock.createClient({
  host: process.env.IP,
  port: Number(String(process.env.PORT)),
  username: process.env.ACCOUNTUSERNAME,
  offline: false,
});
bot.on("disconnect", () => {
  bot.reconnect;
});
bot.on("join", () => {
  console.log("On Server");
  console.log(bot.profile);
});
bot.on("text", (packet) => {
  console.log(Object.getOwnPropertyNames(bot.profile));
  if (packet.type == "chat") {
    if (packet.source_name != bot.options.username) {
      if (packet.source_name != undefined) {
        webhooks.send({
          content: packet.message,
          username: packet.source_name,
        });
      } else {
        var tv = client.guilds.cache.get(guild);
        tv.channels.cache.get(chatchannel).send(`${packet.message}`);
      }
    }
  }
  if (packet.type == "translation") {
    const multiplayerMessage = new Discord.MessageEmbed();
    var tv = client.guilds.cache.get(guild);
    console.log(packet);
    if (packet.message == "§e%multiplayer.player.joined") {
      multiplayerMessage.setColor("#80b45c").setDescription(`\`\`\`fix\n${packet.parameters[0]} has joined the game.\`\`\``);
      tv.channels.cache.get(chatchannel).send({ embeds: [multiplayerMessage] });
    }
    if (packet.message == "§e%multiplayer.player.left") {
      multiplayerMessage.setColor("#e02c44").setDescription(`\`\`\`fix\n${packet.parameters[0]} has left the game.\`\`\``);
      tv.channels.cache.get(chatchannel).send({ embeds: [multiplayerMessage] });
    }
    if (String(packet.message).includes("death.")) {
      let deathMessage = deathMessages[packet.message].replace(
        `&1`,
        packet.parameters[0]
      );
      if (isEntity(packet.parameters[1]) == 1) {
        tv.channels.cache
          .get(chatchannel)
          .send(deathMessage.replace("&2", nameCorrection(packet.parameters[1])));
      } else if (isEntity(packet.parameters[1]) == 2) {
        tv.channels.cache.get(chatchannel).send(deathMessage.replace("&2", packet.parameters[1]));
      } else {
        tv.channels.cache.get(chatchannel).send(deathMessage);
      }
    }
  }
});
client.on("messageCreate", (message) => {
  if (message.channel.id == chatchannel) {
    if (message.author.id == client.user.id || message.webhookId) return;
    if (message.content == "" && hasMedia(message)) {
      console.log(`[\x1b[1m\x1b[34m%s\x1b[0m] ${message.author.username}: \x1b[2mSent an attachment...\x1b[0m`, 'Discord');
      bot.queue("command_request", {
        command: `/tellraw @a {"rawtext":[{"text":"§r[§9Discord§r] <${message.author.username}> §7Sent an attatchment..."}]}`,
        origin: {
          size: 0,
          type: 0,
          uuid: "",
          request_id: "",
          player_entity_id: "",
        },
        interval: false,
      });
    }
    else if (message.content != "" && hasMedia(message)) {
      console.log(`[\x1b[1m\x1b[34m%s\x1b[0m] ${message.author.username}: ${message.content}\n \x1b[2m└──── §oSent an attachment...\x1b[0m`, 'Discord')
      bot.queue("command_request", {
        command: `/tellraw @a {"rawtext":[{"text":"§r[§9Discord§r] <Takolicious> text here amogus§7\n└──── §oSent an attachment..."}]}"}]}`,
        origin: {
          size: 0,
          type: 0,
          uuid: "",
          request_id: "",
          player_entity_id: "",
        },
        interval: false,
      });
      return
    }
    else {
      console.log(`[\x1b[1m\x1b[34m%s\x1b[0m] ${message.author.username}: \x1b[2m${message.content}\x1b[0m`, 'Discord');
      console.log(message.attachments)
      bot.queue("command_request", {
        command: `/tellraw @a {"rawtext":[{"text":"§r[§9Discord§r] <${message.author.username}> ${message.content}"}]}`,
        origin: {
          size: 0,
          type: 0,
          uuid: "",
          request_id: "",
          player_entity_id: "",
        },
        interval: false,
      });
      return
    }
  }
});
module.exports = { bot };
client.login(token);
