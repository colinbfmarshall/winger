# Fix for Maximum Update Depth Exceeded Error

## Problem
The `DuelVideoPair` component was causing infinite re-renders due to:
1. Callback functions changing on every render in parent component
2. `useEffect` dependencies including entire objects that change references
3. Missing memoization of callback functions
4. State updates triggering more state updates in loops

## Solution Applied

### 1. Fixed Parent Component (scrambleMatchScreen.js)
- **Added `useCallback`** to memoize all callback functions:
  - `handleSwipeWinner`
  - `handleNextRound` 
  - `handleFirstVideoReady`
  - `handlePlayPress`
  - `handleSwipeTopWins`
  - `handleSwipeBottomWins`

- **Used memoized callbacks** in JSX instead of inline functions
- **Added proper dependencies** to `useCallback` hooks

### 2. Fixed Child Component (DuelVideoPair.js)
- **Refined `useEffect` dependencies** to use specific properties instead of entire objects:
  - `[topMoment?.video_url, bottomMoment?.video_url, topMoment?.id, bottomMoment?.id]`
  - `[topMoment?.play_until, bottomMoment?.play_until, topMoment?.id, bottomMoment?.id]`

- **Added state management** to prevent duplicate notifications:
  - Added `hasNotifiedReady` flag
  - Reset states when videos change
  - Only call `onReadyTop` once per video load

- **Removed problematic dependency** from `onReadyTop` effect:
  - Changed from `[topVideoReady, onReadyTop]` to `[topVideoReady]`
  - Used internal flag instead to prevent multiple calls

### 3. State Reset Strategy
- **Reset all video states** when new moments are loaded:
  ```javascript
  setTopVideoReady(false);
  setHasNotifiedReady(false);
  setIsSecondVideoLoaded(false);
  setIsFirstVideoPlaying(false);
  setIsSecondVideoPlaying(false);
  ```

## Key Changes Made

### scrambleMatchScreen.js
```javascript
// Before - inline functions (bad)
onReadyTop={() => dispatch({ type: ACTIONS.FIRST_VIDEO_READY })}

// After - memoized callback (good)
const handleFirstVideoReady = useCallback(() => {
  dispatch({ type: ACTIONS.FIRST_VIDEO_READY });
}, []);
```

### DuelVideoPair.js  
```javascript
// Before - problematic dependencies
}, [topMoment, bottomMoment, onReadyTop]);

// After - specific dependencies
}, [topMoment?.video_url, bottomMoment?.video_url, topMoment?.id, bottomMoment?.id]);
```

## Result
- ✅ No more infinite re-renders
- ✅ Stable callback references
- ✅ Proper state management
- ✅ Clean component lifecycle
- ✅ Maintains all original functionality

The error should now be resolved and the component should render properly without maximum update depth issues.
