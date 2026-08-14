import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { Video, VideoOff, Mic, MicOff, Camera, PhoneOff, ArrowLeft, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const VideoCallPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);

  const [appointment, setAppointment] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const apptData = await appointmentService.getAppointmentByBookingId(bookingId);
        setAppointment(apptData);

        // Security authorization check
        if (user) {
          const currentUserId = Number(user.id || user.userId || localStorage.getItem('userId'));
          const isAssignedPatient = apptData.patientId && Number(apptData.patientId) === currentUserId;
          const isAssignedDoctor = (apptData.doctorUserId && Number(apptData.doctorUserId) === currentUserId) || 
                                   (user.userType === 'doctor' && (!apptData.doctorUserId || Number(apptData.doctorUserId) === currentUserId));

          if (!isAssignedPatient && !isAssignedDoctor) {
            setError('Access Denied: You are not authorized to join this consultation.');
            toast.error('Access Denied to consultation room.');
            setLoading(false);
            return;
          }
        }

        // Get local media stream
        let localStream;
        try {
          localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (mediaErr) {
          console.warn('Camera/Mic permission warning:', mediaErr);
          toast.error('Camera/Microphone access error. Operating in preview mode.');
        }

        if (localStream) {
          setStream(localStream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        }

        // Setup WebRTC peer connection
        const pc = new RTCPeerConnection(rtcConfig);
        pcRef.current = pc;

        if (localStream) {
          localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
        }

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
            setConnected(true);
          }
        };

        // Setup WebSocket signaling
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.hostname;
        const wsPort = window.location.port === '3000' ? '8085' : window.location.port || '8085';
        const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/ws-video?bookingId=${bookingId}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        pc.onicecandidate = (event) => {
          if (event.candidate && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
          }
        };

        ws.onopen = () => {
          console.log('WebSocket signaling connected for room:', bookingId);
          ws.send(JSON.stringify({ type: 'join' }));

          // Doctor or caller creates offer
          if (user?.userType === 'doctor') {
            pc.createOffer()
              .then((offer) => pc.setLocalDescription(offer))
              .then(() => {
                ws.send(JSON.stringify({ type: 'offer', sdp: pc.localDescription }));
              })
              .catch((err) => console.error('Error creating WebRTC offer:', err));
          }
        };

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(JSON.stringify({ type: 'answer', sdp: pc.localDescription }));
              setConnected(true);
            } else if (data.type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              setConnected(true);
            } else if (data.type === 'candidate' && data.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          } catch (ex) {
            console.error('Signaling error:', ex);
          }
        };

      } catch (err) {
        console.error('Initialization error:', err);
        setError('Appointment session not found or unavailable.');
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [bookingId]);

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
    const videoElem = localVideoRef.current;
    if (!videoElem) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoElem.videoWidth || 640;
    canvas.height = videoElem.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `consultation_snapshot_${bookingId}.png`;
    a.click();
    toast.success('Clinical Snapshot Saved!');
  };

  const leaveCall = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    if (wsRef.current) {
      wsRef.current.close();
    }

    if (user?.userType === 'doctor') {
      navigate('/doctor-dashboard');
    } else {
      navigate('/patient-dashboard');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ background: '#0f172a', minHeight: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00835f] mx-auto mb-4"></div>
          <p>Initializing Secure Encrypted Video Call Room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper" style={{ background: '#0f172a', minHeight: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '32px', background: '#1e293b', borderRadius: '20px' }}>
          <h3 style={{ color: '#ffb4ab', fontSize: '20px', marginBottom: '12px' }}>Consultation Error</h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Return to Safety</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ background: '#0f172a', minHeight: 'calc(100vh - 70px)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="container" style={{ maxWidth: '1000px', width: '100%' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ color: 'white', fontSize: '20px', margin: 0 }}>CareConnect Video Consultation</h3>
              <span className="bg-[#ccf2e3] text-[#00835f] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                HD Encrypted
              </span>
            </div>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Booking #{bookingId} &bull; Doctor: <strong>{appointment?.doctorName}</strong> &bull; Patient: <strong>{appointment?.patientName}</strong>
            </span>
          </div>

          <button className="btn btn-outline" style={{ color: 'white', borderColor: '#334155' }} onClick={leaveCall}>
            <ArrowLeft size={16} /> Exit Room
          </button>
        </div>

        {/* Video Canvas Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '540px',
          background: '#1e293b',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          border: '1px solid #334155'
        }}>
          
          {/* Main Remote Stream Video Element */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: remoteStream ? 'block' : 'none'
            }}
          />

          {/* Remote Peer Placeholder when connecting */}
          {!remoteStream && (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)'
            }}>
              <img
                src="/images/doctor.png"
                alt="Doctor"
                style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #00835f', marginBottom: '16px' }}
              />
              <h4 style={{ color: 'white', fontSize: '22px', margin: '0 0 6px 0' }}>
                {user?.userType === 'doctor' ? appointment?.patientName : appointment?.doctorName}
              </h4>
              <span style={{ color: '#38bdf8', fontSize: '14px' }}>
                {connected ? 'Remote stream live' : 'Waiting for practitioner/patient to join room...'}
              </span>
            </div>
          )}

          {/* Local Stream PIP Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '220px',
            height: '150px',
            background: '#000',
            borderRadius: '16px',
            border: '2px solid #00835f',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.7)'
          }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: '6px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', color: 'white' }}>
              You ({user?.name?.split(' ')[0]})
            </div>
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
          <button
            onClick={toggleMic}
            className={`btn ${micOn ? 'btn-secondary' : 'btn-danger'}`}
            style={{ borderRadius: '50%', width: '52px', height: '52px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={micOn ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micOn ? <Mic size={22} /> : <MicOff size={22} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`btn ${videoOn ? 'btn-secondary' : 'btn-danger'}`}
            style={{ borderRadius: '50%', width: '52px', height: '52px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={videoOn ? "Turn Camera Off" : "Turn Camera On"}
          >
            {videoOn ? <Video size={22} /> : <VideoOff size={22} />}
          </button>

          <button
            onClick={takeSnapshot}
            className="btn btn-secondary"
            style={{ borderRadius: '50%', width: '52px', height: '52px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Take Clinical Snapshot"
          >
            <Camera size={22} />
          </button>

          <button
            onClick={leaveCall}
            className="btn btn-danger"
            style={{ borderRadius: '30px', padding: '0 28px', height: '52px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}
          >
            <PhoneOff size={20} /> End Call
          </button>
        </div>
      </div>
    </div>
  );
};
