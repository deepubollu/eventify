import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  Camera,
  Keyboard,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  History,
  ShieldAlert,
  Loader2,
  Volume2,
  VolumeX,
  Calendar,
  User,
} from 'lucide-react';

export const QrVerificationPage = () => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const scannerRef = useRef(null);

  // Play audio tones for feedback
  const playBeep = (type) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // AudioContext may be restricted by browser policy
    }
  };

  const executeVerification = async (codeToVerify) => {
    if (!codeToVerify || !codeToVerify.trim()) return;

    setLoading(true);
    setVerificationResult(null);

    try {
      const res = await api.verifyCheckIn({
        ticketCodeInput: codeToVerify.trim(),
        deviceInfo: 'Gate Scanner Console',
      });

      const resultObj = {
        type: 'SUCCESS',
        status: res.status,
        message: res.message || 'Ticket Verified! Check-In Successful.',
        ticket: res.ticket,
        checkIn: res.checkIn,
        timestamp: new Date().toLocaleTimeString(),
      };

      setVerificationResult(resultObj);
      setScanHistory((prev) => [resultObj, ...prev.slice(0, 19)]);
      playBeep('success');
    } catch (err) {
      const errData = err.data || {};
      const status = errData.status || 'ERROR';

      const resultObj = {
        type: status === 'ALREADY_USED' ? 'WARNING' : 'ERROR',
        status,
        message: err.message || 'Verification failed.',
        ticket: errData.ticket,
        usedAt: errData.usedAt,
        timestamp: new Date().toLocaleTimeString(),
      };

      setVerificationResult(resultObj);
      setScanHistory((prev) => [resultObj, ...prev.slice(0, 19)]);
      playBeep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    executeVerification(ticketInput);
  };

  // Start camera scanner
  const startCamera = async () => {
    setCameraError('');
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          // Scanned successfully!
          stopCamera();
          executeVerification(decodedText);
        },
        (error) => {
          // ignore scan frame errors
        }
      );

      setCameraActive(true);
    } catch (err) {
      console.warn('Camera start issue:', err);
      setCameraError(
        'Unable to access camera or webcam permissions denied. You can use manual entry or test buttons below.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && cameraActive) {
      try {
        await scannerRef.current.stop();
      } catch (e) {}
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <QrCode className="w-3.5 h-3.5" />
            <span>Gate Verification Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            QR Scanner & Entrance Check-in
          </h1>
          <p className="text-sm text-slate-400">
            Verify digital ticket codes and record gate admissions atomically to prevent double entry.
          </p>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 rounded-xl bg-navy-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Chimes On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-500" />
              <span>Chimes Muted</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Verification Scanner Interface (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1.5 rounded-2xl bg-navy-900/90 border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('camera');
                setCameraError('');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'camera'
                  ? 'bg-purple-600 text-white shadow-glow-purple'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live Camera Scanner</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('manual');
                stopCamera();
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'manual'
                  ? 'bg-purple-600 text-white shadow-glow-purple'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Manual Code Entry</span>
            </button>
          </div>

          {/* Scanner Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
            {activeTab === 'camera' ? (
              <div className="space-y-5 text-center">
                {/* QR Video Viewport */}
                <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl bg-navy-950 border-2 border-dashed border-slate-700 overflow-hidden flex flex-col items-center justify-center">
                  <div id="qr-reader" className="w-full h-full"></div>

                  {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-3 bg-navy-950">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Camera className="w-7 h-7" />
                      </div>
                      <p className="text-xs text-slate-400">
                        Camera is currently inactive. Click below to activate live optical scanner.
                      </p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-glow-purple transition-all"
                      >
                        Start Camera Scanner
                      </button>
                    </div>
                  )}

                  {cameraActive && (
                    <div className="absolute top-3 right-3 z-20">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="py-1 px-3 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-md"
                      >
                        Stop Camera
                      </button>
                    </div>
                  )}
                </div>

                {cameraError && (
                  <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs text-left flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Manual Input Mode */
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Ticket Code or QR Payload
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    placeholder="e.g. TKT-AI26-9A8B7C or JSON scan string"
                    className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-700 text-white text-sm font-mono focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !ticketInput.trim()}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Database...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Verify & Check In</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Demo Test Barcodes */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Quick One-Click Test Cases:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTicketInput('TKT-AI26-9A8B7C');
                    executeVerification('TKT-AI26-9A8B7C');
                  }}
                  className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/60 text-left transition-all"
                >
                  <span className="text-[10px] font-bold text-emerald-400 block">1. Valid Ticket</span>
                  <span className="text-xs font-mono text-emerald-200">TKT-AI26...</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTicketInput('TKT-NEON-7X6Y5Z');
                    executeVerification('TKT-NEON-7X6Y5Z');
                  }}
                  className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/60 text-left transition-all"
                >
                  <span className="text-[10px] font-bold text-amber-400 block">2. Used Ticket</span>
                  <span className="text-xs font-mono text-amber-200">TKT-NEON...</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTicketInput('TKT-FAKE-999999');
                    executeVerification('TKT-FAKE-999999');
                  }}
                  className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/60 text-left transition-all"
                >
                  <span className="text-[10px] font-bold text-rose-400 block">3. Invalid Ticket</span>
                  <span className="text-xs font-mono text-rose-200">TKT-FAKE...</span>
                </button>
              </div>
            </div>
          </div>

          {/* Verification Result Banner */}
          {verificationResult && (
            <div
              className={`p-6 rounded-3xl border shadow-2xl backdrop-blur-xl animate-slide-up space-y-4 ${
                verificationResult.type === 'SUCCESS'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-100 shadow-emerald-950/50'
                  : verificationResult.type === 'WARNING'
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-100 shadow-amber-950/50'
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-100 shadow-rose-950/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    verificationResult.type === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : verificationResult.type === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {verificationResult.type === 'SUCCESS' ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : verificationResult.type === 'WARNING' ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <XCircle className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                      {verificationResult.status}
                    </span>
                    <span className="text-xs font-mono opacity-60">{verificationResult.timestamp}</span>
                  </div>
                  <h3 className="text-xl font-extrabold">{verificationResult.message}</h3>

                  {verificationResult.ticket && (
                    <div className="pt-3 mt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="opacity-70 block">Attendee:</span>
                        <strong className="font-semibold text-white">
                          {verificationResult.ticket.attendee?.name || 'Jordan Taylor'}
                        </strong>
                      </div>
                      <div>
                        <span className="opacity-70 block">Ticket Code:</span>
                        <strong className="font-mono text-white">
                          {verificationResult.ticket.ticketCode}
                        </strong>
                      </div>
                    </div>
                  )}

                  {verificationResult.usedAt && (
                    <div className="text-xs text-amber-300 font-semibold pt-1">
                      Previously checked in at: {new Date(verificationResult.usedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Gate Check-In History Feed (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-bold text-white">Recent Gate Scans</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{scanHistory.length} logged</span>
            </div>

            {scanHistory.length > 0 ? (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {scanHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-navy-950/70 border border-slate-800 flex items-center justify-between text-xs gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {item.type === 'SUCCESS' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : item.type === 'WARNING' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-white truncate max-w-[150px]">
                          {item.ticket?.attendee?.name || item.ticket?.ticketCode || 'Gate Entry'}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {item.ticket?.ticketCode || item.status}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          item.type === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : item.type === 'WARNING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                <QrCode className="w-8 h-8 mx-auto text-slate-600" />
                <p>No scans recorded yet during this gate session.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

