var Flume = require('flumedb')
var OffsetLog = require('flumelog-aligned-offset')
var OffsetLogCompat = require('flumelog-aligned-offset/compat')
var mkdirp = require('mkdirp')
var ViewHashTable = require('flumeview-hashtable')

var codec = require('flumecodec/json')
var path = require('path')
var hash = require('ssb-keys/util').hash

function getId(msg) {
  return '%'+hash(JSON.stringify(msg, null, 2))
}

module.exports = function (dir) {
  var log = OffsetLogCompat(OffsetLog(
    path.join(dir, 'log.offset'),
    {blockSize:1024*64, codec:codec}
  ))

  var store = Flume(log)
    .use('keys', ViewHashTable(2, function (key) {
      var b = new Buffer(key.substring(1,7), 'base64').readUInt32BE(0)
      return b
    }))

  store.add = function (msg, cb) {
    var data = {
      key: getId(msg),
      value: msg,
      timestamp: Date.now()
    }
    store.append(data, function (err) {
      if(err) cb(err)
      else cb(null, data)
    })
  }

  return store
}
