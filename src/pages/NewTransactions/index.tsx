import React, { FC } from 'react';

const NewTransactions: FC<{ title?: string }> = ({ title }) => (
  <p>home! {title}</p>
);

export { NewTransactions };
