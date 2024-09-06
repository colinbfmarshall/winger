import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = __DEV__ 
  ? 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const useDuelLogic = (topicValue, onComplete) => {
  const [duels, setDuels] = useState([]);
  const [duelSessionId, setDuelSessionId] = useState(null);
  const [isFirstVideoPlaying, setIsFirstVideoPlaying] = useState(true);
  const [isSecondVideoPlaying, setIsSecondVideoPlaying] = useState(false);
  const prevDuelsRef = useRef(duels);

  useEffect(() => {
    startDuelSession(topicValue);
  }, [topicValue]);

  useEffect(() => {
    if (duels !== prevDuelsRef.current) {
      setIsFirstVideoPlaying(true);
      setIsSecondVideoPlaying(false);
      prevDuelsRef.current = duels;
    }
  }, [duels]);

  const startDuelSession = (topicValue) => {
    axios.post(`${API_URL}/api/v1/duel_sessions/start`, {
      topic_type: "action",
      topic_value: 'try',
    })
      .then(response => {
        setDuels(response.data.duels);
        setDuelSessionId(response.data.duel_session_id);
      })
      .catch(error => {
        console.error('There was an error starting the duel session!', error);
      });
  };

  const submitWinner = (winnerId) => {
    axios.post(`${API_URL}/api/v1/duels/submit`, {
      winner_id: winnerId,
      moment1_id: duels[0].id,
      moment2_id: duels[1].id,
      duel_session_id: duelSessionId,
    })
    .then(response => {
      console.log('Duel result submitted:', response.data);
      if (response.data.status === 'completed') {
        onComplete();
      } else if (response.data.duels) {
        setDuels(response.data.duels);
        setIsFirstVideoPlaying(true);
        setIsSecondVideoPlaying(false);
      }
    })
    .catch(error => {
      console.error('There was an error submitting the duel result!', error);
    });
  };

  return {
    duels,
    isFirstVideoPlaying,
    isSecondVideoPlaying,
    setIsFirstVideoPlaying,
    setIsSecondVideoPlaying,
    submitWinner,
  };
};

export default useDuelLogic;