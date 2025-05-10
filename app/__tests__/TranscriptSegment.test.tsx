import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TranscriptSegment, { TranscriptSegmentData } from '../components/TranscriptSegment';

describe('TranscriptSegment', () => {
  const mockSegment: TranscriptSegmentData = {
    id: 'test-segment-1',
    timestamp: 65.5, // 1:05.5
    text: 'This is a test transcript segment'
  };
  
  const mockOnSegmentClick = jest.fn();

  beforeEach(() => {
    // Reset mock before each test
    mockOnSegmentClick.mockReset();
  });

  test('renders segment text correctly', () => {
    render(
      <TranscriptSegment 
        segment={mockSegment} 
        isActive={false} 
        onSegmentClick={mockOnSegmentClick} 
      />
    );
    
    // Check if segment text is rendered
    expect(screen.getByText(mockSegment.text)).toBeInTheDocument();
  });

  test('formats timestamp correctly', () => {
    render(
      <TranscriptSegment 
        segment={mockSegment} 
        isActive={false} 
        onSegmentClick={mockOnSegmentClick} 
      />
    );
    
    // Check if timestamp is formatted as 01:05
    expect(screen.getByText('01:05')).toBeInTheDocument();
  });

  test('applies active styling when isActive is true', () => {
    const { rerender } = render(
      <TranscriptSegment 
        segment={mockSegment} 
        isActive={false} 
        onSegmentClick={mockOnSegmentClick} 
      />
    );
    
    // Initially not active
    const segment = screen.getByText(mockSegment.text).closest('div[id]');
    expect(segment).not.toHaveClass('bg-primary');
    
    // Rerender with isActive=true
    rerender(
      <TranscriptSegment 
        segment={mockSegment} 
        isActive={true} 
        onSegmentClick={mockOnSegmentClick} 
      />
    );
    
    // Now it should have active styling
    expect(segment).toHaveClass('bg-primary');
  });

  test('calls onSegmentClick when timestamp button is clicked', () => {
    render(
      <TranscriptSegment 
        segment={mockSegment} 
        isActive={false} 
        onSegmentClick={mockOnSegmentClick} 
      />
    );
    
    // Find and click the timestamp button
    const timestampButton = screen.getByText('01:05').closest('button');
    fireEvent.click(timestampButton!);
    
    // Check if callback was called with correct timestamp
    expect(mockOnSegmentClick).toHaveBeenCalledTimes(1);
    expect(mockOnSegmentClick).toHaveBeenCalledWith(mockSegment.timestamp);
  });

  test('renders segment with correct ID for scrolling target', () => {
    render(
      <TranscriptSegment 
        segment={mockSegment} 
        isActive={false} 
        onSegmentClick={mockOnSegmentClick} 
      />
    );
    
    // Check if the segment has the correct ID for scrolling
    const segment = document.getElementById(`segment-${mockSegment.id}`);
    expect(segment).toBeInTheDocument();
  });
}); 