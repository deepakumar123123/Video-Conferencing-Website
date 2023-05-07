<script>
// Textual Chatting
var ws = new WebSocket("ws://localhost:8080");

function sendChat() {
    var input = document.getElementById("chatInput");
    ws.send(input.value);
    input.value = "";
}

ws.onmessage = function(event) {
    var chatBox = document.getElementById("chatBox");
    chatBox.value += event.data + "\n";
};

// Audio-Video Interactions
var localStream, remoteStream;
var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");
var pc = new RTCPeerConnection();

function startCall() {
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
        .then(function(stream) {
            localStream = stream;
            localVideo.srcObject = stream;
            pc.addStream(stream);
            pc.createOffer()
                .then(function(offer) {
                    pc.setLocalDescription(offer);
                    ws.send(JSON.stringify({"type": "offer", "data": offer}));
                })
                .catch(function(error) {
                    console.log(error);
                });
        })
        .catch(function(error) {
            console.log(error);
        });
}

function endCall() {
    localStream.getTracks().forEach(function(track) {
        track.stop();
    });
    remoteStream.getTracks().forEach(function(track) {
        track.stop();
    });
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    pc.close();
}

ws.onmessage = function(event) {
    var message = JSON.parse(event.data);
    if (message.type === "offer") {
        pc.setRemoteDescription(new RTCSessionDescription(message.data));
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then(function(stream) {
                remoteStream = stream;
                remoteVideo.srcObject = stream;
                pc.addStream(stream);
                pc.createAnswer()
                    .then(function(answer) {
                        pc.setLocalDescription(answer);
                        ws.send(JSON.stringify({"type": "answer", "data": answer}));