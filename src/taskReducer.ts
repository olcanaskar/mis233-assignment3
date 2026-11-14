export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }

/** The filter is part of the reducer state; 'all' shows every task. */
export type Filter = 'all' | Status

export type State = { tasks: Task[]; filter: Filter }

export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }

const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

export const initialState: State = { tasks: [], filter: 'all' }

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        tasks: [
          ...state.tasks,
          { id: action.id, title: action.title, status: 'todo' },
        ],
      }
    case 'advance':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? { ...task, status: NEXT[task.status] }
            : task,
        ),
      }
    case 'remove':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
      }
    default: {
      const exhaustiveCheck: never = action
      return exhaustiveCheck
    }
  }
}
