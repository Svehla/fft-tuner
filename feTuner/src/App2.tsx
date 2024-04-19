import { useComponentDidMount } from './utils/hooks'

const main = async () => {
  // @ts-expect-error
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

  const x = audioCtx.createBiquadFilter()_
  const analyser = audioCtx.createAnalyser()
  // max fft size is 32768...
  analyser.fftSize = 32768 // TODO: 80K

  const bufferLength = analyser.frequencyBinCount
  const floatDataArray = new Float32Array(bufferLength)

  //   let path = "http://localhost:8003/assets/456.wav";
  let path = 'http://localhost:8003/assets/g_sharp_chord.wav'

  let url = path
  let blob = await fetch(url).then(r => r.blob())
  let arrayBuffer = await blob.arrayBuffer()
  //   console.log("arrayBuffer", arrayBuffer);
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
  //   console.log("ahoj", audioBuffer);

  const source = audioCtx.createBufferSource()
  source.buffer = audioBuffer

  source.connect(analyser)
  analyser.connect(audioCtx.destination)

  console.log('start')
  source.start()
  source.onended = () => {
    console.log('onended')
    analyser.getFloatFrequencyData(floatDataArray)
    console.log('Frequency Data:', floatDataArray)

    // Logování jednotlivých frekvenčních binů
    const data = []
    for (let i = 0; i < floatDataArray.length; i++) {
      data.push({
        freqHz: (i * audioCtx.sampleRate) / analyser.fftSize,
        magnitudeDb: floatDataArray[i],
      })
    }

    console.log(data)

    const top10 = data.sort((a, b) => b.magnitudeDb - a.magnitudeDb).slice(0, 10)

    console.log('top10')
    console.log(top10)

    return
    // Vizualizace dat
    const canvas = document.getElementById('oscilloscope')
    const canvasCtx = canvas.getContext('2d')
    const WIDTH = canvas.width
    const HEIGHT = canvas.height

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)

    for (let i = 0; i < bufferLength; i++) {
      const value = Math.abs(floatDataArray[i])
      const percent = value / 100 // Příklad pro přepočet na procenta
      const height = HEIGHT * percent
      const offset = HEIGHT - height - 1
      const barWidth = WIDTH / bufferLength
      canvasCtx.fillStyle = 'black'
      canvasCtx.fillRect(i * barWidth, offset, barWidth, height)
    }
  }
}

export const App2 = () => {
  useComponentDidMount(() => {
    // main();
    window.onclick = () => main()
  })

  return (
    <div>
      <canvas id='oscilloscope'></canvas>
    </div>
  )
}
