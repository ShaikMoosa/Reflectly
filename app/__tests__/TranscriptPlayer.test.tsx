import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TranscriptPlayer from '../components/TranscriptPlayer';
import { TranscriptSegmentData } from '../components/TranscriptSegment';

// Mock the TranscriptSegment component
jest.mock('../components/TranscriptSegment', () => {
  return function MockTranscriptSegment({ segment, isActive, onSegmentClick }: any) {
    return (
      <div 
        data-testid={`segment-${segment.id}`}
        className={isActive ? 'active-segment' : 'inactive-segment'}
        onClick={() => onSegmentClick(segment.timestamp)}
      >
        <span>{segment.text}</span>
        <button onClick={() => onSegmentClick(segment.timestamp)}>
          {formatTime(segment.timestamp)}
        </button>
      </div>
    );
  };
});

// Helper function for timestamp formatting
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

describe('TranscriptPlayer', () => {
  const mockSegments: TranscriptSegmentData[] = [
    { id: 'seg-1', timestamp: 0, text: 'First segment' },
    { id: 'seg-2', timestamp: 10, text: 'Second segment' },
    { id: 'seg-3', timestamp: 20, text: 'Third segment' },
    { id: 'seg-4', timestamp: 30, text: 'Fourth segment' },
  ];
  
  const mockOnSegmentClick = jest.fn();

  beforeEach(() => {
    // Reset mock before each test
    mockOnSegmentClick.mockReset();
    
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  test('renders all segments', () => {
    render(
      <TranscriptPlayer 
        segments={mockSegments}
        currentTime={5}
        onSegmentClick={mockOnSegmentClick}
      />
    );
    
    // Check if all segments are rendered
    mockSegments.forEach(segment => {
      expect(screen.getByTestId(`segment-${segment.id}`)).toBeInTheDocument();
    });
  });

  test('marks the correct segment as active based on currentTime', () => {
    const { rerender } = render(
      <TranscriptPlayer 
        segments={mockSegments}
        currentTime={5} // This should make the first segment active (0-10)
        onSegmentClick={mockOnSegmentClick}
      />
    );
    
    // Check if first segment is active
    expect(screen.getByTestId('segment-seg-1')).toHaveClass('active-segment');
    expect(screen.getByTestId('segment-seg-2')).toHaveClass('inactive-segment');
    
    // Update current time to make the second segment active
    rerender(
      <TranscriptPlayer 
        segments={mockSegments}
        currentTime={15} // This should make the second segment active (10-20)
        onSegmentClick={mockOnSegmentClick}
      />
    );
    
    // Check if second segment is now active
    expect(screen.getByTestId('segment-seg-1')).toHaveClass('inactive-segment');
    expect(screen.getByTestId('segment-seg-2')).toHaveClass('active-segment');
  });

  test('handles segment click correctly', () => {
    render(
      <TranscriptPlayer 
        segments={mockSegments}
        currentTime={0}
        onSegmentClick={mockOnSegmentClick}
      />
    );
    
    // Click on a segment
    fireEvent.click(screen.getByTestId('segment-seg-2'));
    
    // Check if callback was called with correct timestamp
    expect(mockOnSegmentClick).toHaveBeenCalledTimes(1);
    expect(mockOnSegmentClick).toHaveBeenCalledWith(10); // timestamp of segment 2
  });

  test('renders empty state when no segments are provided', () => {
    render(
      <TranscriptPlayer 
        segments={[]}
        currentTime={0}
        onSegmentClick={mockOnSegmentClick}
      />
    );
    
    // Check for title but no segments
    expect(screen.getByText('Transcript')).toBeInTheDocument();
    expect(screen.queryByTestId(/segment-/)).not.toBeInTheDocument();
  });
}); 