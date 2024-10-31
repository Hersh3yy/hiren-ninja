<template>
  <canvas ref="canvas" class="absolute top-0 left-0 w-full h-full"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const canvas = ref(null);
let fractalClock = null;

onMounted(() => {
  const FractalClock = class {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.settings = {
        colour: {
          background: [0, 0, 0],
          line: [251, 246, 226],
        },
        depth: 10,
        lineWidth: 2,
        scale: 0.9,
        opacity: 0.6,
      };

      this.isPaused = false;
      this.setCanvasDimensions();
      this.animate();

      window.addEventListener("resize", this.setCanvasDimensions.bind(this));
    }

    setCanvasDimensions() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    animate() {
      if (!this.isPaused) {
        requestAnimationFrame(this.animate.bind(this));
        this.updateAngles();
        this.draw();
      }
    }

    updateAngles() {
      const date = new Date();
      const seconds =
        (date.getSeconds() * 1000 + date.getMilliseconds()) / 1000;
      const minutes = date.getMinutes() + seconds / 60;
      const hours = (date.getHours() % 12) + minutes / 60;

      this.angle = {
        second: this.ratioToRadians(seconds / 60),
        minute: this.ratioToRadians(minutes / 60),
        hour: this.ratioToRadians(hours / 12),
      };
    }

    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1;
      this.ctx.strokeStyle = `rgb(${this.settings.colour.line.join()})`;
      this.ctx.lineWidth = this.settings.lineWidth;

      const centre = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
      };

      const length = Math.min(this.canvas.width, this.canvas.height) / 4;

      this.ctx.beginPath();
      this.ctx.moveTo(centre.x, centre.y);
      this.ctx.lineTo(
        centre.x + (Math.cos(this.angle.hour) * length) / 2,
        centre.y + (Math.sin(this.angle.hour) * length) / 2
      );
      this.ctx.stroke();

      this.drawMinuteSecond(this.settings.depth, length, centre, 1, 0);
    }

    drawMinuteSecond(count, length, centre, alpha, angle) {
      this.ctx.globalAlpha = alpha;

      this.ctx.beginPath();
      this.ctx.moveTo(centre.x, centre.y);
      this.ctx.lineTo(
        centre.x + Math.cos(this.angle.second + angle) * length,
        centre.y + Math.sin(this.angle.second + angle) * length
      );
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(centre.x, centre.y);
      this.ctx.lineTo(
        centre.x + Math.cos(this.angle.minute + angle) * length,
        centre.y + Math.sin(this.angle.minute + angle) * length
      );
      this.ctx.stroke();

      if (count > 0) {
        this.drawMinuteSecond(
          count - 1,
          length * this.settings.scale,
          {
            x: centre.x + Math.cos(this.angle.second + angle) * length,
            y: centre.y + Math.sin(this.angle.second + angle) * length,
          },
          alpha * this.settings.opacity,
          this.angle.second - this.angle.hour - Math.PI + angle
        );
        this.drawMinuteSecond(
          count - 1,
          length * this.settings.scale,
          {
            x: centre.x + Math.cos(this.angle.minute + angle) * length,
            y: centre.y + Math.sin(this.angle.minute + angle) * length,
          },
          alpha * this.settings.opacity,
          this.angle.minute - this.angle.hour - Math.PI + angle
        );
      }
    }

    ratioToRadians(value) {
      return value * 2 * Math.PI - Math.PI / 2;
    }
  };

  fractalClock = new FractalClock(canvas.value);
});

onUnmounted(() => {
  if (fractalClock) {
    fractalClock.isPaused = true;
    window.removeEventListener("resize", fractalClock.setCanvasDimensions);
  }
});
</script>
