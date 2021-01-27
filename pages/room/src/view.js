class View {
    constructor() {
        this.recorderBtn = document.getElementById('record')
    }

    toogleRecordingButtonColor(isActive = true) {
        this.recorderBtn.style.color = isActive ? 'red' : 'white'
    }

    onRecordClick(command) {
        this.recordingEnabled = false
        return () => {
            const isActive = this.recordingEnabled = !this.recordingEnabled
            command(this.recordingEnabled)
            this.toogleRecordingButtonColor(isActive)

        }
    }

    configureRecordButton(command) {
        this.recorderBtn.addEventListener('click', this.onRecordClick(command))
    }

    createVideoElement({ muted = true, src, srcObject }) {
        const video = document.createElement('video');
        video.muted = muted;
        video.src = src;
        video.srcObject = srcObject;
        if (src) {
            video.controls = true;
            video.loop = true;
            Util.sleep(200).then(_ => video.play())
        }
        if (srcObject) {
            video.addEventListener('loadedmetadata', _ => video.play())
        }
        return video;
    }


    renderVideo({ userId, stream = null, url = null, isCurrentId = false, muted = true }) {
        const video = this.createVideoElement({ muted, src: url, srcObject: stream })
        this.appendToHTMLTree(userId, video, isCurrentId)
    }

    appendToHTMLTree(userId, video, isCurrentId) {
        const div = document.createElement('div')
        div.id = userId
        div.classList.add('wrapper')
        div.append(video)
        const divName = document.createElement('div')
        divName.innerText = isCurrentId ? '' : userId
        div.append(divName)
        const videogrid = document.getElementById('video-grid')
        videogrid.append(div)
    }

    setParticipants(count) {
        const myself = 1
        const participants = document.getElementById('participants')
        participants.innerHTML = count + myself
    }

    removeVideoElement(id) {
        const element = document.getElementById(id)
        element.remove()
    }
}
