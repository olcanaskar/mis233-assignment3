import { useReducer } from 'react'
import type { Dispatch } from 'react'
import { initialState, taskReducer } from './taskReducer'
import type { Action, Filter, Task } from './taskReducer'
import { countByFilter, FILTERS, filterTasks } from './filter'
import TaskRow from './TaskRow'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    if (title) dispatch({ type: 'add', id: crypto.randomUUID(), title })
  }

  return (
    <form className="add-form" action={addTask}>
      <input
        name="title"
        placeholder="What needs to be done?"
        aria-label="New task title"
      />
      <button type="submit">Add task</button>
    </form>
  )
}

function FilterBar({
  filter,
  counts,
  dispatch,
}: {
  filter: Filter
  counts: Record<Filter, number>
  dispatch: Dispatch<Action>
}) {
  return (
    <div className="filter-bar" role="group" aria-label="Filter tasks">
      {FILTERS.map((value) => (
        <button
          key={value}
          type="button"
          className={filter === value ? 'filter active' : 'filter'}
          aria-pressed={filter === value}
          onClick={() => dispatch({ type: 'setFilter', filter: value })}
        >
          {FILTER_LABELS[value]} ({counts[value]})
        </button>
      ))}
    </div>
  )
}

function TaskList({
  tasks,
  dispatch,
}: {
  tasks: Task[]
  dispatch: Dispatch<Action>
}) {
  if (tasks.length === 0) {
    return <p className="empty">No tasks here.</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onNext={() => dispatch({ type: 'advance', id: task.id })}
          onDelete={() => dispatch({ type: 'remove', id: task.id })}
        />
      ))}
    </ul>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Derived while rendering: never stored in state.
  const visibleTasks = filterTasks(state.tasks, state.filter)
  const counts = countByFilter(state.tasks)

  return (
    <main className="app">
      <header className="app-header">
        <h1>Task Manager</h1>
        <p>Add tasks, move them along, and filter the list.</p>
      </header>

      <AddForm dispatch={dispatch} />

      <div className="toolbar">
        <FilterBar
          filter={state.filter}
          counts={counts}
          dispatch={dispatch}
        />
        <div className="history-actions">
          <button
            type="button"
            className="undo"
            onClick={() => dispatch({ type: 'undo' })}
            disabled={state.past.length === 0}
          >
            Undo
          </button>
          <button
            type="button"
            className="clear-done"
            onClick={() => dispatch({ type: 'clearDone' })}
          >
            Clear done
          </button>
        </div>
      </div>

      <TaskList tasks={visibleTasks} dispatch={dispatch} />
    </main>
  )
}
