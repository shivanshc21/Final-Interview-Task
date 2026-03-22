import { useEffect, useRef, useState } from "react";

export default function App() {
  const videoRef = useRef(null);

  const [cameraError, setCameraError] = useState("");
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [device, setDevice] = useState("");
  const [loadingBT, setLoadingBT] = useState(false);

  // 🎥 CAMERA
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        setCameraError("Camera access denied or unavailable");
      }
    }
    startCamera();
  }, []);

  // 🎤 VOICE
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech API not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setText(transcript);
    };

    recognition.onerror = () => setListening(false);

    recognition.start();
    setListening(true);
  };

  // 🦷 BLUETOOTH
  const connectBluetooth = async () => {
    try {
      setLoadingBT(true);

      if (!navigator.bluetooth) {
        alert("Bluetooth not supported");
        return;
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
      });

      setDevice(device.name || "Unnamed Device");
    } catch (err) {
      alert("Bluetooth cancelled or denied");
    } finally {
      setLoadingBT(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-10">
        🚀 Zenithra Hardware Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        {/* CAMERA */}
        <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">📷 Camera</h2>

          {cameraError ? (
            <p className="text-red-400">{cameraError}</p>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              className="rounded-lg border border-gray-600"
            />
          )}
        </div>

        {/* VOICE */}
        <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">🎤 Voice</h2>

          <button
            onClick={startListening}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg mb-4"
          >
            {listening ? "Listening..." : "Start Listening"}
          </button>

          <div className="bg-black p-3 rounded-lg min-h-[100px] border border-gray-700">
            {text || "Speak something..."}
          </div>
        </div>

        {/* BLUETOOTH */}
        <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">🦷 Bluetooth</h2>

          <button
            onClick={connectBluetooth}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg mb-4"
          >
            {loadingBT ? "Scanning..." : "Scan Devices"}
          </button>

          <p className="text-gray-300">
            {device ? `Connected: ${device}` : "No device selected"}
          </p>
        </div>

      </div>
    </div>
  );
}