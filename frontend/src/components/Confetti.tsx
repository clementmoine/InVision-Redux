import React, { ReactElement, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ConfigType = {
  gravity: number;
  particle_count: number;
  particle_size: number;
  explosion_power: number;
  destroy_target: boolean;
  fade: boolean;
};

class Config implements ConfigType {
  gravity = 10;
  particle_count = 75;
  particle_size = 1;
  explosion_power = 25;
  destroy_target = true;
  fade = false;
}

class Vector {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

class Particle {
  size: Vector;
  position: Vector;
  velocity: Vector;
  rotation: number;
  rotation_speed: number;
  hue: number;
  opacity: number;
  lifetime: number;

  constructor(position: Vector) {
    this.size = new Vector(
      (16 * Math.random() + 4) * Confetti.CONFIG.particle_size,
      (4 * Math.random() + 4) * Confetti.CONFIG.particle_size,
    );
    this.position = new Vector(
      position.x - this.size.x / 2,
      position.y - this.size.y / 2,
    );
    this.velocity = Particle.generateVelocity();
    this.rotation = 360 * Math.random();
    this.rotation_speed = 10 * (Math.random() - 0.5);
    this.hue = 360 * Math.random();
    this.opacity = 100;
    this.lifetime = Math.random() + 0.25;
  }

  static generateVelocity(): Vector {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * Confetti.CONFIG.explosion_power;
    return new Vector(speed * Math.cos(angle), speed * Math.sin(angle));
  }

  update(deltaTime: number): void {
    this.velocity.y +=
      Confetti.CONFIG.gravity *
      (this.size.y / (10 * Confetti.CONFIG.particle_size)) *
      deltaTime;
    this.velocity.x += 25 * (Math.random() - 0.5) * deltaTime;
    this.velocity.y *= 0.98;
    this.velocity.x *= 0.98;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.rotation += this.rotation_speed;
    if (Confetti.CONFIG.fade) {
      this.opacity -= this.lifetime;
    }
  }

  checkBounds(): boolean {
    return this.position.y - 2 * this.size.x > 2 * window.innerHeight;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.translate(
      this.position.x + this.size.x / 2,
      this.position.y + this.size.y / 2,
    );
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.rect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
    ctx.fillStyle = `hsla(${this.hue}deg, 90%, 65%, ${this.opacity}%)`;
    ctx.fill();
    ctx.restore();
  }
}

class Burst {
  particles: Particle[];

  constructor(position: Vector) {
    this.particles = [];
    for (let i = 0; i < Confetti.CONFIG.particle_count; i++) {
      this.particles.push(new Particle(position));
    }
  }

  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(deltaTime);
      if (this.particles[i].checkBounds()) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const particle of this.particles) {
      particle.draw(ctx);
    }
  }
}

class Confetti {
  static CONFIG = new Config();
  bursts: Burst[];
  time: number;
  delta_time: number;
  element!: HTMLElement;
  static CTX: CanvasRenderingContext2D | null = null;

  constructor(id: string) {
    if (!id) {
      throw new Error('Missing id');
    }

    this.bursts = [];
    this.time = new Date().getTime();
    this.delta_time = 0;
    this.setupCanvasContext();
    this.setupElement(id);
    window.requestAnimationFrame(this.update);
  }

  setCount(count: number): void {
    if (typeof count !== 'number') {
      throw new Error("Input must be of type 'number'");
    }
    Confetti.CONFIG.particle_count = count;
  }

  setPower(power: number): void {
    if (typeof power !== 'number') {
      throw new Error("Input must be of type 'number'");
    }
    Confetti.CONFIG.explosion_power = power;
  }

  setSize(size: number): void {
    if (typeof size !== 'number') {
      throw new Error("Input must be of type 'number'");
    }
    Confetti.CONFIG.particle_size = size;
  }

  setFade(fade: boolean): void {
    if (typeof fade !== 'boolean') {
      throw new Error("Input must be of type 'boolean'");
    }
    Confetti.CONFIG.fade = fade;
  }

  destroyTarget(destroy: boolean): void {
    if (typeof destroy !== 'boolean') {
      throw new Error("Input must be of type 'boolean'");
    }
    Confetti.CONFIG.destroy_target = destroy;
  }

  setupCanvasContext(): void {
    if (!Confetti.CTX) {
      const canvas = document.createElement('canvas');
      Confetti.CTX = canvas.getContext('2d');
      if (Confetti.CTX) {
        canvas.width = 2 * window.innerWidth;
        canvas.height = 2 * window.innerHeight;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = 'calc(100%)';
        canvas.style.height = 'calc(100%)';
        canvas.style.margin = '0';
        canvas.style.padding = '0';
        canvas.style.zIndex = '999999999';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
        window.addEventListener('resize', () => {
          canvas.width = 2 * window.innerWidth;
          canvas.height = 2 * window.innerHeight;
        });
      }
    }
  }

  setupElement(id: string): void {
    this.element = document.getElementById(id)!;
    if (this.element) {
      this.element.addEventListener('click', event => {
        const position = new Vector(2 * event.clientX, 2 * event.clientY);
        this.bursts.push(new Burst(position));
        if (Confetti.CONFIG.destroy_target) {
          this.element.style.visibility = 'hidden';
        }
      });
    }
  }

  update = (time: number): void => {
    this.delta_time = (time - this.time) / 1000;
    this.time = time;
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      this.bursts[i].update(this.delta_time);
      if (this.bursts[i].particles.length === 0) {
        this.bursts.splice(i, 1);
      }
    }
    this.draw();
    window.requestAnimationFrame(this.update);
  };

  draw(): void {
    if (Confetti.CTX) {
      Confetti.CTX.clearRect(
        0,
        0,
        2 * window.innerWidth,
        2 * window.innerHeight,
      );
      for (const burst of this.bursts) {
        burst.draw(Confetti.CTX);
      }
    }
  }
}

type ConfettiProps = {
  id: string;
  config?: Config;
  children: ReactElement;
};

const ConfettiComponent: React.FC<ConfettiProps> = ({ id, children }) => {
  const confettiRef = useRef<Confetti | null>(null);

  useEffect(() => {
    if (id) {
      confettiRef.current = new Confetti(id);

      confettiRef.current.destroyTarget(false);
    }
    return () => {
      confettiRef.current = null;
    };
  }, [id]);

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <div id={id} className="flex">
          {children}
        </div>
      </TooltipTrigger>

      <TooltipContent side="top" sideOffset={5}>
        Celebrate with confetti! 🎉
      </TooltipContent>
    </Tooltip>
  );
};

export default ConfettiComponent;
