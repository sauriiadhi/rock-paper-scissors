import { ref, update } from 'firebase/database';
import { rtdb } from './firebase';

export const handleVisibilityChange = (username) => {
  const userStatusRef = ref(rtdb, `players/${username}`);

  const handleStatusChange = () => {
    update(userStatusRef, { active: document.visibilityState === 'visible' });
  };

  document.addEventListener('visibilitychange', handleStatusChange);

  window.addEventListener('beforeunload', () => {
    update(userStatusRef, { active: false });
  });
  
  update(userStatusRef, { active: true });

  return () => {
    document.removeEventListener('visibilitychange', handleStatusChange);
    update(userStatusRef, { active: false });
  };
};
