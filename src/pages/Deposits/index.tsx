import React, { FC } from 'react';

const Deposits: FC<{ title?: string }> = ({ title }) => (
  <p>Deposits! {title}</p>
);

export { Deposits };
