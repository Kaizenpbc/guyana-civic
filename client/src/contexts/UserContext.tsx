import React, { createContext, useContext } from 'react';

export const UserContext = createContext({ role: 'resident' });

export const useUser = () => useContext(UserContext);
