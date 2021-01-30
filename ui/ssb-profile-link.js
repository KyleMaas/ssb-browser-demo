const helpers = require('./helpers')

Vue.component('ssb-profile-link', {
  template: `
        <router-link :to="{name: 'profile', params: { feedId: feedId }}">
          <img class='avatar' :src='imgURL' :title="name" />
        </router-link>`,

  props: ['feedId'],

  data: function() {
    return {
      imgURL: '',
      name: ''
    }
  },

  created: function () {
    if (this.feedId == SSB.net.id)
      this.name = "You"
    
    // Set a default image to be overridden if there is an actual avatar to show.
    this.imgURL = helpers.getMissingProfileImage()

    var self = this
    SSB.getProfileAsync(self.feedId, (err, profile) => {
      if (profile) {
        if (self.feedId != SSB.net.id)
          self.name = profile.name

        if (profile.imageURL) self.imgURL = profile.imageURL
        else if (profile.image) {
          SSB.net.blobs.localProfileGet(profile.image, (err, url) => {
            if (err)
              return console.error("failed to get img", err)
  
            self.imgURL = url
          })
        }
      }
    })
  }
})
