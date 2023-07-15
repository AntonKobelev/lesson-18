import { createAction, createSlice } from "@reduxjs/toolkit";
import todosService from "../services/todos.service";
import { setError } from "./errors";
const initialState = { entities: [], isLoading: true };

// const TASK_UPDATED = "task/updated";
// const TASK_DELETED = "task/deleted";

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    recieved(state, action) {
      state.entities = action.payload;
      state.isLoading = false;
    },
    update(state, action) {
      const elementIndex = state.entities.findIndex(
        (el) => el.id === action.payload.id
      );
      state.entities[elementIndex] = {
        ...state[elementIndex],
        ...action.payload,
      };
    },
    remove(state, action) {
      state.entities = state.entities.filter(
        (el) => el.id !== action.payload.id
      );
    },
    loadTasksRequested(state) {
      state.isLoading = true;
    },

    taskRequestFailed(state, action) {
      state.isLoading = false;
    },
    taskAdded(state, action) {
      state.entities.push(action.payload);
    },
  },
});

const { actions, reducer: taskReducer } = taskSlice;
const {
  update,
  remove,
  recieved,
  taskRequestFailed,
  taskAdded,
  loadTasksRequested,
} = actions;

const taskRequested = createAction("task/taskRequested");

export const loadTasks = () => async (dispatch) => {
  dispatch(loadTasksRequested());
  try {
    const data = await todosService.fetch();
    dispatch(recieved(data));
  } catch (error) {
    dispatch(taskRequestFailed(error.message));
    dispatch(setError(error.message));
  }
};

export const createTask = (task) => async (dispatch) => {
  dispatch(taskRequested());
  try {
    const data = await todosService.create(task);
    dispatch(taskAdded(data));
  } catch (error) {
    dispatch(taskRequestFailed(error.message));
    dispatch(setError(error.message));
  }
};

export const completeTask = (id) => async (dispatch, getState) => {
  dispatch(update({ id, completed: true }));
};

export function titleChanged(id) {
  return update({ id, title: `New title for ${id}` });
}

export function taskDeleted(id) {
  return remove({ id });
}

export const getTasks = () => (state) => state.tasks.entities;
export const getTasksLoadingStatus = () => (state) => state.tasks.isLoading;

export default taskReducer;
