import React, { useState } from 'react'

interface ImageDiffSliderProps {
  img1: string
  img2: string
}

const ImageDiffSlider = ({ img1, img2 }: ImageDiffSliderProps) => {
  const [sliderPos, setSliderPos] = useState(50)

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const container = e.currentTarget.getBoundingClientRect()
    let x = 0
    if ('touches' in e) {
      x = e.touches[0].pageX - container.left
    } else {
      x = e.pageX - container.left
    }
    const pos = (x / container.width) * 100
    setSliderPos(Math.min(Math.max(pos, 0), 100))
  }

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '400px', 
        overflow: 'hidden', 
        cursor: 'ew-resize',
        borderRadius: 8,
        border: '1px solid #ddd'
      }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
    >
      {/* Base Image (New / In) */}
      <img 
        src={img2} 
        alt="Ingreso" 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
      />
      
      {/* Overlay Image (Old / Out) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${sliderPos}%`,
        height: '100%',
        overflow: 'hidden',
        borderRight: '2px solid #fff',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
      }}>
        <img 
          src={img1} 
          alt="Salida" 
          style={{ width: 'unset', height: '400px', objectFit: 'contain', display: 'block', maxWidth: 'none' }} 
        />
      </div>

      {/* Labels */}
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>SALIDA</div>
      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>INGRESO</div>
      
      {/* Handle */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: `${sliderPos}%`,
        transform: 'translate(-50%, -50%)',
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: '#fff',
        border: '2px solid #1976d2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        color: '#1976d2',
        pointerEvents: 'none',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        ↔
      </div>
    </div>
  )
}

export default ImageDiffSlider
