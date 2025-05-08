document.addEventListener("DOMContentLoaded", function () {
    const cake = document.querySelector(".cake");
    const candleCountDisplay = document.getElementById("candleCount");
    let candles = [];
    let audioContext;
    let analyser;
    let microphone;

    // Function to update the candle count
    function updateCandleCount() {
      const activeCandles = candles.filter(
        (candle) => !candle.classList.contains("out")
      ).length;
      candleCountDisplay.textContent = activeCandles;
    }

    // Function to add a candle when clicking on the cake
    function addCandle(left, top) {
      const candle = document.createElement("div");
      candle.className = "candle";
      candle.style.left = left + "px";
      candle.style.top = top + "px";

      const flame = document.createElement("div");
      flame.className = "flame";
      candle.appendChild(flame);

      cake.appendChild(candle);
      candles.push(candle);
      updateCandleCount();
    }

    cake.addEventListener("click", function (event) {
      const rect = cake.getBoundingClientRect();
      const left = event.clientX - rect.left;
      const top = event.clientY - rect.top;
      addCandle(left, top);
    });

    // Function to check if blowing is happening based on microphone input
    function isBlowing() {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      let average = sum / bufferLength;

      console.log("Average sound level: " + average);  // Debugging line

      return average > 30; // Lowered threshold to make it more sensitive
    }

    // Function to handle blowing out candles
    function blowOutCandles() {
      let blownOut = 0;

      // Only check for blowing if there are candles and at least one is not blown out
      if (candles.length > 0 && candles.some((candle) => !candle.classList.contains("out"))) {
        if (isBlowing()) {
          candles.forEach((candle) => {
            if (!candle.classList.contains("out") && Math.random() > 0.5) {
              candle.classList.add("out");
              blownOut++;
            }
          });
        }

        if (blownOut > 0) {
          updateCandleCount();
        }

        // If all candles are blown out, trigger confetti after a small delay
        if (candles.every((candle) => candle.classList.contains("out"))) {
          setTimeout(function() {
            triggerConfetti();
            endlessConfetti(); // Start the endless confetti
          }, 200);
        }
      }
    }

    // Checking if microphone access is available
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (stream) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          microphone = audioContext.createMediaStreamSource(stream);
          microphone.connect(analyser);
          analyser.fftSize = 256;
          setInterval(blowOutCandles, 200);
        })
        .catch(function (err) {
          console.log("Unable to access microphone: " + err);
        });
    } else {
      console.log("getUserMedia not supported on your browser!");
    }
  });

  // Function to trigger confetti
  function triggerConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  // Function to create endless confetti effect
  function endlessConfetti() {
    setInterval(function() {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0 }
      });
    }, 1000);
  }
