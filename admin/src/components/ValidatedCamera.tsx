import React, { useRef, useState, useEffect, useCallback } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
} from '@mui/material'
import {
  PhotoCamera as CameraIcon,
  Close as CloseIcon,
  CheckCircle as ValidIcon,
  Error as InvalidIcon,
} from '@mui/icons-material'

interface ValidatedCameraProps {
  open: boolean
  onClose: () => void
  onCapture: (file: File) => void
  label: string
  silhouetteImg?: string
  expectedType: 'car' | 'dashboard'
}

const ValidatedCamera = ({
  open,
  onClose,
  onCapture,
  label,
  silhouetteImg,
  expectedType
}: ValidatedCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null)
  const [loadingModel, setLoadingModel] = useState(false)
  const [isCamerReady, setIsCameraReady] = useState(false)
  const [validCount, setValidCount] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)

  // Load Model
  useEffect(() => {
    if (open && !model && !loadingModel) {
      const loadModel = async () => {
        setLoadingModel(true)
        try {
          await tf.ready()
          const loadedModel = await mobilenet.load({ version: 2, alpha: 1.0 })
          setModel(loadedModel)
        } catch (err) {
          console.error('Failed to load MobileNet', err)
        } finally {
          setLoadingModel(false)
        }
      }
      loadModel()
    }
  }, [open, model, loadingModel])

  const [cameraError, setCameraError] = useState(false)
  const isReadyRef = useRef(false)
  const isStartingRef = useRef(false)

  // Camera Setup
  useEffect(() => {
    let stream: MediaStream | null = null
    setCameraError(false)
    isReadyRef.current = false

    const startCamera = async () => {
      if (isStartingRef.current) {
        return
      }
      isStartingRef.current = true
      
      try {
        const constraints = {
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        }
        stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error('Play error', e))
            setIsCameraReady(true)
            isReadyRef.current = true
          }
        }
      } catch (err) {
        console.warn('Environment camera failed, trying fallback...', err)
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(e => console.error('Play fallback error', e))
              setIsCameraReady(true)
              isReadyRef.current = true
            }
          }
        } catch (err2) {
          console.error('Final camera access error', err2)
          setCameraError(true)
        }
      } finally {
        isStartingRef.current = false
      }
    }

    if (open) {
      const timer = setTimeout(() => {
        if (!isReadyRef.current) {
          setCameraError(true)
        }
      }, 8000)

      startCamera()
      return () => {
        clearTimeout(timer)
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
        setIsCameraReady(false)
        isReadyRef.current = false
        isStartingRef.current = false
      }
    }
  }, [open])

  const reset = useCallback(() => {
    setIsSuccess(false)
    setValidCount(0)
  }, [])

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current && !isSuccess) {
      setIsSuccess(true)
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `${label}.jpg`, { type: 'image/jpeg' })
            onCapture(file)
            setTimeout(() => {
               onClose()
               reset()
            }, 800)
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }, [label, onCapture, onClose, reset, isSuccess])

  // Detection Loop
  useEffect(() => {
    let animationId: number
    const runDetection = async () => {
      if (model && videoRef.current && isCamerReady && !isSuccess) {
        try {
          const predictions = await model.classify(videoRef.current)
          if (predictions.length > 0) {
            const top = predictions[0]

            const className = top.className.toLowerCase()
            const isCar = className.includes('car') || 
                          className.includes('vehicle') ||
                          className.includes('truck') ||
                          className.includes('pickup') ||
                          className.includes('jeep') ||
                          className.includes('suv') ||
                          className.includes('minivan') ||
                          className.includes('wagon') ||
                          className.includes('cab') ||
                          className.includes('limousine') ||
                          className.includes('convertible') ||
                          className.includes('coupe') ||
                          className.includes('grille') ||
                          className.includes('wheel') ||
                          className.includes('tow truck') ||
                          className.includes('racer') ||
                          className.includes('model t')

            const isDash = className.includes('odometer') || 
                           className.includes('speedometer') ||
                           className.includes('dashboard') ||
                           className.includes('dial') ||
                           className.includes('meter') ||
                           className.includes('analog clock') ||
                           className.includes('magnetic compass') ||
                           className.includes('combination lock')

            const targetMet = expectedType === 'car' ? isCar : isDash

            if (targetMet && top.probability > 0.25) { // Lowered threshold for faster detection
              setValidCount((prev) => prev + 1)
            } else {
              setValidCount(0)
            }
          }
        } catch (err) {
          console.error('Detection error', err)
        }
      }
      animationId = requestAnimationFrame(runDetection)
    }

    if (open) {
      runDetection()
    }

    return () => cancelAnimationFrame(animationId)
  }, [open, model, isCamerReady, expectedType, isSuccess])

  // Automatic capture
  useEffect(() => {
    if (validCount >= 15) { 
      handleCapture()
    }
  }, [validCount, handleCapture])

  return (
    <Dialog open={open} fullScreen onClose={onClose}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{label}</Typography>
        <Button onClick={onClose} color="inherit"><CloseIcon /></Button>
      </DialogTitle>
      <DialogContent sx={{ p: 0, position: 'relative', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {loadingModel && (
          <div style={{ position: 'absolute', zIndex: 10, textAlign: 'center', color: '#fff' }}>
            <CircularProgress color="inherit" />
            <Typography sx={{ mt: 2 }}>Cargando IA de validación...</Typography>
          </div>
        )}

        {cameraError && !isCamerReady && (
          <div style={{ position: 'absolute', zIndex: 11, textAlign: 'center', color: '#fff', padding: 20 }}>
            <InvalidIcon sx={{ fontSize: 50, color: '#ff1744' }} />
            <Typography sx={{ mt: 2, fontWeight: 'bold' }}>Error al acceder a la cámara</Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
              Asegúrate de dar permisos de cámara y que ninguna otra app la esté usando.
            </Typography>
            <Button 
                variant="outlined" 
                color="inherit" 
                sx={{ mt: 3 }} 
                onClick={() => window.location.reload()}
            >
              Reintentar / Recargar
            </Button>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {silhouetteImg && !isSuccess && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', opacity: 0.4
          }}>
            <img 
                src={silhouetteImg} 
                alt="guia" 
                style={{ 
                    maxWidth: '80%', 
                    maxHeight: '80%', 
                    filter: 'invert(1) grayscale(1) brightness(2)'
                }} 
            />
          </div>
        )}

        <div style={{
          position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: 30,
          color: '#fff', display: 'flex', alignItems: 'center', gap: 10,
          border: validCount > 0 ? '2px solid #4CAF50' : '2px solid transparent',
          transition: 'all 0.3s',
          whiteSpace: 'nowrap'
        }}>
          {validCount > 0 ? <ValidIcon color="success" /> : <InvalidIcon color="error" />}
          <Typography variant="body2">
            {expectedType === 'car' 
              ? (validCount > 0 ? '¡Vehículo Detectado!' : 'Buscando vehículo...')
              : (validCount > 0 ? '¡Tablero/Odómetro Detectado!' : 'Buscando odómetro/tablero...')
            }
          </Typography>
        </div>

        {isSuccess && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(76, 175, 80, 0.4)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 20
          }}>
             <div style={{ textAlign: 'center', color: '#fff' }}>
                 <ValidIcon sx={{ fontSize: 80 }} />
                 <Typography variant="h4" sx={{ fontWeight: 'bold' }}>¡Capturado!</Typography>
             </div>
          </div>
        )}

        <div style={{
           position: 'absolute', bottom: 20, width: '100%', textAlign: 'center', color: '#fff'
        }}>
           <Typography variant="caption" sx={{ opacity: 0.7 }}>
             La IA validará automáticamente la foto cuando esté bien encuadrada.
           </Typography>
        </div>

      </DialogContent>
      <DialogActions sx={{ p: 2, background: '#121212' }}>
        <Button 
            variant="contained" 
            fullWidth 
            size="large" 
            startIcon={<CameraIcon />}
            onClick={handleCapture}
            disabled={!isCamerReady || loadingModel || isSuccess}
            sx={{ borderRadius: 10, py: 1.5 }}
        >
          Capturar Manualmente
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ValidatedCamera
