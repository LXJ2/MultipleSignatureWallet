import React, { FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CopyOutlined,
} from '@ant-design/icons';
import useMessage from "antd/es/message/useMessage";
import Btc from "../../assets/images/btc.svg"
import arrowDown from "../../assets/images/arrowDown.svg"
import { useEffect, useState, useRef } from "react";
import styles from "../../styles/home.module.css"
import { copyToClipboard, satoshisToAmount } from "../../utils";
import { Button, Card, CollapseProps, Collapse, message } from "antd";
import { TxCard } from "../../components/TxCard"
import { Tag } from 'antd';

export interface transactionsProp {
  unconfirmTx: UnconfirmTx[]
  confirmedTx: ConfirmedTx[]
}

export interface UnconfirmTx {
  id: number
  signerCount: number
  createAt: string
}

export interface ConfirmedTx {
  id: number
  signerCount: number
  createAt: string
  txid: string
}

const Transactions: FC<{ title?: string }> = ({ title }) => {
  const [messageApi, contextHolder] = useMessage();
  const [currentWallet, setCurrentWallet] = useState(localStorage.getItem('currentWallet'));
  const [transactions, setTransactions] = useState<CollapseProps["items"]>([])
  const [currentWalletInfor, setCurrentWalletInfor] = useState(JSON.parse(localStorage.getItem('currentWalletInfor') || "{}"));

  useEffect(() => {
    getTransactions()
  }, [currentWallet])

  const getTransactions = async () => {
    try {
      const response = await fetch(`https://api.mtxo.dev/tx/${currentWallet}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      let arr: CollapseProps["items"] = []
      result?.unconfirmTx?.forEach((element: ConfirmedTx, index: any) => {
        console.log(element);

        arr?.push({
          key: element.id,
          label: <div style={{ display: "flex", justifyContent: 'space-around', color: "#fff" }}>
            <div>{index + 1}</div>
            <div>Transaction Builder</div>
            <div>{element.createAt}</div>
            <div style={{ color: '#F46171' }}>{`${element.signerCount} out of ${currentWalletInfor?.threshold}`}</div>
            <Tag>confirm</Tag>
          </div>,
          children: <TxCard item={element} update={getTransactions} />,
        })
      });
      result?.confirmedTx?.forEach((element: ConfirmedTx, index: any) => {
        arr?.push({
          key: element.id,
          label: <div style={{ display: "flex", justifyContent: 'space-around', color: "#fff" }}>
            <div>{result.unconfirmTx.length + index + 1}</div>
            <div>Transaction Builder</div>
            <div>{element.createAt}</div>
            <Tag color="green">success</Tag>
          </div>,
          children: <TxCard item={element} update={getTransactions} />,
        })
      });
      setTransactions(arr)
    } catch (error) {
      console.error('Error sending POST request:', error);
    }
  }


  return (
    <>{contextHolder}
      <div className={styles.deposits}>
        <Collapse
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            width: "90%",
            color: '#fff',
            marginTop: '20px'
          }}
          expandIconPosition='end'
          items={transactions}
          defaultActiveKey={[]}
          onChange={() => {
            // todo
          }}
        />

      </div>
    </>
  )
}

export { Transactions };
