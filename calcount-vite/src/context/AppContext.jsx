import { createContext, useContext, useReducer, useCallback } from 'react';
import { storage } from '../utils/storage';

const AppContext = createContext(null);

const initialState = {
  screen: 'home',
  apiKey: storage.getKey(),
  goal: storage.getGoal(),
  entries: storage.getEntries(),
  meals: storage.getMeals(),

  // Scan / Review
  scanned: null,
  capturedImg: null,
  servings: 1,
  trackMode: 'servings',
  grams: '',
  processing: false,

  // Describe
  describeText: '',
  describeResult: null,
  describeLoading: false,

  // Home
  editIdx: null,
  selectMode: false,
  selectedIdxs: new Set(),

  // History
  histExpanded: {},
};

// Bootstrap: go straight to home if setup is done
if (initialState.apiKey && initialState.goal) {
  initialState.screen = 'home';
} else {
  initialState.screen = 'setup';
}

function reducer(state, action) {
  switch (action.type) {
    case 'GO_TO':
      return { ...state, screen: action.screen };

    case 'SETUP_SAVE': {
      storage.setKey(action.apiKey);
      storage.setGoal(action.goal);
      return { ...state, apiKey: action.apiKey, goal: action.goal, screen: 'home' };
    }

    case 'SET_GOAL': {
      storage.setGoal(action.goal);
      return { ...state, goal: action.goal };
    }

    case 'SET_API_KEY': {
      storage.setKey(action.apiKey);
      return { ...state, apiKey: action.apiKey };
    }

    case 'ADD_ENTRY': {
      const entries = [...state.entries, action.entry];
      storage.setEntries(entries);
      return { ...state, entries };
    }

    case 'DELETE_ENTRY': {
      const entries = state.entries.filter((_, i) => i !== action.idx);
      storage.setEntries(entries);
      return { ...state, entries };
    }

    case 'UPDATE_ENTRY': {
      const entries = state.entries.map((e, i) => (i === action.idx ? action.entry : e));
      storage.setEntries(entries);
      return { ...state, entries, editIdx: null };
    }

    case 'DUPLICATE_ENTRY': {
      const copy = { ...state.entries[action.idx], id: Date.now() };
      const entries = [...state.entries];
      entries.splice(action.idx + 1, 0, copy);
      storage.setEntries(entries);
      return { ...state, entries };
    }

    case 'ADD_ENTRIES': {
      const entries = [...state.entries, ...action.entries];
      storage.setEntries(entries);
      return { ...state, entries };
    }

    case 'CLEAR_ENTRIES': {
      storage.setEntries([]);
      return { ...state, entries: [] };
    }

    case 'SET_EDIT_IDX':
      return { ...state, editIdx: action.idx };

    case 'SET_SELECT_MODE':
      return { ...state, selectMode: action.value, selectedIdxs: new Set() };

    case 'TOGGLE_SELECTION': {
      const next = new Set(state.selectedIdxs);
      if (next.has(action.idx)) next.delete(action.idx);
      else next.add(action.idx);
      return { ...state, selectedIdxs: next };
    }

    case 'SAVE_MEAL': {
      const meals = [
        ...state.meals,
        { id: Date.now(), name: action.name, items: action.items },
      ];
      storage.setMeals(meals);
      return { ...state, meals, selectMode: false, selectedIdxs: new Set() };
    }

    case 'DELETE_MEAL': {
      const meals = state.meals.filter((m) => m.id !== action.id);
      storage.setMeals(meals);
      return { ...state, meals };
    }

    case 'ADD_MEAL_ENTRIES': {
      const newEntries = action.items.map((item) => ({
        ...item,
        id: Date.now() + Math.random(),
      }));
      const entries = [...state.entries, ...newEntries];
      storage.setEntries(entries);
      return { ...state, entries };
    }

    case 'SET_SCANNED':
      return {
        ...state,
        scanned: action.scanned,
        capturedImg: action.capturedImg,
        servings: 1,
        trackMode: 'servings',
        grams: '',
        processing: false,
        screen: 'review',
      };

    case 'SET_PROCESSING':
      return { ...state, processing: action.value };

    case 'SET_TRACK_MODE':
      return { ...state, trackMode: action.mode };

    case 'SET_SERVINGS':
      return { ...state, servings: action.value };

    case 'SET_GRAMS':
      return { ...state, grams: action.value };

    case 'SET_DESCRIBE_TEXT':
      return { ...state, describeText: action.value };

    case 'SET_DESCRIBE_LOADING':
      return { ...state, describeLoading: action.value };

    case 'SET_DESCRIBE_RESULT':
      return { ...state, describeResult: action.result, describeLoading: false };

    case 'CLEAR_DESCRIBE':
      return { ...state, describeText: '', describeResult: null, describeLoading: false };

    case 'TOGGLE_HIST_DAY': {
      const histExpanded = {
        ...state.histExpanded,
        [action.date]: !state.histExpanded[action.date],
      };
      return { ...state, histExpanded };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const goTo = useCallback(
    (screen) => dispatch({ type: 'GO_TO', screen }),
    []
  );

  return (
    <AppContext.Provider value={{ state, dispatch, goTo }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
