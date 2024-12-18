import { useState, useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover';

import useLocalStorage from '@/hooks/useLocalStorage';

interface OnboardingStep {
  target: string; // CSS selector for the target element
  title: string;
  complete?: string;
  description: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    target: '#open-in-figma',
    title: 'Project migrated to Figma',
    description:
      'This project is now on Figma for a better experience and up-to-date screens. Click the button to explore.',
  },
];

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [visibleStep, setVisibleStep] = useState<number | null>(null);

  const storage = useLocalStorage('onboarding');

  // Save completed steps to localStorage
  const markStepAsComplete = (stepIndex: number) => {
    const step = onboardingSteps[stepIndex];
    const seenSteps = new Set(JSON.parse(storage.getItem('seen') || '[]'));
    seenSteps.add(step.target); // Add the target to the Set
    storage.setItem('seen', JSON.stringify(Array.from(seenSteps))); // Save as an array
  };

  const completeCurrentStep = () => {
    if (currentStep !== null) {
      markStepAsComplete(currentStep);
    }
    setCurrentStep(null);
  };

  // Monitor DOM changes and set visible step
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const seenSteps = new Set(JSON.parse(storage.getItem('seen') || '[]'));

      onboardingSteps.forEach((step, index) => {
        if (
          !seenSteps.has(step.target) &&
          document.querySelector(step.target)
        ) {
          setVisibleStep(index);
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (visibleStep !== null) {
      setCurrentStep(visibleStep);
    }
  }, [visibleStep]);

  const step = useMemo(() => {
    if (currentStep == null) return;

    return onboardingSteps[currentStep];
  }, [currentStep, onboardingSteps]);

  const targetRect = useMemo(() => {
    if (step == null) return;

    return document.querySelector(step.target)?.getBoundingClientRect();
  }, [step]);

  return (
    targetRect &&
    step && (
      <>
        {/* Background Overlay */}
        <div
          className="fixed z-50 inset-0 bg-black bg-opacity-60"
          style={{
            maskImage: `radial-gradient(circle at ${
              targetRect.left + targetRect.width / 2
            }px ${
              targetRect.top + targetRect.height / 2
            }px, transparent 0px, transparent ${
              Math.max(targetRect.width, targetRect.height) - 5
            }px, black ${Math.max(targetRect.width, targetRect.height) + 20}px)`,
            WebkitMaskImage: `radial-gradient(circle at ${
              targetRect.left + targetRect.width / 2
            }px ${
              targetRect.top + targetRect.height / 2
            }px, transparent 0px, transparent ${
              Math.max(targetRect.width, targetRect.height) - 5
            }px, black ${Math.max(targetRect.width, targetRect.height) + 20}px)`,
          }}
        />
        {/* Popover */}
        <Popover open>
          <PopoverAnchor
            className="absolute"
            style={{
              top: targetRect.top + window.scrollY,
              left: targetRect.left + window.scrollX,
              width: targetRect.width,
              height: targetRect.height,
            }}
          />

          <PopoverContent
            className="rounded-lg p-4 bg-card shadow-lg max-w-sm"
            side="bottom"
            align="end"
          >
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="default" size="sm" onClick={completeCurrentStep}>
                {step.complete ?? 'Got it!'}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </>
    )
  );
};

export default Onboarding;
