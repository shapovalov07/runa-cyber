'use client';

export const trackFranchiseEvent = (goal, params = {}) => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('runa:metrika', {
      detail: {
        goal,
        params,
      },
    })
  );
};
