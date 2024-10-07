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
import { Card, Row, Col, Button, Tooltip, Divider } from "antd";
import { CHAINS_MAP, ChainType } from "../../const";


const Deposits: FC<{ title?: string }> = ({ title }) => {

  const [address, setAddress] = useState(localStorage.getItem("currentWallet") || "");
  const [balance, setBalance] = useState(localStorage.getItem("currentWalletBalance") || "");
  const [messageApi, contextHolder] = useMessage();
  const chain = JSON.parse(localStorage.getItem("chain") || "{}")

  return (
    <>{contextHolder}
      <div className={styles.deposits}>
        <div className={styles.btcAccount}>
          <div className={styles.btcLeft}><img src={Btc} alt="" />{chain && chain.unit}</div>
          <div className={styles.btcRight}>{balance} {chain && chain.unit}</div>
        </div>
        <div className={styles.qrcode}>
          <QRCodeSVG value={address} size={200} />
        </div>
        <div className={styles.btcAccount} onClick={() => {
          copyToClipboard(address);
          messageApi.success("PublicKey Copied.");
        }}
        >
          <div className={styles.addressLeft}>
            <div className={styles.inputAddress}>deposit address (BTC)</div>
            <div style={{ fontSize: "20px" }}>{address}</div>
          </div>
          <div className={styles.btcRight} ><Tooltip title="Copy Address">
            <Button
              shape="circle"
              icon={<CopyOutlined />}
              style={{ marginLeft: 10 }}
            />
          </Tooltip></div>
        </div>
      </div>
    </>
  )
}

export { Deposits };
