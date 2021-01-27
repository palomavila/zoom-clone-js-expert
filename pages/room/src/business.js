class Business {
  constructor({ room, media, view, socketBuilder, peerBuilder }) {
    this.media = media;
    this.room = room;
    this.view = view;
    
     this.socketBuilder = socketBuilder
     this.peerBuilder = peerBuilder

     this.socket = {}
     this.currentStream = {}
     this.currentPeer = {}

     this.peers = new Map()
    }

  //protege a classe de alterações
  static initialize(deps) {
    const instance = new Business(deps);
    return instance._init();
  }
  async _init() {
     this.currentStream = await this.media.getCamera();
      this.socket = this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build();
    
    this.currentPeer = await this.peerBuilder
     .setOnError(this.onPeerError())
     .setOnConnectionOpened(this.onPeerConnectionOpened())
     .setOnCallReceived(this.onPeerCallReceived())
     .setOnPeerStreamReceived(this.onPeerStreamReceived())
     .build()
    
    this.addVideoStream('teste01');
    
  }

  addVideoStream(userId, stream = this.currentStream) {
    const isCurrentId = false;
    this.view.renderVideo({
      userId,
      stream,
      isCurrentId,
    })
  }

  onUserConnected = function () {
        return userId => {
            console.log('user connected!', userId)
            this.currentPeer.call(userId, this.currentStream)
    }
  }

  onUserDisconnected = function () {
        return (userId) => {
            console.log('user disconnected!', userId);
    
  }
}
 onPeerError = function () {
        return error => {
            console.log('error on peer!', error)
        }
    }

    onPeerConnectionOpened = function () {
        return peer => {
            const id = peer.id
            console.log('peer!!', peer)
            this.socket.emit('join-room', this.room, id)
        }
    }

    onPeerCallReceived = function () {
        return call => {
            console.log('answering call', call)
            call.answer(this.currentStream)
        }
    }

    onPeerStreamReceived = function () {
        return (call, stream) => {
            const callerId = call.peer
            this.addVideoStream(callerId, stream)

            this.peers.set(callerId, { call })
            
            this.view.setParticipants(this.peers.size)
      
          
    onPeerCallClose() {
        return call => {
            console.log('Call CLosed', call)
        }
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
