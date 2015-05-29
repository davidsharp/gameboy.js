var Channel3 = function(audioContext) {
    this.playing = false;

    this.soundLength = 0;
    this.soundLengthUnit = 0x4000; // 1 / 256 second of instructions
    this.lengthCheck = false;

    this.clockLength = 0;

    this.buffer = new Float32Array(32);

    var gainNode = audioContext.createGain();
    gainNode.gain.value = 1;
    this.gainNode = gainNode;

    this.baseSpeed = 65536;
    var waveBuffer = audioContext.createBuffer(1, 32, this.baseSpeed);

    var bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = waveBuffer;
    bufferSource.loop = true;
    bufferSource.connect(gainNode);
    bufferSource.start();

    this.audioContext = audioContext;
    this.waveBuffer = waveBuffer;
    this.bufferSource = bufferSource;

};
Channel3.prototype.play = function() {
    this.playing = true;
    this.waveBuffer.copyToChannel(this.buffer, 0, 0);

    this.gainNode.connect(this.audioContext.destination);
    this.clockLength = 0;
};
Channel3.prototype.stop = function() {
    this.playing = false;
    this.gainNode.disconnect();
};
Channel3.prototype.update = function(clockElapsed) {
    if (!this.playing) return;

    this.clockLength  += clockElapsed;

    if (this.lengthCheck && this.clockLength > this.soundLengthUnit * this.soundLength) {
        this.clockLength = 0;
        this.stop();
    }
};
Channel3.prototype.setFrequency = function(value) {
    value = 65536 / (2048  - value);
    this.bufferSource.playbackRate.value = value / this.baseSpeed;
};
Channel3.prototype.getFrequency = function() {
    var freq = 2048 - 65536 / (this.bufferSource.playbackRate.value * this.baseSpeed);
    return freq | 1;
};
Channel3.prototype.setLength = function(value) {
    this.soundLength = 256 - value;
};
Channel3.prototype.setWaveBufferByte = function(index, value) {
    var bufferIndex = index * 2;

    this.buffer[bufferIndex]   = (value >> 4) / 8 - 1; // value in buffer is in -1 -> 1
    this.buffer[bufferIndex+1] = (value & 0x0F) / 8 - 1;
};
Channel3.prototype.disable = function() {
    this.bufferSource.disconnect();
};
Channel3.prototype.enable = function() {
    this.bufferSource.connect(this.gainNode);
};