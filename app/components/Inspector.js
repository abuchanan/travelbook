import React from 'react';

export const Inspector = ({children, active}) => {
  // Find the active child component matching the "active" prop
  for (var child of children) {
    if (active == child.key) {
      return child;
    }
  }
  return <div></div>;
};
