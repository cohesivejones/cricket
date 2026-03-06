# Cricket Dart Game - Implementation Plan

## Game Overview
Classic pub Cricket dart game with real-time scoring and multiplayer support.

## Game Rules

### Target Numbers
- 15, 16, 17, 18, 19, 20, and Bulls

### Turn Structure
- Each player gets 3 darts per turn
- Players take turns in order
- Turn advances automatically after 3 darts

### Hitting & Opening Numbers

**Hit Count Progression:**
- 1 hit: Display `/`
- 2 hits: Display `X`
- 3 hits: Display `O` (number is OPEN)

**Opening a Number:**
- Requires 3 hits total on that number
- Once open, future hits add to your score
- Singles, doubles, triples count as 1, 2, or 3 hits respectively

**Bullseye Special Rules:**
- Outer Bull: 1 hit toward opening, worth 25 points when open
- Inner Bull: 2 hits toward opening, worth 50 points when open

### Defensive Play

**IMPORTANT EDGE CASES DISCOVERED:**

#### Scenario 1: Hitting Opponent's Unopened Number
- If you hit an opponent's number BEFORE they open it (hits < 3):
  - Decrements their hit count by 1, 2, or 3
  - If their count reaches 0, further hits start YOUR hit count
  - Example: Opponent has 2 hits on 20, you hit single on 20 → they now have 1 hit

#### Scenario 2: Defensive Closing (Complex!)
- If you hit an opponent's OPEN number (they have 3+ hits):
  - You need to accumulate 3 "closing hits" on that number
  - Once you get 3 closing hits, the number locks for EVERYONE
  - Once locked, neither player can score on it
  - **Implementation Note**: This requires tracking "closing hits" separately!

#### Scenario 3: Single Player Auto-Lock
- In single player mode, when a number is opened, it should lock immediately
  - No defensive play possible with 1 player
  - All numbers lock as soon as they're opened

#### Scenario 4: Multiple Players - When to Lock
- Numbers should ONLY lock when:
  1. All players have it open, OR
  2. One player has it open AND another player hits it 3 times (defensive close)
- If only one player has a number open and no one is defending, it stays unlocked
- Player can keep scoring indefinitely until locked

**Simplified Implementation (Used in Code):**
- Currently using simplified logic: lock only when ALL players have number open
- Full defensive closing requires additional state tracking (TODO for v2)

### Scoring
- Points only count after YOU open the number
- Single = 1x the number value
- Double = 2x the number value  
- Triple = 3x the number value
- Outer Bull = 25 points
- Inner Bull = 50 points

### Winning
**Standard Rules:**
- First player to close ALL numbers (15-20 + Bulls) wins
- If tied, highest score wins

## UI Layout

### Scoreboard (Vertical Players)
```
┌─────────────────────────────────────┐
│ Number │ Player 1 │ Player 2 │ ... │
├─────────────────────────────────────┤
│   15   │    /     │    X     │     │
│   16   │    O     │    -     │     │
│   17   │   40     │    /     │     │
│   18   │    X     │   20     │     │
│   19   │    -     │    O     │     │
│   20   │    /     │    X     │     │
│  Bull  │    O     │   50     │     │
├─────────────────────────────────────┤
│ Score  │   115    │   70     │     │
└─────────────────────────────────────┘

Current Turn: Player 1 (2 darts remaining)
```

**Display Legend:**
- `-` = No hits yet
- `/` = 1 hit
- `X` = 2 hits
- `O` = 3 hits (open)
- Number (e.g., `20`, `40`) = Accumulated score

### Dart Input Section
```
┌── Select Number ──────────────────┐
│ [15] [16] [17] [18] [19] [20]    │
└───────────────────────────────────┘

┌── Hit Type ───────────────────────┐
│ [Single] [Double] [Triple]        │
│ [Outer Bull] [Inner Bull] [Miss]  │
└───────────────────────────────────┘
```

## Implementation Checklist

### Phase 1: Core Game Logic
- [ ] Update data structures for Cricket game state
- [ ] Implement hit counting (1-3 hits to open)
- [ ] Implement opening logic (3 hits = open)
- [ ] Implement closing/locking logic
- [ ] Add score accumulation after opening
- [ ] Handle bulls special rules (outer=1, inner=2 hits)

### Phase 2: Turn Management
- [ ] Track current player
- [ ] Track darts remaining (0-3)
- [ ] Auto-advance turns after 3 darts
- [ ] Cycle through players

### Phase 3: UI Components
- [ ] Redesign Scoreboard for vertical layout
- [ ] Show hit symbols: `/`, `X`, `O`
- [ ] Show accumulated scores
- [ ] Create DartInput component
- [ ] Add number buttons (15-20)
- [ ] Add multiplier buttons (single/double/triple)
- [ ] Add bull buttons (outer/inner)
- [ ] Add miss button

### Phase 4: Game Flow
- [ ] Display current player's turn
- [ ] Display darts remaining
- [ ] Process dart throws
- [ ] Update all affected players' states
- [ ] Check for win condition
- [ ] Display winner

### Phase 5: Testing
- [ ] Test hit counting
- [ ] Test opening numbers
- [ ] Test defensive play (decrementing)
- [ ] Test closing/locking
- [ ] Test bulls scoring
- [ ] Test turn progression
- [ ] Test win detection

### Phase 6: Polish
- [ ] Add game instructions
- [ ] Add visual feedback for hits
- [ ] Add turn indicator
- [ ] Add game reset option
- [ ] Style the interface

## Success Criteria
- ✓ Players displayed vertically
- ✓ Numbers shown horizontally (15-20, Bulls)
- ✓ Hit symbols displayed correctly
- ✓ 3 darts per turn enforced
- ✓ Opening/closing logic works
- ✓ Bulls follow special rules
- ✓ Win detection accurate
- ✓ Score tracking correct
