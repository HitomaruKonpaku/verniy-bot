class DiscordClient {
    constructor() {
        // Get variables for client
        this.token = process.env.DISCORD_TOKEN_BOT
        this.owner = process.env.DISCORD_OWNER || '153363129915539457'
        this.commandPrefix = process.env.DISCORD_PREFIX || '.'
        this.commandEditableDuration = 20
        this.nonCommandEditable = false
        this.unknownCommandResponse = false

        // Init client
        this.client = new Commando.Client({
            owner: this.owner,
            commandPrefix: this.commandPrefix,
            commandEditableDuration: this.commandEditableDuration,
            nonCommandEditable: this.nonCommandEditable,
            unknownCommandResponse: this.unknownCommandResponse,
        })

        // Client events
        this.client
            .on('ready', () => {
                // Emitted when the client becomes ready to start working
            })
            .on('reconnecting', () => {
                // Emitted whenever the client tries to reconnect to the WebSocket
            })
            .on('debug', info => {
                // Emitted for general debugging information
            })
            .on('warn', info => {
                // Emitted for general warnings
            })
            .on('error', error => {
                // Emitted whenever the client's WebSocket encounters a connection error
            })
            .on('resume', replayed => {
                // Emitted whenever a WebSocket resumes
            })
            .on('disconnect', event => {
                // Emitted when the client's WebSocket disconnects and will no longer attempt to reconnect
            })
            .on('message', message => {
                // Emitted whenever a message is created
            })

        // Client registries
        this.client.registry
            .registerDefaultTypes()
            .registerGroups([
                // ['dev', 'Developer'],
                // ['util', 'Utility'],
                // ['kc', 'KanColle'],
                // ['fun', 'Funny'],
            ])
            .registerCommandsIn(path.join(__dirname, '..', 'commands'))
    }
    start() {
        this.client
            .login(this.token)
            .catch(err => console.trace(err))
    }
}

module.exports = DiscordClient