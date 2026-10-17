import { gsap, ScrollTrigger, SplitText } from './gsapSetup';
import { onPageReady } from './lifecycle';
import { NO_PREFERENCE } from './motionQueries';

const releaseHeading = () => document.documentElement.classList.remove('motion-pending');

const revealTitle = (title: HTMLElement) => {
  let timeline: gsap.core.Timeline | undefined;
  let entered = false;

  const split = SplitText.create(title, {
    type: 'lines,chars',
    mask: 'lines',
    linesClass: 'split-line',
    charsClass: 'split-char',
    autoSplit: true,
    onSplit: (self) => {
      const emphasized = self.chars.filter((char) => char.closest('em'));
      const plain = self.chars.filter((char) => !char.closest('em'));
      const tl = gsap.timeline({ paused: !entered });
      if (plain.length > 0) {
        tl.from(plain, { yPercent: 45, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.03 });
      }
      if (emphasized.length > 0) {
        tl.from(emphasized, { yPercent: 45, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.03 }, plain.length * 0.03 + 0.1);
      }
      timeline = tl;
      releaseHeading();
      return tl;
    },
  });

  const trigger = ScrollTrigger.create({
    trigger: title,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      entered = true;
      timeline?.play();
    },
  });

  return () => {
    trigger.kill();
    split.revert();
  };
};

onPageReady(() => {
  const mm = gsap.matchMedia();

  mm.add(NO_PREFERENCE, () => {
    const disposers = Array.from(document.querySelectorAll<HTMLElement>('[data-split]')).map(revealTitle);
    releaseHeading();
    return () => disposers.forEach((dispose) => dispose());
  });

  return () => mm.revert();
});
