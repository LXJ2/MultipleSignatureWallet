import React, { FC } from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom'; // 重命名 Router 的 Routes

import { Home, NewWallet, Deposits, NewTransactions, Transactions } from '../pages';

const AppRoutes: FC = () => (
  <RouterRoutes>
    <Route path="/" element={<Home />} />
    <Route path="/newwallet" element={<NewWallet />} />
    <Route path="/deposits" element={<Deposits />} />
    <Route path="/newtransaction" element={<NewTransactions />} />
    <Route path="/transactions" element={<Transactions />} />

  </RouterRoutes>
);

export default AppRoutes;
