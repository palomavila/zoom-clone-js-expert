class Business {
  constructor({ room, media, view, socketBuilder, peerBuilder }) {
    this.media = media;
    this.room = room;
    this.view = view;
    
     this.socketBuilder = socketBuilder
     this.peerBuilder = peerBuilder

    
    this.socketBuilder.emit('join-room', this.room, 'teste01');
    this.currentStream = {};
    this.socket = {};
  }

  //protege a classe de alterações
  static initialize(deps) {
    const instance = new Business(deps);
    return instance._init();
  }
  async _init() {
      this.socket = this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build();

    this.currentStream = await this.media.getCamera();
    this.addVideoStream('teste01');
  }

  //mostra a câmera 
  addVideoStream(userId, stream = this.currentStream) {
    const isCurrentId = false;
    this.view.renderVideo({
      userId,
      stream,
      isCurrentId,
    });
  }

  onUserConnected = function () {
    return (userId) => {
      console.log('user connected!', userId);
    };
  };

  onUserDisconnected = function () {
    return (userId) => {
      console.log('user disconnected!', userId);
    };
  };
}
