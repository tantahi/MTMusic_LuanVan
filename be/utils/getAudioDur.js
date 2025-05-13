const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');

// ffprobe path
ffmpeg.setFfprobePath(ffprobeStatic.path);

async function getAudioDuration(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                // calc minute and second
                const durationSeconds = parseInt(metadata.format.duration, 10);
                const minutes = Math.floor(durationSeconds / 60);
                const seconds = Math.floor(durationSeconds % 60);
                
                const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                resolve(formattedDuration);
            }
        });
    });
}

module.exports = getAudioDuration;
