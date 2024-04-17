Fork of:

https://github.com/JorenSix/pffft.wasm/tree/master

## convert wav to raw downloaded from free sound:

```sh
# proper coded for proper parsing into JS code
ffmpeg -i g_sharp_chord.wav -f f32le -acodec pcm_f32le g_sharp_chord.raw
ffmpeg -i 456.wav -f f32le -acodec pcm_f32le 456.raw
ffprobe -v error -of default=noprint_wrappers=1:nokey=1 -select_streams a:0 \
-show_entries stream=sample_fmt,channels,bits_per_raw_sample,sample_rate 456.raw
```

helper tools for debug:

https://onlinetonegenerator.com/
https://www.apronus.com/music/flashpiano.htm
app: vocal pitch monitor

audio_block_size je závyslý na tom, kolik frekvencí to dokáže rozeznat? protože tak FFT funguje?

## debug TODO:

- TODO: implement FFT To sound + add sound debug framework

## dependency

- ffmpeg
