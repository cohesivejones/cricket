import { useState } from 'react'
import type { DartThrow, CricketNumber, HitType } from '../types'

interface DartInputProps {
  onDartThrow: (dart: DartThrow) => void
  disabled: boolean
}

const CRICKET_NUMBERS: CricketNumber[] = [15, 16, 17, 18, 19, 20]

export default function DartInput({ onDartThrow, disabled }: DartInputProps) {
  const [selectedMultiplier, setSelectedMultiplier] = useState<'single' | 'double' | 'triple'>('single')

  const handleNumberClick = (number: CricketNumber) => {
    const hitType: HitType = selectedMultiplier
    const hitsValue = selectedMultiplier === 'triple' ? 3 : selectedMultiplier === 'double' ? 2 : 1
    
    onDartThrow({
      number,
      hitType,
      hitsValue
    })
    
    // Reset to single after throw
    setSelectedMultiplier('single')
  }

  const handleBullClick = (type: 'outer' | 'inner') => {
    onDartThrow({
      number: 25,
      hitType: type === 'outer' ? 'outer-bull' : 'inner-bull',
      hitsValue: type === 'outer' ? 1 : 2
    })
  }

  const handleMiss = () => {
    onDartThrow({
      hitType: 'miss',
      hitsValue: 0
    })
  }

  const buttonStyle = (isSelected: boolean = false) => ({
    padding: '1rem 1.5rem',
    margin: '0.25rem',
    backgroundColor: isSelected ? '#ffc107' : '#007bff',
    color: isSelected ? '#000' : 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s',
    minWidth: '60px'
  })

  return (
    <div style={{ width: '100%' }}>
      {/* Multiplier Selection */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '2px solid #dee2e6'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>Select Multiplier</h3>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedMultiplier('single')}
            disabled={disabled}
            style={buttonStyle(selectedMultiplier === 'single')}
          >
            Single
          </button>
          <button
            onClick={() => setSelectedMultiplier('double')}
            disabled={disabled}
            style={buttonStyle(selectedMultiplier === 'double')}
          >
            Double
          </button>
          <button
            onClick={() => setSelectedMultiplier('triple')}
            disabled={disabled}
            style={buttonStyle(selectedMultiplier === 'triple')}
          >
            Triple
          </button>
        </div>
      </div>

      {/* Number Selection */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '2px solid #dee2e6'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>Select Number</h3>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {CRICKET_NUMBERS.map(num => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              disabled={disabled}
              style={{
                ...buttonStyle(),
                backgroundColor: '#28a745',
                fontSize: '1.2rem',
                minWidth: '70px'
              }}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Bulls */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '2px solid #dee2e6'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>Bulls</h3>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleBullClick('outer')}
            disabled={disabled}
            style={{
              ...buttonStyle(),
              backgroundColor: '#17a2b8'
            }}
          >
            Outer Bull (25)
          </button>
          <button
            onClick={() => handleBullClick('inner')}
            disabled={disabled}
            style={{
              ...buttonStyle(),
              backgroundColor: '#6f42c1'
            }}
          >
            Inner Bull (50)
          </button>
        </div>
      </div>

      {/* Miss Button */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        border: '2px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleMiss}
            disabled={disabled}
            style={{
              ...buttonStyle(),
              backgroundColor: '#dc3545',
              minWidth: '150px'
            }}
          >
            Miss
          </button>
        </div>
      </div>
    </div>
  )
}
