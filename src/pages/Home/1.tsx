import React, { FC, useRef } from 'react';
import styles from "../../styles/home.module.css"
import { useEffect, useState, useMemo } from "react";
import asset from "../../assets/images/wallet.svg"
import { CHAINS_MAP, ChainType } from "../../const";
import { shortenAddress } from '../../utils';
import { useQuery } from '@tanstack/react-query';
import useMessage from "antd/es/message/useMessage";
import { copyToClipboard, satoshisToAmount } from "../../utils";
interface walletProps {
    wallet: { address: string }
}

interface signersProp {
    id: number,
    publicKey: string,
    walletAddress: string
}

const Home: FC<{ title?: string }> = ({ title }
) => {

    const [unisatInstalled, setUnisatInstalled] = useState(false);
    const [connected, setConnected] = useState(false);
    const [accounts, setAccounts] = useState<string[]>([]);
    const [account, setAccount] = useState<walletProps[]>([]);
    const [signers, setWalletInfor] = useState<signersProp[]>([])
    const [publicKey, setPublicKey] = useState(localStorage.getItem("publicKey"));
    const [address, setAddress] = useState("");
    const [balance, setBalance] = useState({
        confirmed: 0,
        unconfirmed: 0,
        total: 0,
    });
    const [messageApi, contextHolder] = useMessage();

    const fetchWalletData = async () => {
        console.log(publicKey);

        const response = await fetch(`https://api.mtxo.dev/wallets/${publicKey}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        return result;
    };

    // 使用 React Query 的 useQuery 钩子来缓存和获取钱包数据
    const {
        data: walletData,
        status,
        refetch
    } = useQuery({
        queryKey: ['account', publicKey], // 每个 publicKey 对应唯一的查询键
        queryFn: fetchWalletData,            // 查询函数
        enabled: !!publicKey,             // 当 publicKey 存在时才会触发查询
        staleTime: 30 * 60 * 1000,        // 30分钟缓存时间
        retry: 2,                         // 失败时自动重试2
    });

    useEffect(() => {
        console.log(walletData);

        if (status && walletData) {
            setAccount(walletData)
            localStorage.setItem('currentWallet', walletData[0].wallet.address);
            console.log('Server response:', walletData);
        }
        refetch()
        refetchWalletInfor()
    }, [walletData])

    const getAccount = async () => {
        const response = await fetch(`https://api.mtxo.dev/wallet/${localStorage.getItem("currentWallet")}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        return result
    }

    const {
        data: walletInfor,
        status: walletStatus,
        refetch: refetchWalletInfor
    } = useQuery({
        queryKey: ['account', publicKey], // 每个 publicKey 对应唯一的查询键
        queryFn: getAccount,            // 查询函数
        enabled: !!publicKey,             // 当 publicKey 存在时才会触发查询
        staleTime: 30 * 60 * 1000,        // 30分钟缓存时间
        retry: 2,                         // 失败时自动重试2
    });

    useEffect(() => {
        if (walletStatus && walletInfor) {
            setWalletInfor(walletInfor.signer)
        }

        refetchWalletInfor()
    }, [walletInfor])

    return (
        <>{contextHolder}
            <div className={styles.formBox}>
                <div className={styles.title}>Current Wallet</div>
                {
                    signers?.map((item, index) => {
                        return (
                            <div className={styles.btcAccount} style={{ fontSize: '20px', marginBottom: '10px' }} key={item.id} onClick={() => {
                                copyToClipboard(item.publicKey);
                                messageApi.success("PublicKey Copied.");
                            }}>
                                {item.publicKey}
                            </div>
                        )
                    })
                }
            </div>

            <div className={styles.other}>
                <div className={styles.title}>Other Wallet</div>
                <div className='grid grid-cols-4 gap-4 mt-6'>
                    {account?.map((item, index) => {
                        return (
                            <div className={styles.itemBox} key={index}>
                                <div className={styles.assets}>
                                    <img src={asset} alt="" height={30} width={30} />
                                    <div>
                                        <div className={styles.address}>{shortenAddress(item?.wallet.address)}</div>
                                        {/* <div className={styles.address}>Total deposits</div> */}
                                        {/* <div className={styles.number}>$ 78,342</div> */}
                                    </div>
                                </div>
                                <div className={styles.switch}>Switch to this</div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </>
    )
}

export { Home };