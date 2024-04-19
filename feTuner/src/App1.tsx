/* eslint-disable no-bitwise */
// var fft = require('fft-js').fft,
// signal = [1,0,1,0];
// var phasors = fft(signal);
// console.log(phasors)

import * as Tone from 'tone'
import { callFFT, isModuleLoaded } from './fft'
import { notNullable } from './utils/array'
import { useComponentDidMount } from './utils/hooks'
import FFT from 'fft.js'
console.log(FFT)
// const synth = new Tone.Synth().toDestination();
// const now = Tone.now()
// trigger the attack immediately
// synth.triggerAttack("C4", now)

const tones = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// I do not want to have Tone as a dependency
// tones
const toneFrequenciesNames = tones
  .flatMap(tone => [
    `${tone}1`,
    `${tone}2`,
    `${tone}3`,
    `${tone}4`,
    `${tone}5`,
    `${tone}6`,
    `${tone}7`,
    `${tone}8`,
    `${tone}9`, // this around 15K => may be hart by human ear
    `${tone}10`, // this around 25+K => cannot be heard by human ear
  ])
  .map(tone => [Tone.Frequency(tone).toFrequency(), tone])

// console.log(toneFrequenciesNames)
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
  return Tone.Frequency(frequency).toNote()
}

// const getTopFrequencies = (magnitudes: any, count: any) => {
//   return (
//     magnitudes
//       // @ts-expect-error
//       .map((value, index) => ({ index, value: value }))
//       // @ts-expect-error
//       .sort((a, b) => b.value - a.value)
//       .slice(0, count)
//       // @ts-expect-error
//       .map((item) => item.index)
//   );
// };

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
  const aggregatedMagnitudes = new Array(audio_block_size / 2).fill(0)

  // @ts-expect-error
  stft_magnitudes.forEach(timeSlice => {
    // @ts-expect-error
    timeSlice.forEach((magnitude, index) => {
      aggregatedMagnitudes[index] += magnitude
    })
  })

  // console.log('stft_magnitudes')
  // console.log(stft_magnitudes)
  // console.log(aggregatedMagnitudes)

  const topFrequencies = aggregatedMagnitudes
    .map((magnitude, index) => {
      // I do not know, why the block size is here

      // TODO: i do not understand equation... why sample_rate does matter
      // frequency is count per seconds, but magnitude is in the audio block size
      // and that is not per-sec...
      // so we need to recalculate
      const realFreq = index * (sample_rate / audio_block_size) // real re-computed freq

      // ????????
      // https://en.wikipedia.org/wiki/Nyquist%E2%80%93Shannon_sampling_theorem
      if (realFreq >= sample_rate / 2) {
        return null
      }

      return {
        index,
        magnitude: magnitude, // intensity (maybe volume??)
        freq: realFreq,
      }
    })
    .filter(notNullable)
    .sort((a, b) => b.magnitude - a.magnitude)
    // TODO: remove duplicities by tone guess...
    .slice(0, 10)

  // const topFrequenciesIndices = getTopFrequencies(aggregatedMagnitudes, 10)
  // .filter(item => item < 18000) // filter out noise...???
  // https://en.wikipedia.org/wiki/Nyquist%E2%80%93Shannon_sampling_theorem

  return topFrequencies
}

// @ts-expect-error
const flattenFloat32Arrays = arrays => {
  // @ts-expect-error
  const totalLength = arrays.reduce((acc, val) => acc + val.length, 0)

  const flatArray = new Float32Array(totalLength)

  let offset = 0
  for (let arr of arrays) {
    flatArray.set(arr, offset)
    offset += arr.length
  }

  return flatArray
}

// pffft_simd().then(async function (Module) {
// TODO: write FFT to sin wave...

const main = async () => {
  await isModuleLoaded

  const useMockChord = true

  if (useMockChord) {
    console.log('using mock!!!')

    /*
    // TODO: i want to have fft resolution 0.5hz per bin
    // i want to get it from the small time series around 0.2sec
    // i hope, that i'll be able to do it via padStart with zeros

    // using sampling rate 44100 is too much! i would rather use something around 8K
    // sample_rate = 8192 // hz
    // time_interval = 200ms + 1.8sec zero padding

    sample_rate = 44100 // hz
    target_fft_resolution = 0.5 // hz
    time_interval = ?

    // ???
    fft_resolution = sample_rate / (time_interval * sample_rate)
    fft_resolution * time_interval * sample_rate = sample_rate
    fft_resolution * time_interval = 1
    time_interval = 1 / fft_resolution

    
    */

    //
    // ffprobe -v error -show_format -show_streams tone1.wav
    const conf = {
      // === this is FFT config ===
      // this is window width
      // 1K*8 = 5hz ii guess?
      // to be +-0.5 heartz, I need 44.1K/0.5 = 88200

      // TODO: it needs to be 80K :|
      // native browser solution: 32768
      // 4096 is max window size supported by current FFT implementation
      // this is known as fftSize
      audio_block_size: 4096, // 1024 * 8, //  * 8, //// 1024 * 2, // 1024, // *2*2, // number of samples for one block of FFT // i guess this is sliding window for analyzing partial parts of fft
      // this is audio block size shift per iteration
      audio_step_size: 128, // 128, // is this an overlap window step which iterate over partial blocks

      // === this is sound config ===
      bytes_per_element: 4, // bits_per_raw_sample // 32 bit float
      sample_rate: 44100, // sample_rate // Hz
      fileName:
        //
        '181425__serylis__guitar-chord.raw',
      // "assets/f_major_chord.raw",
      // "assets/g_sharp_chord.raw",
      // "assets/456.raw"
    }

    // use zero padding
    // https://www.mechanicalvibration.com/Zero_Padding_FFTs.html#:~:text=%60%60Zero%2Dpadding''%20means,even%20a%202048%20point%20FFT.

    // console.log('xxx', conf.audio_block_size)

    let path = 'http://localhost:8003/' + conf.fileName
    // window.location.pathname.replace(
    //   "visualize.html",
    //   conf.fileName
    // );

    // console.log(path)
    let url = path
    let blob = await fetch(url).then(r => r.blob())
    let buffer = await blob.arrayBuffer()
    // const x = new Float32Array(buffer).slice(0, originalArray.length - 1)
    // console.log(buffer)
    let test_audio_samples = new Float32Array(buffer)
    // console.log(test_audio_samples)

    // console.log('data len: ', test_audio_samples.length)

    // console.log(url)
    // console.log(blob)
    // console.log(buffer)

    console.time('x')
    // console.log(test_audio_samples)
    // @ts-expect-error
    const stft_magnitudes = callFFT(test_audio_samples, conf)
    // console.log('stft_magnitudes len', stft_magnitudes.length)

    // console logs...
    const topFrequencies = printFoundFTTones(stft_magnitudes, {
      sample_rate: conf.sample_rate,
      audio_block_size: conf.audio_block_size,
    })
    // console.log(topFrequencies)

    console.log(
      //
      'out tones:\n' +
        topFrequencies
          .map(
            (item, index) =>
              `${frequencyToTone(item.freq).padStart(4, ' ')}` +
              ` - freq: ${item.freq.toFixed(5).padStart(15, ' ')}` +
              ` - magnitude: ${item.magnitude.toFixed(5).padStart(15, ' ')}` +
              ` - index: ${item.index.toString().padStart(5, ' ')}`
          )
          .join('\n')
    )

    drawFFTOnCanvas(stft_magnitudes)

    const drawFreqInTime = setupDrawFreqCanvas()
    drawFreqInTime(stft_magnitudes, {
      sample_rate: conf.sample_rate,
      audio_block_size: conf.audio_block_size,
    })
    console.timeEnd('x')
    // stft => short time fourier transform

    // drawFreqInTime(stft_magnitudes, { sample_rate: conf.sample_rate, audio_block_size: conf.audio_block_size })
  } else {
    const drawFreqInTime = setupDrawFreqCanvas()
    // TODO: uncomment and make it work realtime from the microphone for the tuner app
    let audio_samples = [] as any[]
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(function (stream) {
        const audioContext = new (window.AudioContext ||
          // @ts-expect-error
          window.webkitAudioContext)()
        const sampleRate = audioContext.sampleRate

        const source = audioContext.createMediaStreamSource(stream)

        const scriptNode = audioContext.createScriptProcessor(4096, 1, 1)
        scriptNode.onaudioprocess = function (audioProcessingEvent) {
          try {
            const inputBuffer = audioProcessingEvent.inputBuffer
            const inputData = inputBuffer.getChannelData(0)

            audio_samples.push(new Float32Array(inputData))

            const everyMs = 1000 / 33 // 33 fps xd

            if ((audio_samples.length * 4096) / sampleRate > everyMs / 1000) {
              const audioContext = new (window.AudioContext ||
                // @ts-expect-error
                window.webkitAudioContext)()
              const sample_rate = audioContext.sampleRate
              const wave = flattenFloat32Arrays(audio_samples)
              const audio_block_size = 1024 // *16 // 1024, // *2*2, // number of samples for one block of FFT // i guess this is sliding window for analyzing partial parts of fft

              // @ts-expect-error
              const output = callFFT(wave, {
                // this is audio block size shift per iteration
                // toto je detail, jak moc bude mít FFT rozlišení
                audio_step_size: 2 ** 7, // 2 ** 7,  // 128, // 128, // is this an overlap window step which iterate over partial blocks

                audio_block_size,
                // === this is sound config ===
                bytes_per_element: 4, // bits_per_raw_sample // 32 bit float
                sample_rate,
              })

              drawFreqInTime(output, { sample_rate, audio_block_size })
              audio_samples = []
            }
          } catch (err) {
            console.error(err)
            scriptNode.disconnect()
            source.disconnect()
            audioContext.close()
            stream.getTracks().forEach(track => track.stop())
            return
          }
        }

        source.connect(scriptNode)
        scriptNode.connect(audioContext.destination)
      })
      .catch(function (err) {
        console.error('Access to your microphone was denied!', err)
      })
  }
}

const drawLine = (
  ctx: any,
  { x: x1, y: y1 }: any,
  { x: x2, y: y2 }: any,
  color = 'white',
  lineWidth = 2
) => {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

const drawText = (ctx: any, text: any, { x, y }: any, font = '16px Arial', color = 'white') => {
  ctx.beginPath()
  ctx.font = font
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
}

const setupDrawFreqCanvas = () => {
  var canvas = document.getElementById('canvas2')
  // @ts-expect-error
  var ctx = canvas.getContext('2d')
  // @ts-expect-error
  canvas.width = 700 // stft_magnitudes.length //  * 2;
  // @ts-expect-error
  canvas.height = 1000 // stft_magnitudes[0].length + 500 // * 3;

  let allPoints = [] as any[]

  return (
    stft_magnitudes: any[],
    {
      sample_rate,
      audio_block_size,
    }: {
      sample_rate: number
      audio_block_size: number
    }
  ) => {
    ctx.fillStyle = 'black'
    // @ts-expect-error
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // console.log(printFoundFTTones([stft_magnitudes[0]], { sample_rate, audio_block_size }))

    // show 3 top freq
    const rawMaxPoints = stft_magnitudes.map(i =>
      printFoundFTTones([i], { sample_rate, audio_block_size })
        .map(i =>
          i.magnitude > 0.05
            ? i
            : {
                ...i,
                magnitude: i.magnitude, // intensity (maybe volume??)
                freq: 0, // do not show non valid frequencies
              }
        )
        .map(i => i.freq)
        .slice(0, 3)
    )

    allPoints.push(...rawMaxPoints)
    // console.log('xxxx', allPoints)
    allPoints = allPoints.slice(-500)
    // console.log('ahoj', allPoints)

    // console.log(stft_magnitudes)
    // const minP = rawMaxPoints.
    const maxPoints = allPoints // rawMaxPoints

    if (maxPoints.length === 0) return

    let lastPoint1 = maxPoints[0][0] // show only last freq
    let lastPoint2 = maxPoints[0][1]
    let lastPoint3 = maxPoints[0][2]

    for (let index = 0; index < toneFrequenciesNames.length; index++) {
      const toneName = toneFrequenciesNames[index][1]
      const toneFreq = toneFrequenciesNames[index][0]

      // @ts-expect-error
      drawText(ctx, `${toneName} - ${Math.round(toneFreq)}`, {
        x: 10,
        y: toneFreq,
      })
      drawLine(
        ctx,
        { x: 0, y: toneFreq },
        // @ts-expect-error
        { x: canvas.width, y: toneFreq },
        '#DDD',
        1
      )
    }

    // TODO: apply log scale
    // start iterating from 1
    for (let index = 1; index < maxPoints.length; index++) {
      const point = maxPoints[index]
      let [point1, point2, point3] = point

      drawLine(
        ctx,
        { x: index, y: lastPoint1 },
        { x: index + 1, y: point1 },
        lastPoint1 === 0 && point1 === 0 ? 'yellow' : 'red',
        2
      )
      // drawLine(ctx, { x: index, y: lastPoint2 }, { x: index + 1, y: point2 }, 'blue', 2)
      // drawLine(ctx, { x: index, y: lastPoint3 }, { x: index + 1, y: point3 }, 'green', 2)

      lastPoint1 = point1
      lastPoint2 = point2
      lastPoint3 = point3
    }
  }
}

// x coord => time
// y coord => intensity of frequency (by the index)
//         => intensity of the frequency in the time...
// @ts-expect-error
const drawFFTOnCanvas = stft_magnitudes => {
  var stft_magnitudes = JSON.parse(JSON.stringify(stft_magnitudes))

  var canvas = document.getElementById('canvas1')
  // @ts-expect-error
  var ctx = canvas.getContext('2d')
  // @ts-expect-error
  canvas.width = stft_magnitudes.length
  // @ts-expect-error
  canvas.height = stft_magnitudes[0].length

  const imageData = ctx.createImageData(stft_magnitudes.length, stft_magnitudes[0].length)
  const data = imageData.data

  var max_value = -Infinity
  var min_value = Infinity
  for (var t = 0; t < stft_magnitudes.length; t++) {
    for (var f = 0; f < stft_magnitudes[t].length; f++) {
      // TODO: why is it shown in the log scale?
      // log scale make nicer UI... xd
      stft_magnitudes[t][f] = Math.log(stft_magnitudes[t][f])
      max_value = Math.max(stft_magnitudes[t][f], max_value)
      min_value = Math.min(stft_magnitudes[t][f], min_value)
    }
  }

  const channelsCount = 4 // R G B a

  for (let i = 0; i < imageData.data.length; i += channelsCount) {
    //  recalculating 2D into 3D coordination system
    let x = (i / 4) % imageData.width
    // ~~ is math round
    let y = ~~(i / 4 / imageData.width)

    let t = x
    let f = Math.floor(imageData.height - y - 1)

    // more white value, stronger magnitude, probable frequency...
    // normalizing log value into 0-255...
    let gray_value = ~~(((stft_magnitudes[t][f] - min_value) / (max_value - min_value)) * 255)

    // Modify pixel data
    imageData.data[i + 0] = gray_value // R value
    imageData.data[i + 1] = gray_value // G value
    imageData.data[i + 2] = gray_value // B value
    imageData.data[i + 3] = 255 // A value
  }

  ctx.putImageData(imageData, 0, 0)
}

export const App1 = () => {
  useComponentDidMount(() => {
    main()
  })
  return (
    <div>
      <h1>STFT visualization</h1>
      <p>
        A short audio fragment is downloaded and sliced into audio blocks. FFT magnitudes are
        calculated for each block with the SIMD WASM version of <b>pffft</b>. Note that a Hamming
        window is applied automatically by default. Next, magnitudes are visualized using a
        spectrogram placed on a <b>canvas</b> element. Time is on the horizontal axis and frequency
        (Hz) on the vertical.
      </p>
      <p>
        Note that <a href='https://en.wikipedia.org/wiki/Cross-origin_resource_sharing'>CORS</a>{' '}
        needs to be configured correctly to make this demo work. A working configuration sets these
        headers:
        <b>Cross-Origin-Embedder-Policy ={'>'} require-corp</b> and
        <b>Cross-Origin-Opener-Policy ={'>'} same-origin</b>.
      </p>
      <canvas id='canvas1'></canvas>
      <br />
      <canvas id='canvas2'></canvas>
      <br />
      <br />

      <div style={{ flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          181425__serylis__guitar (C major triad)
          <audio src='http://localhost:8003/181425__serylis__guitar-chord.wav' controls></audio>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          g_sharp_chord
          <audio src='http://localhost:8003/assets/g_sharp_chord.wav' controls></audio>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          f_major_chord
          <audio src='http://localhost:8003/assets/f_major_chord.wav' controls></audio>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          456
          <audio src='http://localhost:8003/assets/456.wav' controls></audio>
        </div>
      </div>
    </div>
  )
}
