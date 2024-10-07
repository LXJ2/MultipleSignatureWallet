import React, { FC } from 'react';
import useMessage from "antd/es/message/useMessage";
import { useEffect, useState, useRef } from "react";
import styles from "../../styles/home.module.css"
import { Steps, Button } from 'antd'
import { UTXO } from '../../utils'
import { Step1 } from '../../components/Step1';
import { Step2 } from '../../components/Step2'

const NewTransactions: FC<{ title?: string }> = ({ title }) => {
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  });
  const [messageApi, contextHolder] = useMessage();
  const [current, setCurrent] = useState(1);
  const [unisatInstalled, setUnisatInstalled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [publicKey, setPublicKey] = useState("");
  const [selectUtxos, setSelectUtxos] = useState<UTXO[]>([]);
  const [utxoAccount, setUtxoAccount] = useState(0);

  const step1Ref = useRef<any>(null);
  const step2Ref = useRef<any>(null);
  const steps = [
    {
      id: 1,
      title: ''
    },
    {
      id: 2,
      title: ''
    },
  ];

  useEffect(() => {

  }, [selectUtxos])

  const stepChange = (item: { id: any; title?: string; }) => {
    setCurrent(item.id);
  };

  const handleSelectUtxo = () => {

    if (step1Ref.current) {
      const utxos = step1Ref.current.getUtxos(); // 调用子组件的方法
      const account = step1Ref.current.getUtxoAccount(); // 调用子组件的方法

      if (utxos.length) {
        setSelectUtxos(utxos)
        setUtxoAccount(account)
        setCurrent(current == 1 ? 2 : 1);
      } else {
        messageApi.error('Please Select Utxos!')
      }
    } else {
      setCurrent(current == 1 ? 2 : 1);
    }
  };

  const handleSubmitTransaction = () => {
    if (step2Ref.current) {
      const utxos = step2Ref.current.submitCheck(); // 调用子组件的方法
    } else {
      const utxos = step1Ref.current.getUtxos(); // 调用子组件的方法
      const account = step1Ref.current.getUtxoAccount(); // 调用子组件的方法

      if (utxos.length) {
        setSelectUtxos(utxos)
        setUtxoAccount(account)
        setCurrent(current == 1 ? 2 : 1);
      } else {
        messageApi.error('Please Select Utxos!')
      }
      setCurrent(current == 1 ? 2 : 1);
    }
  };
  return (
    <>
      {contextHolder}
      <div className={styles.deposits}>
        <div className={styles.steps}>
          {steps?.map((item, index) => {
            return (
              <div key={index}
                className={`${styles.step} ${item.id == current ? styles.stepSelect : ''}`}
                onClick={() => stepChange(item)}
              >
              </div>
            );
          })}
        </div>
        {current === 1 ? <Step1 ref={step1Ref} /> : ''}
        {current === 2 ? <Step2 utxoAccount={utxoAccount} selectUtxos={selectUtxos} ref={step2Ref} /> : ''}
        <div style={{ marginTop: 24 }}>
          <Button type="primary" onClick={() => handleSelectUtxo()} style={{ marginRight: '20px' }}>
            Select UTXO
          </Button>
          <Button type="primary" onClick={() => handleSubmitTransaction()}>
            {current == 1 ? 'Next' : 'Send to Signer'}
          </Button>
        </div>
      </div>
    </>
  )

}

export { NewTransactions };
