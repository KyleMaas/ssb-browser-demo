module.exports = function () {
  const pull = require('pull-stream')
  const ssbMentions = require('ssb-mentions')
  const { and, or, author, isPublic, type, key, descending, paginate, toCallback } = SSB.dbOperators

  return {
    template: `
       <div id="search">
         <h2>{{ $t('search.title', { search: search }) }}</h2>
         <p>{{ $t('search.searchLimitNote', { results: pageSize, depth: searchDepth }) }}</p>
         <ssb-msg v-for="msg in messages" v-bind:key="msg.key" v-bind:msg="msg"></ssb-msg>
         <p v-if="messages.length == 0 && !triedToLoadMessages">{{ $t('common.searchingForMessages') }}</p>
         <p v-if="messages.length == 0 && triedToLoadMessages">{{ $t('common.noMessages') }}</p>
         </p>
       <div>`,

    props: ['search'],
    
    data: function() {
      return {
        triedToLoadMessages: false,
        searchDepth: 10000,
        pageSize: 150,
        messages: []
      }
    },

    methods: {
      loadMore: function() {
        try {
          SSB.search.fullTextSearch(this.search, (err, results) => {
            if (results && results.length > 0) {
              SSB.db.query(
                and(or(...results.slice(0, 100).map(x => key(x.id))), isPublic(), type('post')),
                descending(),
                paginate(this.pageSize),
                toCallback((err, answer) => {
                  this.triedToLoadMessages = true
                  this.messages = this.messages.concat(answer.results || answer)
                })
              )
            } else {
              // No search results.
              this.triedToLoadMessages = true
            }
          })
        } catch(e) {
          // Probably no messages and crashed the query with "TypeError: Cannot set property 'meta' of undefined"
          this.triedToLoadMessages = true
        }
      },

      render: function () {
        document.title = this.$root.appTitle + " - " + this.$root.$t('search.title', { search: this.search })

        this.loadMore()
      }
    },

    created: function () {
      this.searchDepth = SSB.search.depth
      this.render()
    },

    watch: {
      search: function (oldValue, newValue) {
        this.messages = []
        this.triedToLoadMessages = false
        this.render()
      }
    }
  }
}