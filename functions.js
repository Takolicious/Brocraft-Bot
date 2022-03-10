
function hasMedia(param) {
    param = param.toJSON()
    return (param.attachments.length > 0 || param.embeds.length > 0 || param.stickers.length > 0 ? true : false)

}

function isEntity(param) {
    if (param !== undefined && param.includes("%entity.")) return 1
    if (param !== undefined && !param.includes("%entity.")) return 2

    return 0
}

function nameCorrection(str) {
    str = str
        .replace("%entity.", "")
        .replace(".name", "")
        .replace("_", " ")
        .replace("_v2", "");
    var splitStr = str.toLowerCase().split(" ");
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] =
            splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
}

module.exports = { hasMedia, isEntity, nameCorrection }