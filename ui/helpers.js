exports.handleFileSelectParts = function(files, isPrivate, cb) {
  var opts = {
    stripExif: true,
    quality: 0.9,
    resize: { width: 1024, height: 1024 },
    isPrivate
  }

  SSB.blobFiles(files, SSB.net, opts, (err, res) => {
    cb(null, res)
  })
}

exports.handleFileSelect = function(ev, isPrivate, cb) {
  this.handleFileSelectParts(ev.target.files, isPrivate, (err, res) => {
    cb(null, " ![" + res.name + "](" + res.link + ")")
  })
}

exports.getMessageTitle = function(msgId, msg) {
  // Patchwork supports adding titles to posts.
  // If we're looking at one of those, display its title.
  if (msg.content)
    if (msg.content.title)
      return msg.content.title
    else if (msg.content.text) {
      const maxLength = 40
      const breakCharacters = ' .,/[]()#'
      var lastBreakChar = 0
      for (var c = 0; c < breakCharacters.length; ++c) {
        var lastIndex = msg.content.text.lastIndexOf(breakCharacters.charAt(c), maxLength)
        if (lastIndex > lastBreakChar)
          lastBreakChar = lastIndex
      }
      if(lastBreakChar == 0)
        lastBreakChar = Math.min(maxLength, msg.content.text.length)
      return (msg.content.text.substring(0, lastBreakChar) + (msg.content.text.length > lastBreakChar ? "..." : "")).trim()
    }

  // Fallback - use the message ID.
  return msgId
}

exports.getMissingProfileImage = function() {
  // This is centralized here so that when building to a single inlined HTML file,
  // we're only swapping in the base64-encoded version once.
  return "assets/noavatar.svg"
}
