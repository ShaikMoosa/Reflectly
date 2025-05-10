'use client';

import React, { useState, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  component: ReactNode;
  optional?: boolean;
  validate?: () => boolean;
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const goToNextStep = () => {
    // Set showValidation to true first, to trigger UI validations
    setShowValidation(true);
    
    // Clear previous validation errors
    setValidationError(null);
    
    // Check if the current step has a validation function
    const validationFn = currentStep.validate;
    
    if (validationFn) {
      try {
        const isValid = validationFn();
        
        // If validation fails, show error and return
        if (!isValid) {
          setValidationError('Please complete all required fields before proceeding.');
          return;
        }
      } catch (error) {
        console.error('Validation error:', error);
        setValidationError('An error occurred during validation.');
        return;
      }
    }
    
    // If we reach here, validation passed or there was no validation function
    
    // Reset showValidation since we're moving to the next step
    setShowValidation(false);
    
    // If this is the last step, call onComplete
    if (isLastStep) {
      onComplete?.();
      return;
    }
    
    // Add current step to completed steps if not already there
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps([...completedSteps, currentStep.id]);
    }
    
    // Move to the next step
    setCurrentStepIndex(currentStepIndex + 1);
  };

  const goToPreviousStep = () => {
    setValidationError(null);
    setShowValidation(false);
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // If the step's component is a React element, clone it and pass showValidation
  const stepContent = React.isValidElement(currentStep.component)
    ? React.cloneElement(
        currentStep.component as React.ReactElement,
        typeof currentStep.component.type === 'string' 
          ? {} // Don't pass showValidation to DOM elements (like div, span)
          : { showValidation } // Only pass to custom React components
      )
    : currentStep.component;

  return (
    <div className={`w-full ${className}`} data-multistep-container data-showvalidation={showValidation ? "true" : "false"}>
      {/* Validation Error Message */}
      {validationError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {validationError}
        </div>
      )}

      {/* Step Content */}
      <div className="animate-fadeIn">
        {stepContent}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
        )}
        
        <div className="flex ml-auto space-x-2">
          {!isFirstStep && (
            <button
              onClick={goToPreviousStep}
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </button>
          )}
          
          <button
            onClick={goToNextStep}
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            type="button"
          >
            {isLastStep ? 'Complete' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiStepFlow; 