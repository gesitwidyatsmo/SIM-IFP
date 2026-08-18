'use client'

import { useEffect, useRef } from 'react'

export default function InteractiveBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Posisi target interaktif (mouse) & posisi saat ini (smooth lerp)
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isMoving: false,
    }

    // Definisi orbs / floating mesh nodes dengan warna pastel edukatif
    const blobs = [
      {
        baseX: width * 0.25,
        baseY: height * 0.25,
        x: width * 0.25,
        y: height * 0.25,
        vx: 0.35,
        vy: 0.25,
        radius: Math.min(width, height) * 0.38,
        color: 'rgba(254, 240, 138, 0.55)', // Soft Highlighter Yellow
        phase: 0,
      },
      {
        baseX: width * 0.75,
        baseY: height * 0.3,
        x: width * 0.75,
        y: height * 0.3,
        vx: -0.3,
        vy: 0.35,
        radius: Math.min(width, height) * 0.42,
        color: 'rgba(191, 219, 254, 0.60)', // Soft Academic Blue
        phase: Math.PI / 3,
      },
      {
        baseX: width * 0.65,
        baseY: height * 0.75,
        x: width * 0.65,
        y: height * 0.75,
        vx: 0.25,
        vy: -0.3,
        radius: Math.min(width, height) * 0.36,
        color: 'rgba(167, 243, 208, 0.50)', // Soft Tutorial Mint Green
        phase: (Math.PI * 2) / 3,
      },
      {
        baseX: width * 0.2,
        baseY: height * 0.8,
        x: width * 0.2,
        y: height * 0.8,
        vx: -0.2,
        vy: -0.25,
        radius: Math.min(width, height) * 0.35,
        color: 'rgba(254, 215, 170, 0.45)', // Soft Folder Peach / Coral
        phase: Math.PI,
      },
      {
        baseX: width * 0.5,
        baseY: height * 0.5,
        x: width * 0.5,
        y: height * 0.5,
        vx: 0.2,
        vy: 0.2,
        radius: Math.min(width, height) * 0.3,
        color: 'rgba(233, 213, 255, 0.45)', // Soft Activity Lavender
        phase: (Math.PI * 4) / 3,
      },
    ]

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      blobs.forEach((blob, idx) => {
        blob.radius = Math.min(width, height) * (0.3 + (idx % 3) * 0.05)
      })
    }

    const handlePointerMove = (e) => {
      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
      mouse.isMoving = true
    }

    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    let time = 0

    const render = () => {
      time += 0.008

      // Smooth mouse interpolation (lerp)
      mouse.x += (mouse.targetX - mouse.x) * 0.04
      mouse.y += (mouse.targetY - mouse.y) * 0.04

      // Bersihkan canvas dengan warna dasar kertas hangat
      ctx.fillStyle = '#FFFDF5'
      ctx.fillRect(0, 0, width, height)

      // Gambar masing-masing mesh blob dengan radial gradient yang menyatu
      blobs.forEach((blob, i) => {
        // Natural organic floating motion
        const floatX = Math.sin(time + blob.phase) * (width * 0.08)
        const floatY = Math.cos(time * 0.9 + blob.phase) * (height * 0.08)

        // Mouse reactive pull (reaksi magnetik lembut terhadap kursor)
        const dx = mouse.x - blob.baseX
        const dy = mouse.y - blob.baseY
        const mouseEffect = Math.sin(time + i) * 0.08 + 0.12

        blob.x = blob.baseX + floatX + dx * mouseEffect
        blob.y = blob.baseY + floatY + dy * mouseEffect

        // Radial gradient mesh
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          blob.radius * 0.05,
          blob.x,
          blob.y,
          blob.radius
        )
        gradient.addColorStop(0, blob.color)
        gradient.addColorStop(0.55, blob.color.replace(/[\d.]+\)$/, '0.25)'))
        gradient.addColorStop(1, 'rgba(255, 253, 245, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block filter blur-[36px] sm:blur-[48px] transform-gpu scale-105"
      />
      {/* Subtle paper grain / ambient warmth overlay */}
      <div 
        className="absolute inset-0 bg-[#FFFDF5]/30 backdrop-contrast-[1.02] pointer-events-none"
      />
    </div>
  )
}
