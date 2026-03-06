import { describe, it, expect } from 'vitest'
import {
  createPlayerState,
  initializeCricketGame,
  processDartThrow,
  getDisplaySymbol
} from '../cricketGame'
import type { CricketGameState, DartThrow } from '../../types'

describe('Cricket Game Logic', () => {
  describe('createPlayerState', () => {
    it('should initialize a player with all numbers at 0 hits', () => {
      const player = createPlayerState('Alice')
      
      expect(player.name).toBe('Alice')
      expect(player.totalScore).toBe(0)
      expect(player.numbers[15].hits).toBe(0)
      expect(player.numbers[15].isOpen).toBe(false)
      expect(player.numbers[15].isLocked).toBe(false)
      expect(player.numbers[25].hits).toBe(0) // Bulls
    })
  })

  describe('initializeCricketGame', () => {
    it('should create a new game with 2 players', () => {
      const game = initializeCricketGame('session-1', ['Alice', 'Bob'])
      
      expect(game.sessionId).toBe('session-1')
      expect(game.players).toHaveLength(2)
      expect(game.players[0].name).toBe('Alice')
      expect(game.players[1].name).toBe('Bob')
      expect(game.currentPlayerIndex).toBe(0)
      expect(game.dartsRemaining).toBe(3)
      expect(game.gameStarted).toBe(true)
      expect(game.gameEnded).toBe(false)
    })
  })

  describe('processDartThrow - Basic Hits', () => {
    it('should add 1 hit for a single', () => {
      const game = initializeCricketGame('test', ['Alice'])
      const dart: DartThrow = { number: 20, hitType: 'single', hitsValue: 1 }
      
      const newGame = processDartThrow(game, dart)
      
      expect(newGame.players[0].numbers[20].hits).toBe(1)
      expect(newGame.dartsRemaining).toBe(2)
    })

    it('should add 2 hits for a double', () => {
      const game = initializeCricketGame('test', ['Alice'])
      const dart: DartThrow = { number: 20, hitType: 'double', hitsValue: 2 }
      
      const newGame = processDartThrow(game, dart)
      
      expect(newGame.players[0].numbers[20].hits).toBe(2)
    })

    it('should add 3 hits and open the number for a triple', () => {
      const game = initializeCricketGame('test', ['Alice'])
      const dart: DartThrow = { number: 20, hitType: 'triple', hitsValue: 3 }
      
      const newGame = processDartThrow(game, dart)
      
      expect(newGame.players[0].numbers[20].hits).toBe(3)
      expect(newGame.players[0].numbers[20].isOpen).toBe(true)
    })
  })

  describe('processDartThrow - Opening Numbers', () => {
    it('should open a number after 3 hits', () => {
      let game = initializeCricketGame('test', ['Alice'])
      
      // Hit 1
      game = processDartThrow(game, { number: 20, hitType: 'single', hitsValue: 1 })
      expect(game.players[0].numbers[20].isOpen).toBe(false)
      
      // Hit 2
      game = processDartThrow(game, { number: 20, hitType: 'single', hitsValue: 1 })
      expect(game.players[0].numbers[20].isOpen).toBe(false)
      
      // Hit 3 - should open
      game = processDartThrow(game, { number: 20, hitType: 'single', hitsValue: 1 })
      expect(game.players[0].numbers[20].isOpen).toBe(true)
      expect(game.players[0].numbers[20].hits).toBe(3)
    })
  })

  describe('processDartThrow - Scoring', () => {
    it('should score points after number is open', () => {
      let game = initializeCricketGame('test', ['Alice'])
      
      // Open the number (triple)
      game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 })
      expect(game.players[0].numbers[20].isOpen).toBe(true)
      expect(game.players[0].totalScore).toBe(0) // Opening doesn't score
      
      // Hit again - should score 20
      game = processDartThrow(game, { number: 20, hitType: 'single', hitsValue: 1 })
      expect(game.players[0].numbers[20].score).toBe(20)
      expect(game.players[0].totalScore).toBe(20)
    })

    it('should score double and triple multipliers', () => {
      let game = initializeCricketGame('test', ['Alice'])
      
      // Open with triple
      game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 })
      
      // Score double (40 points)
      game = processDartThrow(game, { number: 20, hitType: 'double', hitsValue: 2 })
      expect(game.players[0].totalScore).toBe(40)
      
      // Score triple (60 points)
      game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 })
      expect(game.players[0].totalScore).toBe(100)
    })
  })

  describe('processDartThrow - Bulls', () => {
    it('should count outer bull as 1 hit', () => {
      const game = initializeCricketGame('test', ['Alice'])
      const dart: DartThrow = { number: 25, hitType: 'outer-bull', hitsValue: 1 }
      
      const newGame = processDartThrow(game, dart)
      
      expect(newGame.players[0].numbers[25].hits).toBe(1)
    })

    it('should count inner bull as 2 hits', () => {
      const game = initializeCricketGame('test', ['Alice'])
      const dart: DartThrow = { number: 25, hitType: 'inner-bull', hitsValue: 2 }
      
      const newGame = processDartThrow(game, dart)
      
      expect(newGame.players[0].numbers[25].hits).toBe(2)
    })

    it('should score 25 points for outer bull when open', () => {
      let game = initializeCricketGame('test', ['Alice'])
      
      // Open with 3 outer bulls
      game = processDartThrow(game, { number: 25, hitType: 'outer-bull', hitsValue: 1 })
      game = processDartThrow(game, { number: 25, hitType: 'outer-bull', hitsValue: 1 })
      game = processDartThrow(game, { number: 25, hitType: 'outer-bull', hitsValue: 1 })
      expect(game.players[0].numbers[25].isOpen).toBe(true)
      
      // Score outer bull
      game = processDartThrow(game, { number: 25, hitType: 'outer-bull', hitsValue: 1 })
      expect(game.players[0].totalScore).toBe(25)
    })

    it('should score 50 points for inner bull when open', () => {
      let game = initializeCricketGame('test', ['Alice'])
      
      // Open with inner + outer
      game = processDartThrow(game, { number: 25, hitType: 'inner-bull', hitsValue: 2 })
      game = processDartThrow(game, { number: 25, hitType: 'outer-bull', hitsValue: 1 })
      expect(game.players[0].numbers[25].isOpen).toBe(true)
      
      // Score inner bull
      game = processDartThrow(game, { number: 25, hitType: 'inner-bull', hitsValue: 2 })
      expect(game.players[0].totalScore).toBe(50)
    })
  })

  describe('processDartThrow - Turn Management', () => {
    it('should decrease darts remaining', () => {
      const game = initializeCricketGame('test', ['Alice'])
      
      const newGame = processDartThrow(game, { number: 20, hitType: 'single', hitsValue: 1 })
      
      expect(newGame.dartsRemaining).toBe(2)
    })

    it('should advance to next player after 3 darts', () => {
      let game = initializeCricketGame('test', ['Alice', 'Bob'])
      
      game = processDartThrow(game, { number: 20, hitType: 'single', hitsValue: 1 })
      game = processDartThrow(game, { number: 20, hitType: 'single', hitsValue: 1 })
      game = processDartThrow(game, { number: 20, hitType: 'single', hitsValue: 1 })
      
      expect(game.currentPlayerIndex).toBe(1) // Bob's turn
      expect(game.dartsRemaining).toBe(3)
    })

    it('should cycle back to first player', () => {
      let game = initializeCricketGame('test', ['Alice', 'Bob'])
      
      // Alice's turn (3 darts)
      game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
      game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
      game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
      
      // Bob's turn (3 darts)
      game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
      game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
      game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
      
      expect(game.currentPlayerIndex).toBe(0) // Back to Alice
    })
  })

  describe('processDartThrow - Defensive Play', () => {
    it('should not affect opponent if they have not hit the number yet', () => {
      let game = initializeCricketGame('test', ['Alice', 'Bob'])
      
      // Alice hits 20 twice
      game = processDartThrow(game, { number: 20, hitType: 'double', hitsValue: 2 })
      
      expect(game.players[0].numbers[20].hits).toBe(2)
      expect(game.players[1].numbers[20].hits).toBe(0)
    })

    it('should lock number when opponent opens it (defensive close)', () => {
      let game = initializeCricketGame('test', ['Alice', 'Bob'])
      
      // Alice's turn: open 15
      game = processDartThrow(game, { number: 15, hitType: 'single', hitsValue: 1 })
      game = processDartThrow(game, { number: 15, hitType: 'single', hitsValue: 1 })
      game = processDartThrow(game, { number: 15, hitType: 'single', hitsValue: 1 })
      
      expect(game.players[0].numbers[15].isOpen).toBe(true)
      expect(game.players[0].numbers[15].isLocked).toBe(false)
      expect(game.players[1].numbers[15].isOpen).toBe(false)
      expect(game.players[1].numbers[15].isLocked).toBe(false)
      
      // Bob's turn: open 15 (defensive close)
      game = processDartThrow(game, { number: 15, hitType: 'single', hitsValue: 1 })
      game = processDartThrow(game, { number: 15, hitType: 'single', hitsValue: 1 })
      game = processDartThrow(game, { number: 15, hitType: 'single', hitsValue: 1 })
      
      // Both players should now have 15 locked
      expect(game.players[0].numbers[15].isOpen).toBe(true)
      expect(game.players[0].numbers[15].isLocked).toBe(true)
      expect(game.players[1].numbers[15].isOpen).toBe(true)
      expect(game.players[1].numbers[15].isLocked).toBe(true)
    })
  })

  describe('processDartThrow - Win Condition', () => {
    it('should detect winner when all numbers are closed', () => {
      let game = initializeCricketGame('test', ['Alice'])
      
      // Close all numbers
      const numbers = [15, 16, 17, 18, 19, 20, 25]
      numbers.forEach(num => {
        game = processDartThrow(game, { 
          number: num as any, 
          hitType: 'triple', 
          hitsValue: 3 
        })
      })
      
      expect(game.gameEnded).toBe(true)
      expect(game.winner).toBe('Alice')
    })

    it('should choose winner by score if multiple players close all', () => {
      let game = initializeCricketGame('test', ['Alice', 'Bob'])
      
      // Alice opens and scores on 20
      game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 })
      game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 }) // Score 60
      game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
      
      // Both close all other numbers
      const numbers = [15, 16, 17, 18, 19, 25]
      numbers.forEach(num => {
        // Alice
        game = processDartThrow(game, { number: num as any, hitType: 'triple', hitsValue: 3 })
        game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
        game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
        
        // Bob
        game = processDartThrow(game, { number: num as any, hitType: 'triple', hitsValue: 3 })
        game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
        game = processDartThrow(game, { hitType: 'miss', hitsValue: 0 })
      })
      
      // Bob closes 20
      game = processDartThrow(game, { number: 20, hitType: 'triple', hitsValue: 3 })
      
      expect(game.gameEnded).toBe(true)
      expect(game.winner).toBe('Alice') // Alice has higher score
    })
  })

  describe('getDisplaySymbol', () => {
    it('should return "-" for no hits', () => {
      const player = createPlayerState('Test')
      expect(getDisplaySymbol(player.numbers[20])).toBe('-')
    })

    it('should return "/" for 1 hit', () => {
      const player = createPlayerState('Test')
      player.numbers[20].hits = 1
      expect(getDisplaySymbol(player.numbers[20])).toBe('/')
    })

    it('should return "X" for 2 hits', () => {
      const player = createPlayerState('Test')
      player.numbers[20].hits = 2
      expect(getDisplaySymbol(player.numbers[20])).toBe('X')
    })

    it('should return "O" for 3 hits (open)', () => {
      const player = createPlayerState('Test')
      player.numbers[20].hits = 3
      player.numbers[20].isOpen = true
      expect(getDisplaySymbol(player.numbers[20])).toBe('O')
    })

    it('should return score when number has score', () => {
      const player = createPlayerState('Test')
      player.numbers[20].isOpen = true
      player.numbers[20].score = 40
      expect(getDisplaySymbol(player.numbers[20])).toBe('40')
    })

    it('should return "X" for locked numbers', () => {
      const player = createPlayerState('Test')
      player.numbers[20].isLocked = true
      expect(getDisplaySymbol(player.numbers[20])).toBe('X')
    })
  })
})
