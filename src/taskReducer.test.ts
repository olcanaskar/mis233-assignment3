import { describe, expect, it } from 'vitest'
import {
  initialState,
  taskReducer,
  type Action,
  type State,
  type Task,
} from './taskReducer'

function task(
  id: string,
  title: string,
  status: Task['status'] = 'todo',
): Task {
  return { id, title, status }
}

function stateWith(...tasks: Task[]): State {
  return { tasks, filter: 'all', past: [] }
}

/** Freeze the state and everything inside it so a mutation throws. */
function freezeState(state: State): void {
  for (const item of state.tasks) Object.freeze(item)
  for (const pastTasks of state.past) {
    for (const item of pastTasks) Object.freeze(item)
    Object.freeze(pastTasks)
  }
  Object.freeze(state.tasks)
  Object.freeze(state.past)
  Object.freeze(state)
}

describe('initialState', () => {
  it('starts empty, with the all filter and no undo history', () => {
    expect(initialState).toEqual({ tasks: [], filter: 'all', past: [] })
  })
})

describe('add', () => {
  it('appends a todo task and records the old task list', () => {
    const state = stateWith(task('a', 'A'))
    const next = taskReducer(state, { type: 'add', id: 'b', title: 'B' })

    expect(next.tasks).toEqual([task('a', 'A'), task('b', 'B')])
    expect(next.tasks[1].status).toBe('todo')
    expect(next.filter).toBe('all')
    expect(next.past).toEqual([state.tasks])
    expect(next.past[0]).toBe(state.tasks)
  })
})

describe('advance', () => {
  it('advances todo -> in-progress -> done -> todo in three calls', () => {
    let state = stateWith(task('a', 'A'))

    state = taskReducer(state, { type: 'advance', id: 'a' })
    expect(state.tasks[0].status).toBe('in-progress')

    state = taskReducer(state, { type: 'advance', id: 'a' })
    expect(state.tasks[0].status).toBe('done')

    state = taskReducer(state, { type: 'advance', id: 'a' })
    expect(state.tasks[0].status).toBe('todo')
  })

  it('records history for each advance', () => {
    const state = stateWith(task('a', 'A'))
    const next = taskReducer(state, { type: 'advance', id: 'a' })

    expect(next.past).toEqual([state.tasks])
  })

  it('ignores an unknown id and does not record history', () => {
    const state = stateWith(task('a', 'A'))
    const next = taskReducer(state, { type: 'advance', id: 'missing' })

    expect(next).toEqual(state)
    expect(next.past).toHaveLength(0)
  })
})

describe('remove', () => {
  it('removes the matching task and records history', () => {
    const state = stateWith(task('a', 'A'), task('b', 'B'))
    const next = taskReducer(state, { type: 'remove', id: 'a' })

    expect(next.tasks).toEqual([task('b', 'B')])
    expect(next.past).toEqual([state.tasks])
  })

  it('ignores an unknown id and does not record history', () => {
    const state = stateWith(task('a', 'A'))
    const next = taskReducer(state, { type: 'remove', id: 'missing' })

    expect(next).toEqual(state)
    expect(next.past).toHaveLength(0)
  })
})

describe('setFilter', () => {
  it('changes only the filter and leaves the task list alone', () => {
    const state = stateWith(task('a', 'A'))
    const next = taskReducer(state, { type: 'setFilter', filter: 'done' })

    expect(next.filter).toBe('done')
    expect(next.tasks).toBe(state.tasks)
    expect(next.past).toBe(state.past)
  })

  it('does not add an undo entry', () => {
    const state = stateWith(task('a', 'A'))
    const next = taskReducer(state, { type: 'setFilter', filter: 'todo' })

    expect(next.past).toHaveLength(0)
  })
})

describe('clearDone', () => {
  it('removes every done task, keeps the filter, and records history', () => {
    const state: State = {
      tasks: [
        task('a', 'A', 'todo'),
        task('b', 'B', 'done'),
        task('c', 'C', 'done'),
      ],
      filter: 'done',
      past: [],
    }
    const next = taskReducer(state, { type: 'clearDone' })

    expect(next.tasks).toEqual([task('a', 'A', 'todo')])
    expect(next.filter).toBe('done')
    expect(next.past).toEqual([state.tasks])
  })

  it('does nothing when no task is done', () => {
    const state = stateWith(
      task('a', 'A', 'todo'),
      task('b', 'B', 'in-progress'),
    )
    const next = taskReducer(state, { type: 'clearDone' })

    expect(next).toEqual(state)
    expect(next.past).toHaveLength(0)
  })

  it('works on an empty list without creating history', () => {
    const next = taskReducer(initialState, { type: 'clearDone' })

    expect(next).toEqual(initialState)
    expect(next.past).toHaveLength(0)
  })
})

describe('undo', () => {
  it('restores the previous task list and keeps the filter', () => {
    let state: State = { tasks: [task('a', 'A')], filter: 'all', past: [] }
    state = taskReducer(state, { type: 'setFilter', filter: 'todo' })
    state = taskReducer(state, { type: 'add', id: 'b', title: 'B' })

    const next = taskReducer(state, { type: 'undo' })

    expect(next.tasks).toEqual([task('a', 'A')])
    expect(next.filter).toBe('todo')
    expect(next.past).toHaveLength(0)
  })

  it('undoes clearDone and brings the done tasks back', () => {
    const state: State = {
      tasks: [task('a', 'A', 'todo'), task('b', 'B', 'done')],
      filter: 'done',
      past: [],
    }
    const cleared = taskReducer(state, { type: 'clearDone' })
    const undone = taskReducer(cleared, { type: 'undo' })

    expect(undone.tasks).toEqual(state.tasks)
    expect(undone.filter).toBe('done')
  })

  it('does nothing when past is empty', () => {
    const state = stateWith(task('a', 'A'))
    const next = taskReducer(state, { type: 'undo' })

    expect(next).toEqual(state)
  })

  it('undoes one change at a time', () => {
    let state = initialState
    state = taskReducer(state, { type: 'add', id: 'a', title: 'A' })
    state = taskReducer(state, { type: 'add', id: 'b', title: 'B' })

    state = taskReducer(state, { type: 'undo' })
    expect(state.tasks.map((item) => item.id)).toEqual(['a'])

    state = taskReducer(state, { type: 'undo' })
    expect(state.tasks).toEqual([])
    expect(state.past).toEqual([])
  })
})

describe('purity', () => {
  it('does not mutate the previous state', () => {
    const state: State = {
      tasks: [task('a', 'A'), task('b', 'B', 'done')],
      filter: 'all',
      past: [[task('old', 'Old')]],
    }
    const snapshot = structuredClone(state)
    freezeState(state)

    const actions: Action[] = [
      { type: 'add', id: 'c', title: 'C' },
      { type: 'advance', id: 'a' },
      { type: 'remove', id: 'b' },
      { type: 'setFilter', filter: 'done' },
      { type: 'clearDone' },
      { type: 'undo' },
    ]

    for (const action of actions) {
      const next = taskReducer(state, action)
      expect(next).not.toBe(state)
      expect(state).toEqual(snapshot)
    }
  })
})
