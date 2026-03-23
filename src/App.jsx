import { useEffect, useRef, useState } from "react";

export default function App() {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const [cameraError, setCameraError] = useState("");
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [device, setDevice] = useState(null);
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
  const toggleListening = () => {
    if (listening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setListening(false);
      }
      return;
    }

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
    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
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

      const btDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
      });

      setDevice(btDevice);
    } catch (err) {
      alert("Bluetooth cancelled or denied");
    } finally {
      setLoadingBT(false);
    }
  };

  const getDeviceName = () => {
    if (!device) return "No device selected";
    return device.name || `Device (${device.id.substring(0, 8)}...)`;
  };

  const disconnectBluetooth = () => {
    setDevice(null);
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
            onClick={toggleListening}
            className={`px-4 py-2 rounded-lg mb-4 ${
              listening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {listening ? "Stop Listening" : "Start Listening"}
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
            disabled={device !== null}
            className={`px-4 py-2 rounded-lg mb-4 ${
              device
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loadingBT ? "Scanning..." : "Scan Devices"}
          </button>

          {device && (
            <button
              onClick={disconnectBluetooth}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg mb-4 w-full"
            >
              Disconnect
            </button>
          )}

          <p className="text-gray-300 font-semibold">
            {device ? `✓ Connected: ${getDeviceName()}` : "No device selected"}
          </p>
          {device && (
            <p className="text-gray-500 text-sm mt-2 break-words">
              ID: {device.id}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}