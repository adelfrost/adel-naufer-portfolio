/**
 * ImageTrail — GSAP-powered cursor image trail (JSX port).
 * Images follow the pointer with one of 8 animation variants.
 * Ported from the TypeScript reference; types stripped, behaviour identical.
 *
 *   1 Classic Lerp   2 Luminous Bloom   3 Ethereal Ascent   4 Motion Drift
 *   5 Angular Flow   6 Kinetic Blur     7 Depth Stack        8 3D Perspective
 */
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

function getLocalPointerPos(e, rect) {
  let clientX = 0, clientY = 0;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ('clientX' in e) {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function getMouseDistance(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

class ImageItem {
  constructor(DOM_el) {
    this.DOM = { el: DOM_el, inner: null };
    this.defaultStyle = { scale: 1, x: 0, y: 0, opacity: 0 };
    this.rect = null;
    this.DOM.inner = this.DOM.el.querySelector('.content__img-inner');
    this.getRect();
    this.initEvents();
  }
  initEvents() {
    this.resize = () => {
      gsap.set(this.DOM.el, this.defaultStyle);
      this.getRect();
    };
    window.addEventListener('resize', this.resize);
  }
  getRect() {
    this.rect = this.DOM.el.getBoundingClientRect();
  }
  destroy() {
    gsap.killTweensOf(this.DOM.el);
    gsap.killTweensOf(this.DOM.inner);
    window.removeEventListener('resize', this.resize);
  }
}

class ImageTrailBase {
  constructor(container) {
    this.container = container;
    this.images = [...container.querySelectorAll('.content__img')].map((img) => new ImageItem(img));
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;
    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };
    this.rafId = null;

    this.handlePointerMove = (ev) => {
      const rect = this.container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener('mousemove', this.handlePointerMove);
    container.addEventListener('touchmove', this.handlePointerMove);

    this.initRender = (ev) => {
      const rect = this.container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };
      this.rafId = requestAnimationFrame(() => this.render());
      container.removeEventListener('mousemove', this.initRender);
      container.removeEventListener('touchmove', this.initRender);
    };
    container.addEventListener('mousemove', this.initRender);
    container.addEventListener('touchmove', this.initRender);
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }
  onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) this.isIdle = true;
  }

  destroy() {
    this.destroyed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.container.removeEventListener('mousemove', this.handlePointerMove);
    this.container.removeEventListener('touchmove', this.handlePointerMove);
    this.container.removeEventListener('mousemove', this.initRender);
    this.container.removeEventListener('touchmove', this.initRender);
    this.images.forEach((img) => img.destroy());
  }
}

class ImageTrailVariant1 extends ImageTrailBase {
  render() {
    if (this.destroyed) return;
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    this.rafId = requestAnimationFrame(() => this.render());
  }
  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    gsap.timeline({ onStart: () => this.onImageActivated(), onComplete: () => this.onImageDeactivated() })
      .fromTo(img.DOM.el, {
        opacity: 1, scale: 1, zIndex: this.zIndexVal,
        x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2,
      }, {
        duration: 0.4, ease: 'power1',
        x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.mousePos.y - (img.rect?.height ?? 0) / 2,
      }, 0)
      .to(img.DOM.el, { duration: 0.4, ease: 'power3', opacity: 0, scale: 0.2 }, 0.4);
  }
}

class ImageTrailVariant2 extends ImageTrailBase {
  render() {
    if (this.destroyed) return;
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    this.rafId = requestAnimationFrame(() => this.render());
  }
  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    gsap.timeline({ onStart: () => this.onImageActivated(), onComplete: () => this.onImageDeactivated() })
      .fromTo(img.DOM.el, {
        opacity: 1, scale: 0, zIndex: this.zIndexVal,
        x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2,
      }, {
        duration: 0.4, ease: 'power1', scale: 1,
        x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.mousePos.y - (img.rect?.height ?? 0) / 2,
      }, 0)
      .fromTo(img.DOM.inner, { scale: 2.8, filter: 'brightness(250%)' }, {
        duration: 0.4, ease: 'power1', scale: 1, filter: 'brightness(100%)',
      }, 0)
      .to(img.DOM.el, { duration: 0.4, ease: 'power2', opacity: 0, scale: 0.2 }, 0.45);
  }
}

class ImageTrailVariant3 extends ImageTrailBase {
  render() {
    if (this.destroyed) return;
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    this.rafId = requestAnimationFrame(() => this.render());
  }
  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    gsap.timeline({ onStart: () => this.onImageActivated(), onComplete: () => this.onImageDeactivated() })
      .fromTo(img.DOM.el, {
        opacity: 1, scale: 0, zIndex: this.zIndexVal, xPercent: 0, yPercent: 0,
        x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2,
      }, {
        duration: 0.4, ease: 'power1', scale: 1,
        x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.mousePos.y - (img.rect?.height ?? 0) / 2,
      }, 0)
      .to(img.DOM.el, {
        duration: 0.6, ease: 'power2', opacity: 0, scale: 0.2,
        xPercent: () => gsap.utils.random(-30, 30), yPercent: -200,
      }, 0.6);
  }
}

class ImageTrailVariant4 extends ImageTrailBase {
  render() {
    if (this.destroyed) return;
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    this.rafId = requestAnimationFrame(() => this.render());
  }
  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    let dx = this.mousePos.x - this.cacheMousePos.x;
    let dy = this.mousePos.y - this.cacheMousePos.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist !== 0) { dx /= dist; dy /= dist; }
    dx *= dist / 100; dy *= dist / 100;
    gsap.timeline({ onStart: () => this.onImageActivated(), onComplete: () => this.onImageDeactivated() })
      .fromTo(img.DOM.el, {
        opacity: 1, scale: 0, zIndex: this.zIndexVal,
        x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2,
      }, {
        duration: 0.4, ease: 'power1', scale: 1,
        x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.mousePos.y - (img.rect?.height ?? 0) / 2,
      }, 0)
      .fromTo(img.DOM.inner, {
        scale: 2,
        filter: `brightness(${Math.max((400 * dist) / 100, 100)}%) contrast(${Math.max((400 * dist) / 100, 100)}%)`,
      }, {
        duration: 0.4, ease: 'power1', scale: 1, filter: 'brightness(100%) contrast(100%)',
      }, 0)
      .to(img.DOM.el, { duration: 0.4, ease: 'power3', opacity: 0 }, 0.4)
      .to(img.DOM.el, { duration: 1.5, ease: 'power4', x: `+=${dx * 110}`, y: `+=${dy * 110}` }, 0.05);
  }
}

class ImageTrailVariant5 extends ImageTrailBase {
  constructor(c) { super(c); this.lastAngle = 0; }
  render() {
    if (this.destroyed) return;
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    this.rafId = requestAnimationFrame(() => this.render());
  }
  showNextImage() {
    let dx = this.mousePos.x - this.cacheMousePos.x;
    let dy = this.mousePos.y - this.cacheMousePos.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    if (angle > 90 && angle <= 270) angle += 180;
    const isMovingClockwise = angle >= this.lastAngle;
    this.lastAngle = angle;
    let startAngle = isMovingClockwise ? angle - 10 : angle + 10;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist !== 0) { dx /= dist; dy /= dist; }
    dx *= dist / 150; dy *= dist / 150;
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    gsap.timeline({ onStart: () => this.onImageActivated(), onComplete: () => this.onImageDeactivated() })
      .fromTo(img.DOM.el, {
        opacity: 1, filter: 'brightness(80%)', scale: 0.1, zIndex: this.zIndexVal,
        x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2, rotation: startAngle,
      }, {
        duration: 1, ease: 'power2', scale: 1, filter: 'brightness(100%)',
        x: this.mousePos.x - (img.rect?.width ?? 0) / 2 + dx * 70,
        y: this.mousePos.y - (img.rect?.height ?? 0) / 2 + dy * 70, rotation: this.lastAngle,
      }, 0)
      .to(img.DOM.el, { duration: 0.4, ease: 'expo', opacity: 0 }, 0.5)
      .to(img.DOM.el, { duration: 1.5, ease: 'power4', x: `+=${dx * 120}`, y: `+=${dy * 120}` }, 0.05);
  }
}

class ImageTrailVariant6 extends ImageTrailBase {
  render() {
    if (this.destroyed) return;
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.3);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.3);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    this.rafId = requestAnimationFrame(() => this.render());
  }
  showNextImage() {
    const dx = this.mousePos.x - this.cacheMousePos.x;
    const dy = this.mousePos.y - this.cacheMousePos.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    const scaleFactor = 0.3 + 1.7 * Math.min(speed / 200, 1);
    const brightnessValue = 1 + 0.3 * Math.min(speed / 70, 1);
    const blurValue = 20 * (1 - Math.min(speed / 90, 1));
    const grayscaleValue = 1 * (1 - Math.min(speed / 90, 1));
    gsap.killTweensOf(img.DOM.el);
    gsap.timeline({ onStart: () => this.onImageActivated(), onComplete: () => this.onImageDeactivated() })
      .fromTo(img.DOM.el, {
        opacity: 1, scale: 0, zIndex: this.zIndexVal,
        x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2,
      }, {
        duration: 0.8, ease: 'power3', scale: scaleFactor,
        filter: `grayscale(${grayscaleValue * 100}%) brightness(${brightnessValue * 100}%) blur(${blurValue}px)`,
        x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.mousePos.y - (img.rect?.height ?? 0) / 2,
      }, 0)
      .to(img.DOM.el, { duration: 0.4, ease: 'power3.in', opacity: 0, scale: 0.2 }, 0.45);
  }
}

class ImageTrailVariant7 extends ImageTrailBase {
  constructor(c) { super(c); this.visibleImagesCount = 0; this.visibleImagesTotal = 9; }
  render() {
    if (this.destroyed) return;
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.3);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.3);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    this.rafId = requestAnimationFrame(() => this.render());
  }
  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    ++this.visibleImagesCount;
    gsap.killTweensOf(img.DOM.el);
    const scaleValue = gsap.utils.random(0.5, 1.6);
    gsap.timeline({ onStart: () => this.onImageActivated(), onComplete: () => this.onImageDeactivated() })
      .fromTo(img.DOM.el, {
        scale: scaleValue - 0.4, rotationZ: 0, opacity: 1, zIndex: this.zIndexVal,
        x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2,
      }, {
        duration: 0.4, ease: 'power3', scale: scaleValue, rotationZ: gsap.utils.random(-3, 3),
        x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.mousePos.y - (img.rect?.height ?? 0) / 2,
      }, 0);
    if (this.visibleImagesCount >= this.visibleImagesTotal) {
      const lastInQueue = (this.imgPosition - this.visibleImagesTotal + this.imagesTotal) % this.imagesTotal;
      const oldImg = this.images[lastInQueue];
      gsap.to(oldImg.DOM.el, { duration: 0.4, ease: 'power4', opacity: 0, scale: 1.3 });
    }
  }
}

class ImageTrailVariant8 extends ImageTrailBase {
  render() {
    if (this.destroyed) return;
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    this.rafId = requestAnimationFrame(() => this.render());
  }
  showNextImage() {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const relX = this.mousePos.x - centerX;
    const relY = this.mousePos.y - centerY;
    const rotX = -(relY / centerY) * 30;
    const rotY = (relX / centerX) * 30;
    const distFromCenter = Math.sqrt(relX * relX + relY * relY);
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
    const zValue = (distFromCenter / maxDist) * 1200 - 600;
    const brightness = 0.2 + ((zValue + 600) / 1200) * 2.3;
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    gsap.timeline({ onStart: () => this.onImageActivated(), onComplete: () => this.onImageDeactivated() })
      .set(this.container, { perspective: 1000 })
      .fromTo(img.DOM.el, {
        opacity: 1, z: 0, scale: 1 + zValue / 1000, zIndex: this.zIndexVal,
        x: this.cacheMousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.cacheMousePos.y - (img.rect?.height ?? 0) / 2,
        rotationX: rotX, rotationY: rotY, filter: `brightness(${brightness})`,
      }, {
        duration: 1, ease: 'expo', scale: 1 + zValue / 1000,
        x: this.mousePos.x - (img.rect?.width ?? 0) / 2,
        y: this.mousePos.y - (img.rect?.height ?? 0) / 2,
        rotationX: rotX, rotationY: rotY,
      }, 0)
      .to(img.DOM.el, { duration: 0.4, ease: 'power2', opacity: 0, z: -800 }, 0.3);
  }
}

const variantMap = {
  1: ImageTrailVariant1, 2: ImageTrailVariant2, 3: ImageTrailVariant3, 4: ImageTrailVariant4,
  5: ImageTrailVariant5, 6: ImageTrailVariant6, 7: ImageTrailVariant7, 8: ImageTrailVariant8,
};

export default function ImageTrail({ items = [], variant = 1, threshold = 80, className = '' }) {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;
    const Cls = variantMap[variant] || variantMap[1];
    const instance = new Cls(containerRef.current);
    instance.threshold = threshold;
    instanceRef.current = instance;
    return () => { instance.destroy(); instanceRef.current = null; };
  }, [variant, items, threshold]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-[20] overflow-visible ${className}`}
    >
      {items.map((url, i) => (
        <div
          key={i}
          className="content__img w-[150px] sm:w-[190px] aspect-[1.1] rounded-[15px] absolute top-0 left-0 opacity-0 overflow-hidden [will-change:transform,filter] shadow-2xl ring-1 ring-white/10"
        >
          <div
            className="content__img-inner bg-center bg-cover w-[calc(100%+20px)] h-[calc(100%+20px)] absolute top-[-10px] left-[-10px]"
            style={{ backgroundImage: `url(${url})` }}
          />
        </div>
      ))}
    </div>
  );
}
