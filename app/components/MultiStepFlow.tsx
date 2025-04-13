'use client';

import React, { useState, useCallback } from 'react';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface Step {
  id: number;
  name: string;
  component: React.ReactNode;
}

export interface MultiStepFlowProps {
  steps: Step[];
  onComplete: () => void;
  onCancel: () => void;
}

const MultiStepFlow: React.FC<MultiStepFlowProps> = ({
  steps,
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = steps.length;

  // Function to navigate to the next step
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  }, [currentStep, totalSteps, onComplete]);

  // Function to navigate to the previous step
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Function to reset the workflow
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  // Render the progress indicators
  const renderProgressIndicators = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress bar connecting the steps */}
          <div className="absolute left-0 right-0 h-1 bg-gray-200 top-1/2 transform -translate-y-1/2 z-0"></div>
          <div 
            className="absolute left-0 h-1 bg-blue-500 top-1/2 transform -translate-y-1/2 z-0 transition-all" 
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
          
          {/* Step indicators */}
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.id < currentStep 
                    ? 'bg-blue-500 text-white' 
                    : step.id === currentStep 
                      ? 'bg-white border-2 border-blue-500 text-blue-500'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                {step.id < currentStep ? (
                  <Check size={18} />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <span className={`mt-2 text-sm font-medium ${
                step.id <= currentStep ? 'text-blue-500' : 'text-gray-400'
              }`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render navigation buttons
  const renderNavigationButtons = () => {
    return (
      <div className="flex justify-between mt-8">
        <button
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 flex items-center"
        >
          <X size={18} className="mr-1" />
          Cancel
        </button>
        
        <div className="flex gap-2">
          {currentStep > 1 && (
            <button
              onClick={goToPreviousStep}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 flex items-center"
            >
              <ChevronLeft size={18} className="mr-1" />
              Back
            </button>
          )}
          
          <button
            onClick={goToNextStep}
            className={`px-6 py-2 rounded-md text-white flex items-center ${
              currentStep === totalSteps ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {currentStep === totalSteps ? (
              <>
                <Check size={18} className="mr-1" />
                Finish
              </>
            ) : (
              <>
                Next
                <ChevronRight size={18} className="ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Find the current step component
  const currentStepData = steps.find(step => step.id === currentStep);

  return (
    <div className="max-w-5xl mx-auto">
      {renderProgressIndicators()}
      <div className="bg-white rounded-lg p-8 shadow-sm">
        {currentStepData?.component}
      </div>
      {renderNavigationButtons()}
    </div>
  );
};

export default MultiStepFlow; 