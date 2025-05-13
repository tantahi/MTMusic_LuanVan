const { AssemblyAI } = require('assemblyai');

const client = new AssemblyAI({
  apiKey: '9e4f6b9cfc884713b9559f631fba477d'
});


async function transcribeAudioVi(fileBuffer) {
    try {
      // Convert the file buffer to a Blob
      const blob = new Blob([fileBuffer], { type: 'audio/mpeg' });
  
      const params = {
        audio: blob,
        speaker_labels: true,
        language_code: 'vi'
      };
  
      const transcript = await client.transcripts.transcribe(params);
  
      if (transcript.status === 'error') {
        console.error(`Transcription failed: ${transcript.error}`);
        return 'Error transcribing audio';
      }
  
      console.log(`Transcription: ${transcript.text}`);
  
      // Log individual speaker utterances
      for (let utterance of transcript.utterances) {
        console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
      }
  
      return transcript.text;  // Return the transcribed text
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return 'Error transcribing audio';
    }
  }

module.exports = transcribeAudioVi;

