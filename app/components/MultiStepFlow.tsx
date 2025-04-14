'use client';

import React, { useState, ReactNode } from 'react';
import { CheckCircle2, Circle, ArrowLeft, ArrowRight } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  component: ReactNode;
  optional?: boolean;
}

interface MultiStepFlowProps {
  steps: Step[];
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

const MultiStepFlow: React.FC<MultiStepFlowProps> = ({ steps, onComplete, onCancel, className = '' }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const goToNextStep = () => {
    if (isLastStep) {
      onComplete?.();
      return;
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps([...completedSteps, currentStep.id]);
    }

    // Proceed to next step
    setCurrentStepIndex(currentStepIndex + 1);
  };

  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const jumpToStep = (index: number) => {
    // Only allow jumping to completed steps or the next available step
    if (
      completedSteps.includes(steps[index].id) ||
      index === 0 ||
      (completedSteps.includes(steps[index - 1].id) && index <= currentStepIndex + 1)
    ) {
      setCurrentStepIndex(index);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = completedSteps.includes(step.id);
            const isClickable = isCompleted || index === 0 || (completedSteps.includes(steps[index - 1].id) && index <= currentStepIndex + 1);

            return (
              <React.Fragment key={step.id}>
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => jumpToStep(index)}
                    disabled={!isClickable}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-primary text-white scale-110 shadow-md'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    } ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-70'}`}
                    aria-label={`Go to step ${index + 1}: ${step.title}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="animate-fadeIn" />
                    ) : (
                      <span className={isActive ? 'animate-pulse' : ''}>{index + 1}</span>
                    )}
                  </button>
                  <span
                    className={`mt-2 text-sm font-medium transition-all duration-300 ${
                      isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.title}
                    {step.optional && <span className="text-xs ml-1 opacity-70">(Optional)</span>}
                  </span>
                </div>

                {/* Connector line between steps */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-grow h-1 mx-2 rounded-full transition-all duration-500 ${
                      index < currentStepIndex
                        ? 'bg-green-500'
                        : index === currentStepIndex
                        ? 'bg-gradient-to-r from-green-500 to-gray-200 dark:to-gray-700'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="py-4 animate-fadeIn">
        {currentStep.component}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          className={`flex items-center px-6 py-2 rounded-lg transition-all duration-200 ${
            isFirstStep
              ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </button>

        <button
          onClick={goToNextStep}
          className="flex items-center px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-all duration-200 shadow-sm hover:shadow"
        >
          {isLastStep ? 'Complete' : 'Next'}
          {!isLastStep && <ArrowRight size={16} className="ml-2" />}
        </button>
      </div>
    </div>
  );
};

export default MultiStepFlow; 