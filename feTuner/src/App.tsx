/* eslint-disable no-bitwise */
// var fft = require('fft-js').fft,
// signal = [1,0,1,0];
// var phasors = fft(signal);
// console.log(phasors)

// const synth = new Tone.Synth().toDestination();
// const now = Tone.now()
// trigger the attack immediately
// synth.triggerAttack("C4", now)

const tones = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// I do not want to have Tone as a dependency
const toneFrequenciesNames = [
  [32.70319566257483, "C1"],
  [65.40639132514966, "C2"],
  [130.8127826502993, "C3"],
  [261.6255653005986, "C4"],
  [523.2511306011972, "C5"],
  [1046.5022612023945, "C6"],
  [34.64782887210902, "C#1"],
  [69.29565774421803, "C#2"],
  [138.59131548843604, "C#3"],
  [277.1826309768721, "C#4"],
  [554.3652619537442, "C#5"],
  [1108.7305239074883, "C#6"],
  [36.70809598967594, "D1"],
  [73.41619197935188, "D2"],
  [146.8323839587038, "D3"],
  [293.6647679174076, "D4"],
  [587.3295358348151, "D5"],
  [1174.6590716696303, "D6"],
  [38.89087296526011, "D#1"],
  [77.78174593052022, "D#2"],
  [155.56349186104043, "D#3"],
  [311.12698372208087, "D#4"],
  [622.2539674441618, "D#5"],
  [1244.5079348883235, "D#6"],
  [41.20344461410874, "E1"],
  [82.40688922821748, "E2"],
  [164.81377845643496, "E3"],
  [329.6275569128699, "E4"],
  [659.2551138257398, "E5"],
  [1318.5102276514797, "E6"],
  [43.653528929125486, "F1"],
  [87.30705785825097, "F2"],
  [174.61411571650194, "F3"],
  [349.2282314330039, "F4"],
  [698.4564628660078, "F5"],
  [1396.9129257320155, "F6"],
  [46.24930283895431, "F#1"],
  [92.49860567790861, "F#2"],
  [184.99721135581723, "F#3"],
  [369.99442271163446, "F#4"],
  [739.9888454232689, "F#5"],
  [1479.9776908465378, "F#6"],
  [48.999429497718666, "G1"],
  [97.99885899543733, "G2"],
  [195.99771799087463, "G3"],
  [391.99543598174927, "G4"],
  [783.9908719634986, "G5"],
  [1567.981743926997, "G6"],
  [51.91308719749314, "G#1"],
  [103.82617439498628, "G#2"],
  [207.65234878997256, "G#3"],
  [415.3046975799451, "G#4"],
  [830.6093951598903, "G#5"],
  [1661.2187903197805, "G#6"],
  [55, "A1"],
  [110, "A2"],
  [220, "A3"],
  [440, "A4"],
  [880, "A5"],
  [1760, "A6"],
  [58.27047018976124, "A#1"],
  [116.54094037952248, "A#2"],
  [233.08188075904496, "A#3"],
  [466.1637615180899, "A#4"],
  [932.3275230361799, "A#5"],
  [1864.6550460723597, "A#6"],
  [61.73541265701551, "B1"],
  [123.47082531403105, "B2"],
  [246.9416506280621, "B3"],
  [493.8833012561242, "B4"],
  [987.7666025122484, "B5"],
  [1975.5332050244963, "B6"],
];
// tones
// .flatMap(tone => [
//   `${tone}1`,
//   `${tone}2`,
//   `${tone}3`,
//   `${tone}4`,
//   `${tone}5`,
//   `${tone}6`,
// ])
// .map(tone => [Tone.Frequency(tone).toFrequency(), tone])

// console.log(JSON.stringify(toneFrequenciesNames))
// console.log(toneFrequenciesNames)

// Tone.Frequency("G#4").toFrequency(),
// Tone.Frequency("G#5").toFrequency(),
// Tone.Frequency(0).toNote()
// Tone.Frequency("C3") ,
// Tone.Frequency(340, "midi") ,
// Tone.Frequency("C3").transpose(4)
// ----------------------------------------

const frequencyToTone = (frequency: any) => {
  // @ts-expect-error
  return Tone.Frequency(frequency).toNote();
  return "1337";
};

const getTopFrequencies = (magnitudes: any, count: any) => {
  return (
    magnitudes
      // @ts-expect-error
      .map((value, index) => ({ index, value: value }))
      // @ts-expect-error
      .sort((a, b) => b.value - a.value)
      .slice(0, count)
      // @ts-expect-error
      .map((item) => item.index)
  );
};

// const samplingRate = 44100;
// number of tested frequencies (multiplied by sampling rate! (and fftSzie))
// TODO: is this audio_block_size????!!!
// const fftSize = 1024

const printFoundFTTones = (
  // @ts-expect-error
  stft_magnitudes,
  // @ts-expect-error
  { sample_rate, audio_block_size }
) => {
  // fucking magic...
  // audio_block_size/2 => 512? => FFT out is symmetrical (magnitude of im + re?, dunno)
  const aggregatedMagnitudes = new Array(audio_block_size / 2).fill(0);

  // @ts-expect-error
  stft_magnitudes.forEach((timeSlice) => {
    // @ts-expect-error
    timeSlice.forEach((magnitude, index) => {
      aggregatedMagnitudes[index] += magnitude;
    });
  });

  // console.log('stft_magnitudes')
  // console.log(stft_magnitudes)
  // console.log(aggregatedMagnitudes)

  const topFrequencies = aggregatedMagnitudes
    .map((magnitude, index) => {
      // I do not know, why the block size is here

      // TODO: i do not understand equation... why sample_rate does matter
      const realFreq = index * (sample_rate / audio_block_size); // real re-computed freq

      // ????????
      // https://en.wikipedia.org/wiki/Nyquist%E2%80%93Shannon_sampling_theorem
      if (realFreq >= sample_rate / 2) {
        return null;
      }

      return {
        index,
        magnitude: magnitude, // intensity (maybe volume??)
        freq: realFreq,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.magnitude - a.magnitude)
    // TODO: remove duplicities by tone guess...
    .slice(0, 10);

  // const topFrequenciesIndices = getTopFrequencies(aggregatedMagnitudes, 10)
  // .filter(item => item < 18000) // filter out noise...???
  // https://en.wikipedia.org/wiki/Nyquist%E2%80%93Shannon_sampling_theorem

  return topFrequencies;
};

// @ts-expect-error
const flattenFloat32Arrays = (arrays) => {
  // @ts-expect-error
  const totalLength = arrays.reduce((acc, val) => acc + val.length, 0);

  const flatArray = new Float32Array(totalLength);

  let offset = 0;
  for (let arr of arrays) {
    flatArray.set(arr, offset);
    offset += arr.length;
  }

  return flatArray;
};

// @ts-expect-error
pffft_simd().then(async function (Module) {
  // TODO: write FFT to sin wave...
  const analyzeSample = (
    // @ts-expect-error
    audio_samples,
    // @ts-expect-error
    { sample_rate, audio_block_size, bytes_per_element, audio_step_size }
  ) => {
    console.time("fft-runtime");
    var stft_magnitudes = new Array();

    let pffft_runner = Module._pffft_runner_new(
      audio_block_size,
      bytes_per_element
    );
    // console.log("New PFFFT runner created: ");

    // Get data byte size, allocate memory on Emscripten heap, and get pointer
    var nDataBytes = audio_block_size * bytes_per_element;
    var dataPtr = Module._malloc(nDataBytes);
    // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);

    for (
      var audio_sample_index = 0;
      audio_sample_index < audio_samples.length - audio_block_size;
      audio_sample_index += audio_step_size
    ) {
      const audio_block = audio_samples.slice(
        audio_sample_index,
        audio_sample_index + audio_block_size
      );

      dataHeap.set(new Uint8Array(audio_block.buffer));

      // Window + forward FFT for each block
      Module._pffft_runner_transform(pffft_runner, dataHeap.byteOffset);

      var fft_result = new Float32Array(
        dataHeap.buffer,
        dataHeap.byteOffset,
        audio_block.length
      );

      // calculate magnitudes and accumulate results
      var magnitudes = new Array(audio_block_size / 2);

      // this code combine imaginary + real value => which is array of magnitudes
      for (var i = 0; i < audio_block_size; i += 2) {
        // missing sqrt for simplicity... magnitude is vec which is Euclidean length (pythagorean) of two dim (real + imaginary)
        // i think that math floor is not needed here :)
        // how is possible, that those numbers are not only positives?
        // if (i === 0) console.log('kkt1',  fft_result[i] * fft_result[i] + fft_result[i+1] * fft_result[i+1])
        magnitudes[Math.floor(i / 2)] =
          fft_result[i] * fft_result[i] + fft_result[i + 1] * fft_result[i + 1];
        // if (i === 0) console.log('kkt2', magnitudes[Math.floor(i/2)])
      }

      // stft_magnitudes = [...stft_magnitudes, magnitudes];
      stft_magnitudes.push(magnitudes);
    }

    // console.log('xxxxx', stft_magnitudes)
    Module._free(dataPtr);
    Module._pffft_runner_destroy(pffft_runner);
    console.timeEnd("fft-runtime");

    return stft_magnitudes;
  };

  const useMockChord = true; // false

  if (useMockChord) {
    console.log("using mock!!!");

    // ffprobe -v error -show_format -show_streams tone1.wav
    const conf = {
      // === this is FFT config ===
      // this is window width
      audio_block_size: 1024 * 2, //// 1024 * 2, // 1024, // *2*2, // number of samples for one block of FFT // i guess this is sliding window for analyzing partial parts of fft
      // this is audio block size shift per iteration
      audio_step_size: 128, // 128, // is this an overlap window step which iterate over partial blocks

      // === this is sound config ===
      bytes_per_element: 4, // bits_per_raw_sample // 32 bit float
      sample_rate: 44100, // sample_rate // Hz
      fileName:
        //
        "181425__serylis__guitar-chord.raw",
      // "assets/f_major_chord.raw"
      // "assets/g_sharp_chord.raw"
      // "assets/456.raw"
    };

    let path = "http://localhost:8003/" + conf.fileName;
    // window.location.pathname.replace(
    //   "visualize.html",
    //   conf.fileName
    // );

    // console.log(path)
    let url = path;
    let blob = await fetch(url).then((r) => r.blob());
    let buffer = await blob.arrayBuffer();
    // const x = new Float32Array(buffer).slice(0, originalArray.length - 1)
    // console.log(buffer)
    let test_audio_samples = new Float32Array(buffer);
    // console.log(test_audio_samples)

    // console.log('data len: ', test_audio_samples.length)

    // console.log(url)
    // console.log(blob)
    // console.log(buffer)

    // console.log(test_audio_samples)
    const stft_magnitudes = analyzeSample(test_audio_samples, conf);
    // console.log('stft_magnitudes len', stft_magnitudes.length)

    drawFFTOnCanvas(stft_magnitudes);

    drawFreqInTime(stft_magnitudes, {
      sample_rate: conf.sample_rate,
      audio_block_size: conf.audio_block_size,
    });
    // stft => short time fourier transform

    // drawFreqInTime(stft_magnitudes, { sample_rate: conf.sample_rate, audio_block_size: conf.audio_block_size })

    // console logs...
    const topFrequencies = printFoundFTTones(stft_magnitudes, {
      sample_rate: conf.sample_rate,
      audio_block_size: conf.audio_block_size,
    });
    // console.log(topFrequencies)

    console.log(
      //
      "out tones:\n" +
        topFrequencies
          .map(
            (item, index) =>
              // @ts-expect-error
              `${frequencyToTone(item.freq).padStart(4, " ")}` +
              // @ts-expect-error
              ` - freq: ${item.freq.toFixed(5).padStart(15, " ")}` +
              // @ts-expect-error
              ` - magnitude: ${item.magnitude.toFixed(5).padStart(15, " ")}` +
              // @ts-expect-error
              ` - index: ${item.index.toString().padStart(5, " ")}`
          )
          .join("\n")
    );
  } else {
    // TODO: uncomment and make it work realtime from the microphone for the tuner app
    // @ts-expect-error
    let audio_samples = [];
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(function (stream) {
        const audioContext = new (window.AudioContext ||
          // @ts-expect-error
          window.webkitAudioContext)();
        const sampleRate = audioContext.sampleRate;

        const source = audioContext.createMediaStreamSource(stream);

        const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
        scriptNode.onaudioprocess = function (audioProcessingEvent) {
          try {
            const inputBuffer = audioProcessingEvent.inputBuffer;
            const inputData = inputBuffer.getChannelData(0);

            audio_samples.push(new Float32Array(inputData));

            const everyMs = 1000 / 33; // 33 fps xd

            if ((audio_samples.length * 4096) / sampleRate > everyMs / 1000) {
              const audioContext = new (window.AudioContext ||
                // @ts-expect-error
                window.webkitAudioContext)();
              const sample_rate = audioContext.sampleRate;
              // @ts-expect-error
              const wave = flattenFloat32Arrays(audio_samples);
              const audio_block_size = 1024; // *16 // 1024, // *2*2, // number of samples for one block of FFT // i guess this is sliding window for analyzing partial parts of fft
              const output = analyzeSample(wave, {
                // this is audio block size shift per iteration
                // toto je detail, jak moc bude mít FFT rozlišení
                audio_step_size: 2 ** 7, // 2 ** 7,  // 128, // 128, // is this an overlap window step which iterate over partial blocks

                audio_block_size,
                // === this is sound config ===
                bytes_per_element: 4, // bits_per_raw_sample // 32 bit float
                sample_rate,
              });

              drawFreqInTime(output, { sample_rate, audio_block_size });
              audio_samples = [];
            }
          } catch (err) {
            console.error(err);
            scriptNode.disconnect();
            source.disconnect();
            audioContext.close();
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
        };

        source.connect(scriptNode);
        scriptNode.connect(audioContext.destination);
      })
      .catch(function (err) {
        console.error("Access to your microphone was denied!", err);
      });
  }
});

const drawLine = (
  ctx: any,
  { x: x1, y: y1 }: any,
  { x: x2, y: y2 }: any,
  color = "white",
  lineWidth = 2
) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
};

const drawText = (
  ctx: any,
  text: any,
  { x, y }: any,
  font = "16px Arial",
  color = "white"
) => {
  ctx.beginPath();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

var canvas = document.getElementById("canvas2");
// @ts-expect-error
var ctx = canvas.getContext("2d");
// @ts-expect-error
canvas.width = 700; // stft_magnitudes.length //  * 2;
// @ts-expect-error
canvas.height = 1000; // stft_magnitudes[0].length + 500 // * 3;

let allPoints = [] as any[];

// @ts-expect-error
const drawFreqInTime = (stft_magnitudes, { sample_rate, audio_block_size }) => {
  ctx.fillStyle = "black";
  // @ts-expect-error
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // console.log(printFoundFTTones([stft_magnitudes[0]], { sample_rate, audio_block_size }))

  // show 3 top freq
  const rawMaxPoints = stft_magnitudes.map((i) =>
    printFoundFTTones([i], { sample_rate, audio_block_size })
      .map((i) =>
        i.magnitude > 0.05
          ? i
          : {
              ...i,
              magnitude: i.magnitude, // intensity (maybe volume??)
              freq: 0, // do not show non valid frequencies
            }
      )
      .map((i) => i.freq)
      .slice(0, 3)
  );

  allPoints.push(...rawMaxPoints);
  // console.log('xxxx', allPoints)
  allPoints = allPoints.slice(-500);
  // console.log('ahoj', allPoints)

  // console.log(stft_magnitudes)
  // const minP = rawMaxPoints.
  const maxPoints = allPoints; // rawMaxPoints

  if (maxPoints.length === 0) return;

  let lastPoint1 = maxPoints[0][0]; // show only last freq
  let lastPoint2 = maxPoints[0][1];
  let lastPoint3 = maxPoints[0][2];

  for (let index = 0; index < toneFrequenciesNames.length; index++) {
    const toneName = toneFrequenciesNames[index][1];
    const toneFreq = toneFrequenciesNames[index][0];

    // @ts-expect-error
    drawText(ctx, `${toneName} - ${Math.round(toneFreq)}`, {
      x: 10,
      y: toneFreq,
    });
    drawLine(
      ctx,
      { x: 0, y: toneFreq },
      // @ts-expect-error
      { x: canvas.width, y: toneFreq },
      "#DDD",
      1
    );
  }

  // TODO: apply log scale
  // start iterating from 1
  for (let index = 1; index < maxPoints.length; index++) {
    const point = maxPoints[index];
    let [point1, point2, point3] = point;

    drawLine(
      ctx,
      { x: index, y: lastPoint1 },
      { x: index + 1, y: point1 },
      lastPoint1 === 0 && point1 === 0 ? "yellow" : "red",
      2
    );
    // drawLine(ctx, { x: index, y: lastPoint2 }, { x: index + 1, y: point2 }, 'blue', 2)
    // drawLine(ctx, { x: index, y: lastPoint3 }, { x: index + 1, y: point3 }, 'green', 2)

    lastPoint1 = point1;
    lastPoint2 = point2;
    lastPoint3 = point3;
  }
};

// x coord => time
// y coord => intensity of frequency (by the index)
//         => intensity of the frequency in the time...
// @ts-expect-error
const drawFFTOnCanvas = (stft_magnitudes) => {
  var stft_magnitudes = JSON.parse(JSON.stringify(stft_magnitudes));

  var canvas = document.getElementById("canvas1");
  // @ts-expect-error
  var ctx = canvas.getContext("2d");
  // @ts-expect-error
  canvas.width = stft_magnitudes.length;
  // @ts-expect-error
  canvas.height = stft_magnitudes[0].length;

  const imageData = ctx.createImageData(
    stft_magnitudes.length,
    stft_magnitudes[0].length
  );
  const data = imageData.data;

  var max_value = -Infinity;
  var min_value = Infinity;
  for (var t = 0; t < stft_magnitudes.length; t++) {
    for (var f = 0; f < stft_magnitudes[t].length; f++) {
      // TODO: why is it shown in the log scale?
      // log scale make nicer UI... xd
      stft_magnitudes[t][f] = Math.log(stft_magnitudes[t][f]);
      max_value = Math.max(stft_magnitudes[t][f], max_value);
      min_value = Math.min(stft_magnitudes[t][f], min_value);
    }
  }

  const channelsCount = 4; // R G B a

  for (let i = 0; i < imageData.data.length; i += channelsCount) {
    //  recalculating 2D into 3D coordination system
    let x = (i / 4) % imageData.width;
    // ~~ is math round
    let y = ~~(i / 4 / imageData.width);

    let t = x;
    let f = Math.floor(imageData.height - y - 1);

    // more white value, stronger magnitude, probable frequency...
    // normalizing log value into 0-255...
    let gray_value = ~~(
      ((stft_magnitudes[t][f] - min_value) / (max_value - min_value)) *
      255
    );

    // Modify pixel data
    imageData.data[i + 0] = gray_value; // R value
    imageData.data[i + 1] = gray_value; // G value
    imageData.data[i + 2] = gray_value; // B value
    imageData.data[i + 3] = 255; // A value
  }

  ctx.putImageData(imageData, 0, 0);
};

export const App = () => <div>react part</div>;
