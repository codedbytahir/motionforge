"""Independent full FFmpeg decode. Pass --ffmpeg /path/to/ffmpeg."""
import argparse,subprocess,json
from pathlib import Path
from array import array
p=argparse.ArgumentParser();p.add_argument('--ffmpeg',default='ffmpeg');args=p.parse_args()
root=Path(__file__).resolve().parents[2];folder=root/'audit/offline'
subprocess.run([args.ffmpeg,'-y','-v','error','-i',str(folder/'proof.webm'),'-map','0:v:0','-f','framemd5',str(folder/'decoded-frames.md5')],check=True)
subprocess.run([args.ffmpeg,'-y','-v','error','-i',str(folder/'proof.webm'),'-map','0:a:0','-ac','1','-ar','48000','-f','f32le',str(folder/'decoded-audio.f32')],check=True)
frames=[line for line in (folder/'decoded-frames.md5').read_text().splitlines() if line and not line.startswith('#')]
audio=array('f');audio.frombytes((folder/'decoded-audio.f32').read_bytes());first=next(i/48000 for i,x in enumerate(audio) if abs(x)>.03)
assert len(frames)==60;assert abs(first-1)<.04;assert abs(len(audio)/48000-2)<.04
result={'independentDecoder':'FFmpeg','videoFrames':len(frames),'decodedAudioSamples':len(audio),'firstAudioPulseSeconds':first,'audioDurationSeconds':len(audio)/48000,'passed':True}
(folder/'independent-decode.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
