import { useState } from 'react'
import type { DartThrow, CricketNumber, HitType } from '../types'
import styles from './DartInput.module.css'

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

  return (
    <div className={styles.container}>
      {/* Multiplier Selection */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Select Multiplier</h3>
        <div className={styles.buttonGroup}>
          <button
            onClick={() => setSelectedMultiplier('single')}
            disabled={disabled}
            className={`${styles.buttonSingle} ${selectedMultiplier === 'single' ? styles.buttonSelected : ''}`}
          >
            Single
          </button>
          <button
            onClick={() => setSelectedMultiplier('double')}
            disabled={disabled}
            className={`${styles.buttonDouble} ${selectedMultiplier === 'double' ? styles.buttonSelected : ''}`}
          >
            Double
          </button>
          <button
            onClick={() => setSelectedMultiplier('triple')}
            disabled={disabled}
            className={`${styles.buttonTriple} ${selectedMultiplier === 'triple' ? styles.buttonSelected : ''}`}
          >
            Triple
          </button>
        </div>
      </div>

      {/* Number Selection */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Select Number</h3>
        <div className={styles.buttonGroup}>
          {CRICKET_NUMBERS.map(num => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              disabled={disabled}
              className={styles.buttonNumber}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Bulls */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Bulls</h3>
        <div className={styles.buttonGroup}>
          <button
            onClick={() => handleBullClick('outer')}
            disabled={disabled}
            className={styles.buttonOuterBull}
          >
            Outer Bull (25)
          </button>
          <button
            onClick={() => handleBullClick('inner')}
            disabled={disabled}
            className={styles.buttonInnerBull}
          >
            Inner Bull (50)
          </button>
        </div>
      </div>

      {/* Miss Button */}
      <div className={styles.section}>
        <div className={styles.buttonGroup}>
          <button
            onClick={handleMiss}
            disabled={disabled}
            className={styles.buttonMiss}
          >
            Miss
          </button>
        </div>
      </div>
    </div>
  )
}
