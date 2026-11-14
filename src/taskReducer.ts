// Olcan Askar
// Student number: 2024502180
//
// Assignment 3: Task Manager with a Reducer
// The reducer is a pure function: it never mutates the state it receives.

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }

/** The filter is part of the reducer state; 'all' shows every task. */
export type Filter = 'all' | Status

/**
 * `past` is the undo stack: each entry is the task list as it looked before
 * a task-changing action. `setFilter` never adds an entry.
 */
export type State = { tasks: Task[]; filter: Filter; past: Task[][] }

export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }
  | { type: 'undo' }

const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

export const initialState: State = { tasks: [], filter: 'all', past: [] }

/** Return a new state whose tasks changed, remembering the old task list. */
function withHistory(state: State, tasks: Task[]): State {
  return {
    ...state,
    tasks,
    past: [...state.past, state.tasks],
  }
}

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return withHistory(state, [
        ...state.tasks,
        { id: action.id, title: action.title, status: 'todo' },
      ])
    case 'advance': {
      if (!state.tasks.some((task) => task.id === action.id)) return state
      return withHistory(
        state,
        state.tasks.map((task) =>
          task.id === action.id
            ? { ...task, status: NEXT[task.status] }
            : task,
        ),
      )
    }
    case 'remove': {
      if (!state.tasks.some((task) => task.id === action.id)) return state
      return withHistory(
        state,
        state.tasks.filter((task) => task.id !== action.id),
      )
    }
    case 'setFilter':
      return { ...state, filter: action.filter }
    case 'clearDone': {
      if (!state.tasks.some((task) => task.status === 'done')) return state
      return withHistory(
        state,
        state.tasks.filter((task) => task.status !== 'done'),
      )
    }
    case 'undo': {
      const previous = state.past[state.past.length - 1]
      if (!previous) return state
      return {
        ...state,
        tasks: previous,
        past: state.past.slice(0, -1),
      }
    }
    default: {
      // If a new action type is added and not handled above, `action`
      // is no longer `never`, so this line becomes a TypeScript error.
      const exhaustiveCheck: never = action
      return exhaustiveCheck
    }
  }
}
