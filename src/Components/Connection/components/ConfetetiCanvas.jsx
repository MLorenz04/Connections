import React, { useRef, useEffect } from "react";
import Heart from "../../../images/Heart.png";
const ConfettiCanvas = ({ isActive, images = [Heart] }) => {
  // Create a reference for the canvas element
  const canvasRef = useRef(null);
  // Variable to store the requestAnimationFrame ID
  const animationFrameId = useRef(0);

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const updateCanvasSize = () => {
      // Set the canvas size to the document's dimensions
      canvas.width = document.documentElement.scrollWidth;
      canvas.height = document.documentElement.scrollHeight;
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    window.addEventListener("scroll", updateCanvasSize);

    // Arrays to hold the confetti particles and loaded images
    let confettiParticles = [];
    const loadedImages = [];
    let imagesLoaded = 0;

    images.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        imagesLoaded++;
        loadedImages.push(img);
        if (imagesLoaded === images.length) {
          createConfettiParticles();
        }
      };
      img.onerror = () => {
        console.error("Failed to load image", src);
      };
      img.src = src;
    });

    const createConfettiParticles = () => {
      confettiParticles = [];
      for (let i = 0; i < 100; i++) {
        confettiParticles.push(createParticle(true));
        confettiParticles.push(createParticle(false));
      }
      animate();
    };

    const createParticle = (fromLeft) => {
      return {
        x: fromLeft ? -30 : canvas.width + 30,
        y: Math.random() * canvas.height,
        size: Math.random() * 90,
        rotation: Math.random() * 360,
        speedX: fromLeft ? Math.random() * 20 : -(Math.random() * 20 + 1),
        speedY: Math.random() * 10 - 25,
        gravity: 0.3,
        img: loadedImages[Math.floor(Math.random() * loadedImages.length)],
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiParticles.forEach((particle) => {
        particle.speedY += particle.gravity;
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.rotation += 2;
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.drawImage(particle.img, -particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.restore();
      });

      if (isActive && confettiParticles.length > 0) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    return () => {
      confettiParticles = [];
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("scroll", updateCanvasSize);
    };
  }, [isActive, images]);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 1000 }}></canvas>;
};

export default ConfettiCanvas;
