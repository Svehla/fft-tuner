

## convert wav to raw downloaded from free sound:

```sh
# proper coded for proper parsing into JS code
ffmpeg -i g_sharp_chord.wav -f f32le -acodec pcm_f32le g_sharp_chord.raw
```


helper tools for debug:

https://onlinetonegenerator.com/
https://www.apronus.com/music/flashpiano.htm
app: vocal pitch monitor


audio_block_size je závyslý na tom, kolik frekvencí to dokáže rozeznat? protože tak FFT funguje?