let Module = null as any;

const loadCppFFTModule = async () => {
  // @ts-expect-error
  Module = await pffft_simd();
};

export const isModuleLoaded = loadCppFFTModule();

export const callFFT = (
  signal: any[],
  conf: {
    sample_rate: number;
    audio_block_size: number;
    bytes_per_element: number;
    audio_step_size: number;
  }
) => {
  const analyzeSample = (
    audio_samples: any[],
    {
      sample_rate,
      audio_block_size,
      bytes_per_element,
      audio_step_size,
    }: {
      sample_rate: number;
      audio_block_size: number;
      bytes_per_element: number;
      audio_step_size: number;
    }
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

      dataHeap.set(
        new Uint8Array(
          // @ts-expect-error
          audio_block.buffer
        )
      );

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

  const magnitudes = analyzeSample(signal, conf);
  return magnitudes;
};
