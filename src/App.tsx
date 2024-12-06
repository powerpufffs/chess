import { useState, useMemo, ReactNode} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface Piece {
  name: string
  desc: string
  moves: [number, number][]
}

const pieces: Record<Piece['name'], Piece> = {
  'p': {
    name: 'p',
    desc: 'pawn',
    moves: [
      [1, 0]  // Forward move
    ]
  },
  'r': {
    name: 'r',
    desc: 'rook',
    moves: [
      [1, 0],   // Up
      [-1, 0],  // Down
      [0, 1],   // Right
      [0, -1]   // Left
    ]
  },
  'h': {
    name: 'h',
    desc: 'horse',
    moves: [
      [2, 1],    // Up-right L
      [2, -1],   // Up-left L
      [-2, 1],   // Down-right L
      [-2, -1],  // Down-left L
      [1, 2],    // Right-up L
      [1, -2],   // Right-down L
      [-1, 2],   // Left-up L
      [-1, -2]   // Left-down L
    ]
  },
  'b': {
    name: 'b',
    desc: 'bishop',
    moves: [
      [1, 1],    // Up-right diagonal
      [1, -1],   // Up-left diagonal
      [-1, 1],   // Down-right diagonal
      [-1, -1]   // Down-left diagonal
    ]
  },
  'q': {
    name: 'q',
    desc: 'queen',
    moves: [
      [1, 0],    // Up
      [-1, 0],   // Down
      [0, 1],    // Right
      [0, -1],   // Left
      [1, 1],    // Up-right diagonal
      [1, -1],   // Up-left diagonal
      [-1, 1],   // Down-right diagonal
      [-1, -1]   // Down-left diagonal
    ]
  },
  'k': {
    name: 'k',
    desc: 'king',
    moves: [
      [1, 0],    // Up
      [-1, 0],   // Down
      [0, 1],    // Right
      [0, -1],   // Left
      [1, 1],    // Up-right diagonal
      [1, -1],   // Up-left diagonal
      [-1, 1],   // Down-right diagonal
      [-1, -1]   // Down-left diagonal
    ]
  }
}

const Piece = ({ name }: {name: string}) => {
  const color = name.charAt(name.length-1)
  return <h2 className={color === 'b' ? 'black-p' : 'white-p'} >{name === 'z' ? null : name.charAt(0)}</h2>
}

const Cell = ({ ri, ci, onSelect, isSelected, children}: {ri: number, ci: number, isSelected: boolean , onSelect: ({ ri, ci}: {ri: number, ci: number}) => void, children?: ReactNode}) => {
  const color: 'BLACK' | 'WHITE' = useMemo(() => {
    if (ri % 2 == 0 && ci % 2 == 0) {
      return 'BLACK'
    }
    if (ri % 2 == 1 && ci % 2 == 1) {
      return 'BLACK'
    }
    return 'WHITE'
  }, [ri, ci])

  return <div className={`cell ${color} ${isSelected ? 'selected' : ''}`} onClick={() => onSelect({ ri, ci})}>
    <h1>{children}</h1>
  </div>
}

function App() {
  const [count, setCount] = useState(0)

  // const { rows, cols } = useMemo(() => {
  //   return {
  //     rows: new Array(8),
  //     cols: new Array(8),
  //   }
  // }, [])

  const rows = [0,0,0,0,0,0,0,0]
  const cols = [0,0,0,0,0,0,0,0]
  const [takenPieces, setTaken] = useState<string[]>([])

  const [grid, setGrid] = useState([
    ['rb','hb','bb','qb','kb','bb','hb','rb'],
    ['pb','pb','pb','pb','pb','pb','pb','pb'],
    ['z', 'z', 'z', 'z', 'z', 'z', 'z', 'z'],
    ['z', 'z', 'z', 'z', 'z', 'z', 'z', 'z'],
    ['z', 'z', 'z', 'z', 'z', 'z', 'z', 'z'],
    ['z', 'z', 'z', 'z', 'z', 'z', 'z', 'z'],
    ['pw','pw','pw','pw','pw','pw','pw','pw'],
    ['rw','hw','bw','qw','kw','bw','hw','rw']
  ])

  const [input, setInput] = useState('')
  const [selected, setSelected] = useState<undefined | { ri: number, ci: number}>(undefined)

  const handleSelect = ({ ri, ci}: {ri: number, ci: number}) => {
    // check if a piece is there
    if (!selected && grid[ri][ci] === 'z') {
      return
    }
    // if there is a existing selection -> move to new coordinates
    if (selected != undefined) {
      // if itself, deselect 
      if (ri === selected.ri && ci === selected.ci) {
        setSelected(undefined)
        return
      }

      const currPiece = grid[selected.ri][selected.ci].charAt(0)
      const team = grid[selected.ri][selected.ci].charAt(1)
      // see if the move is possible according to the piece
      const { moves } = pieces[currPiece]

      // iterate through moves, check if target destination exists
      let valid = false
      for (let [rowMove, colMove] of moves) {
        if (currPiece === 'p' && team == 'w') {
            rowMove = -1 * rowMove
        }

        const targetRI = selected.ri + rowMove
        const targetCI = selected.ci + colMove

        if (targetRI === ri && targetCI === ci) {
          valid = true
          break
        }
      }

      if (!valid) return

      // check for collision, treat all as enemy
      const existingPiece = grid[ri][ci]
      const collisionPieceTeam = grid[ri][ci].charAt(1)
      
      if (existingPiece !== 'z') {
        if (collisionPieceTeam === team) {
          setSelected(undefined)
          return
        }

        if(existingPiece.charAt(0) === 'k') {
          console.log(`GAME OVER, ${existingPiece.charAt(1)} loses!`)
        }
        setTaken(prev => [...prev, existingPiece])
      }

      setNewLocation(`${ri},${ci}`)
      
      setSelected(undefined)
      return
    }
    // if not, then select the cell    
    setSelected({ ri, ci})
  }

  const setNewLocation = (text: string) => {
    const [newRow, newCol] = text.split(",").map(h => parseInt(h))

    if (selected == undefined) return

    let newGrid = grid

    // zero out current location
    const piece = newGrid[selected?.ri][selected?.ci] 
    newGrid[selected?.ri][selected?.ci] = 'z'
    
    // move to new coordinates
    newGrid[newRow][newCol] = piece
    
    setGrid(newGrid)
  }

  return (
    <div className="background">
      <section className="board">
      {grid.map((row, ri) => {
        return <div className="row"> 
          {grid[ri].map((col, ci) => <Cell ri={ri} ci={ci} onSelect={handleSelect} isSelected={ri == selected?.ri && ci == selected?.ci}>
            <Piece name={col} />
          </Cell>)}
        </div>
      })} 
      </section>
      <section>
        <h2>{selected === undefined ? "Click on a cell" : `Moving ${selected.ri},${selected.ci}`}</h2>
        <input onChange={(e) => setInput(e.target.value)}/>
        <button onClick={() => setNewLocation(input)}>submit</button>
      </section>
      <section>
        <h2>Taken pieces:</h2>
        <h3>{takenPieces.join(", ")}</h3>
      </section>
    </div>
    )
}

export default App
