export const PHASES = {
  INSTRUCTIONS: 'INSTRUCTIONS',
  DUEL: 'DUEL',
  RESULT: 'RESULT',
  COMPLETE: 'COMPLETE'
};

export const ACTIONS = {
  INIT_SESSION: 'INIT_SESSION',
  FIRST_VIDEO_READY: 'FIRST_VIDEO_READY',
  TAP_PLAY: 'TAP_PLAY',
  SWIPE_WINNER: 'SWIPE_WINNER',
  SHOW_RESULT: 'SHOW_RESULT',
  PRELOAD_NEXT_READY: 'PRELOAD_NEXT_READY',
  NEXT_ROUND: 'NEXT_ROUND',
  COMPLETE: 'COMPLETE',
  SET_LOADING: 'SET_LOADING'
};

export const initialState = {
  phase: PHASES.INSTRUCTIONS,
  roundIndex: 0,
  sessionId: null,
  duels: [],
  currentPair: [],
  preloadedNextPairReady: false,
  loading: true,
  winnerMoment: null,
  loserMoment: null
};

export function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.INIT_SESSION:
      return {
        ...state,
        sessionId: action.payload.sessionId,
        duels: action.payload.duels,
        currentPair: action.payload.duels.length > 0 ? [action.payload.duels[0].moment1, action.payload.duels[0].moment2] : [],
        loading: false
      };

    case ACTIONS.FIRST_VIDEO_READY:
      return {
        ...state,
        preloadedNextPairReady: true
      };

    case ACTIONS.TAP_PLAY:
      return {
        ...state,
        phase: PHASES.DUEL,
        preloadedNextPairReady: false
      };

    case ACTIONS.SWIPE_WINNER:
      return {
        ...state,
        winnerMoment: action.payload.winner,
        loserMoment: action.payload.loser
      };

    case ACTIONS.SHOW_RESULT:
      return {
        ...state,
        phase: PHASES.RESULT
      };

    case ACTIONS.PRELOAD_NEXT_READY:
      return {
        ...state,
        preloadedNextPairReady: true
      };

    case ACTIONS.NEXT_ROUND:
      const nextRoundIndex = state.roundIndex + 1;
      
      if (nextRoundIndex >= state.duels.length) {
        return {
          ...state,
          phase: PHASES.COMPLETE
        };
      }

      const nextDuel = state.duels[nextRoundIndex];
      return {
        ...state,
        phase: PHASES.DUEL,
        roundIndex: nextRoundIndex,
        currentPair: [nextDuel.moment1, nextDuel.moment2],
        preloadedNextPairReady: false,
        winnerMoment: null,
        loserMoment: null
      };

    case ACTIONS.COMPLETE:
      return {
        ...state,
        phase: PHASES.COMPLETE
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    default:
      return state;
  }
}
