const micBtn = document.getElementById("micBtn");
const output = document.getElementById("output");
const statusText = document.getElementById("status");

// Create wave container below mic button
const waveContainer = document.createElement("div");
waveContainer.className = "wave-container";
waveContainer.style.display = "none"; // Hidden by default
micBtn.parentNode.insertBefore(waveContainer, micBtn.nextSibling);

// Create wave bars
for (let i = 0; i < 5; i++) {
  const bar = document.createElement("span");
  bar.className = "wave-bar";
  waveContainer.appendChild(bar);
}

// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// if browser doesn't support speech
if (!SpeechRecognition) {
  statusText.innerText = " Speech recognition not supported";
  micBtn.style.background = "#6c757d";
  micBtn.style.cursor = "not-allowed";
  micBtn.onclick = null;
} else {
  const recognition = new SpeechRecognition();

  // --- YOUR SETTINGS ---
  recognition.lang = "en-US";        // change to "hi-IN" for Hindi, etc.
  recognition.continuous = false;
  recognition.interimResults = false;
  // ---------------------

  let listening = false;

  // --- YOUR EXACT CLICK HANDLER ---
  micBtn.onclick = () => {
    if (!listening) {
      recognition.start();
    } else {
      recognition.stop();
    }
  };

  // --- YOUR EXACT EVENT HANDLERS ---
  recognition.onstart = () => {
    listening = true;
    micBtn.classList.add("listening");
    waveContainer.style.display = "flex"; // Show waves when speech recognition starts
    statusText.innerText = "Listening...";
  };

  recognition.onresult = (event) => {
    // get the transcript and put it into the input field
    const transcript = event.results[0][0].transcript;
    output.value = transcript;
    // Stop recognition after getting result
    recognition.stop();

    // Auto search and redirect to results.html
    const query = transcript.trim();
    if (query) {
      window.location.href = `results.html?q=${encodeURIComponent(query)}`;
    }
  };

  recognition.onend = () => {
    listening = false;
    micBtn.classList.remove("listening");
    waveContainer.style.display = "none"; // Hide waves when recognition ends
    statusText.innerText = "Tap mic to start";
  };

  recognition.onerror = (event) => {
    console.warn("Speech error:", event.error);
    statusText.innerText = "Error: " + event.error;
    listening = false;
    micBtn.classList.remove("listening");
    waveContainer.style.display = "none"; // Hide waves on error
  };
}