class Business {
    constructor({ room, media, view, socketBuilder, peerBuilder }) {
        this.media = media;
        this.room = room;
        this.view = view;
        this.socketBuilder = socketBuilder
        this.peerBuilder = peerBuilder
        this.currentStream = {}
        this.socket = {}
        this.currentPeer = {}

        this.peers = new Map()
        this.userRecordings = new Map()
    }
    static initialize(deps) {
        const instance = new Business(deps)
        return instance._init()
    }
    async _init() {
        this.view.configureRecordButton(this.onRecordPressed.bind(this))
        this.currentStream = await this.media.getCamera()
        this.socket = this.socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onUserDisconnected())
            .build()
        this.currentPeer = await this.peerBuilder
            .setOnError(this.onPeerError())
            .setOnConnectionOpened(this.onConnectionOpened())
            .setOnCallReceived(this.onPeerCallReceived())
            .setOnPeerStreamReceived(this.onPeerStreamReceived())
            .setOnCallError(this.onPeerCallError())
            .setOnCallClose(this.onPeerCallClose())
            .build()
        this.addVideoStream(this.currentPeer.id)
    }

    addVideoStream(userId, stream = this.currentStream) {
        const recorderInstance = new Recorder(userId, stream)
        this.userRecordings.set(recorderInstance.fileName, recorderInstance)
        if (this.recordingEnabled) {
            recorderInstance.startRecording()
        }
        const isCurrentId = false;
        this.view.renderVideo({ userId, muted: false, stream, isCurrentId })
    }

    onUserConnected() {
        return userId => {
            console.log('New user!', userId)
            this.currentPeer.call(userId, this.currentStream)
        };
    }
    onUserDisconnected() {
        return userId => {
            console.log('User Left!', userId)
            if (this.peers.has(userId)) {
                this.peers.get(userId).call.close()
                this.peers.delete(userId)
            }
            this.view.setParticipants(this.peers.size)
            this.stopRecording(userId)
            this.view.removeVideoElement(userId)
        };
    }

    onPeerError() {
        return error => {
            console.error('Error on peer!', error)
        };
    }

    onConnectionOpened() {
        return peer => {
            const id = peer.id
            console.log('New Peer!!', peer)
            this.socket.emit('join-room', this.room, id)
        };
    }

    onPeerCallReceived() {
        return call => {
            console.log('Answering call', call)
            call.answer(this.currentStream)
        };
    }

    onPeerStreamReceived() {
        return (call, stream) => {
            const callerId = call.peer;
            this.addVideoStream(callerId, stream)
            this.peers.set(callerId, { call })
            this.view.setParticipants(this.peers.size)
        };
    }

    onPeerCallError() {
        return (call, error) => {
            console.log('An call error ocurred', error)
            this.view.removeVideoElement(call.peer)
        };
    }

    onPeerCallClose() {
        return call => {
            console.log('Call CLosed', call)
        };
    }

    onRecordPressed(recordingEnabled) {
        this.recordingEnabled = recordingEnabled
        for (const [key, value] of this.userRecordings) {
            if (this.recordingEnabled) {
                value.startRecording()
                continue;
            }
            this.stopRecording(key)
        }

    }

    async stopRecording(userId) {
        const userRecordings = this.userRecordings
        for (const [key, value] of userRecordings) {
            const isContextUser = key.includes(userId)
            if (!isContextUser) continue;

            const rec = value;
            const isRecordingActive = rec.recordingActive
            if (!isRecordingActive) continue;

            await rec.stopRecording()
        }
    }
}
