class Business {
  constructor({ room, media, view, socketBuilder }) {
    this.media = media;
    this.room = room;
    this.view = view;

    this.socketBuilder = socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build();

    this.socketBuilder.emit('join-room', this.room, 'teste01');

   
    //mostra câmera na tela
    this.currentStream = {};
  }

  //protege a classe de alterações
  static initialize(deps) {
    const instance = new Business(deps);
    return instance._init();
  }
  async _init() {
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
