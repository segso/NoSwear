const { MessageEmbed } = require('discord.js');

function createMuteEmbed(language, user, type, timeout) {
  let description = language.embed.muted_description;

  if (type) {
    description = language.embed.unmuted_description;
  } else {
    description = description.replace("%SECONDS%", timeout/1000);
  }

  description = description.replace("%USER%", user);

  const embed = new MessageEmbed()
    .setColor("#900000")
    .setDescription(description)
    .setTimestamp();

  return embed;
}

module.exports = createMuteEmbed;