import React, { forwardRef, useImperativeHandle } from 'react';
import {
    CopyOutlined,
} from '@ant-design/icons';
import useMessage from "antd/es/message/useMessage";
import Btc from "../assets/images/btc.svg"
import arrowDown from "../assets/images/arrowDown.svg"
import { useEffect, useState, useRef } from "react";
import styles from "../styles/home.module.css"
import { copyToClipboard, satoshisToAmount, shortenTransaction } from "../utils";
import { UTXO } from '../utils'

const Step1 = forwardRef((props, ref) => {

    const [currentWallet, setCurrentWallet] = useState(localStorage.getItem('currentWallet'));
    const [chain, setChain] = useState(JSON.parse(localStorage.getItem('chain') || "{}"));
    const [messageApi, contextHolder] = useMessage();

    const [address, setAddress] = useState(localStorage.getItem("currentWallet") || "");
    const [balance, setBalance] = useState(localStorage.getItem("currentWalletBalance") || "");
    const [utxos, setUtxos] = useState<UTXO[]>([]);
    const [selectUtxos, setSelectUtxos] = useState<UTXO[]>([]);
    const [utxoAccount, setUtxoAccount] = useState(0);

    const selctChange = (item: UTXO) => {
        // 使用map创建一个新的utxos数组并更新状态
        const updatedUtxos = utxos.map((utxo) =>
            utxo.txid === item.txid ? { ...utxo, select: !utxo.select } : utxo
        );
        setUtxos(updatedUtxos); // 更新状态以触发重新渲染
        let account = 0
        let ary: Array<UTXO> = []
        updatedUtxos.forEach((utxo) => {
            if (utxo.select) {
                account = account + utxo.satoshis
                ary.push(utxo)
            }
        })
        setSelectUtxos(ary)
        setUtxoAccount(account)
    };

    useEffect(() => {
        console.log(currentWallet);

        async function getbanlance() {
            const res = await fetch(
                `${chain.endpoints}/v5/address/btc-utxo?address=${currentWallet}`,
                {
                    method: "GET",
                },
            );
            const data = (await res.json()).data;
            setUtxos(data)
        }
        getbanlance().then()
    }, [])

    // 将子组件方法暴露给父组件
    useImperativeHandle(ref, () => ({
        getUtxos: () => {
            return selectUtxos; // 返回当前输入的值
        },
        getUtxoAccount: () => {
            return utxoAccount;
        }
    }));

    return (
        <>
            {contextHolder}
            <div className={styles.btcAccount}>
                <div className={styles.btcLeft}><img src={Btc} alt="" />{chain && chain.unit}</div>
                <div className={styles.btcRight}>{balance} {chain && chain.unit}</div>
            </div>
            <div style={{ width: '730px', marginTop: '50px' }}>
                <div className={styles.title} style={{ color: '#ffffff', textAlign: 'left' }}>Select UTXO</div>
            </div>
            <div className='grid grid-cols-4 gap-4 mb-20 w-[730px]'>
                {utxos?.map((item, index) => {
                    return (
                        <div className={styles.itemBox} key={index}>
                            <div
                                className={`${styles.utxoBox} ${item.select ? styles.utxoSelect : ''}`}
                                onClick={() => selctChange(item)}
                            >
                                <div className={styles.number}>{satoshisToAmount(item.satoshis)} {chain && chain.unit}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className={styles.btcAccount} style={{ width: '730px', marginBottom: '50px' }}>
                <div className={styles.btcLeft}>UTXO amount</div>
                <div className={styles.btcRight}>{satoshisToAmount(utxoAccount)}{chain && chain.unit}</div>
            </div>
        </>
    );
});

export { Step1 };