import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, Camera, PhoneOff, ArrowLeft } from 'lucide-react';

export const VideoCallPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('Media devices camera access error:', err);
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoOn;
        setVideoOn(!videoOn);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micOn;
        setMicOn(!micOn);
      }
    }
  };

  const takeSnapshot = () => {
    if (!localVideoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = localVideoRef.current.videoWidth || 640;
    canvas.height = localVideoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(localVideoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `snapshot_${bookingId}.png`;
    a.click();
  };

  const leaveCall = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    navigate('/');
  };

  return (
    <div className="page-wrapper" style={{ background: '#0f172a', minHeight: 'calc(100vh - 70px)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ color: 'white', fontSize: '18px' }}>CareConnect Video Consultation</h3>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Session Booking ID: #{bookingId}</span>
          </div>
          <button className="btn btn-outline" style={{ color: 'white', borderColor: '#334155' }} onClick={leaveCall}>
            <ArrowLeft size={16} /> Exit Room
          </button>
        </div>

        {/* Video Canvas Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '520px',
          background: '#1e293b',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          {/* Doctor Remote Stream Poster */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            background: 'radial-gradient(circle, #334155 0%, #0f172a 100%)'
          }}>
            <img src="/images/doctor.png" alt="Doctor" style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid var(--primary)', marginBottom: '16px' }} />
            <h4 style={{ color: 'white', fontSize: '20px' }}>Remote Practitioner Stream</h4>
            <span style={{ color: '#38bdf8', fontSize: '14px', marginTop: '4px' }}>Connecting HD Audio / Video...</span>
          </div>

          {/* Patient Local Stream Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '200px',
            height: '140px',
            background: '#000',
            borderRadius: '12px',
            border: '2px solid var(--primary)',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
          }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Control Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
          <button
            onClick={toggleMic}
            className={`btn ${micOn ? 'btn-secondary' : 'btn-danger'}`}
            style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0 }}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`btn ${videoOn ? 'btn-secondary' : 'btn-danger'}`}
            style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0 }}
          >
            {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            onClick={takeSnapshot}
            className="btn btn-secondary"
            style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0 }}
            title="Take Snapshot"
          >
            <Camera size={20} />
          </button>

          <button
            onClick={leaveCall}
            className="btn btn-danger"
            style={{ borderRadius: '30px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <PhoneOff size={18} /> Leave Call
          </button>
        </div>
      </div>
    </div>
  );
};
