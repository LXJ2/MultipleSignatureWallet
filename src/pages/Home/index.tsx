import React, { FC, useRef } from 'react';
import styles from "../../styles/home.module.css"
import { useEffect, useState, useMemo } from "react";
import asset from "../../assets/images/wallet.svg"
import { CHAINS_MAP, ChainType } from "../../const";
import { shortenAddress } from '../../utils';

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
  const [account, setAccount] = useState<walletProps[]>([]);
  const [signers, setWalletInfor] = useState<signersProp[]>([])
  const [publicKey, setPublicKey] = useState(localStorage.getItem('publicKey'));
  const [currentWallet, setCurrentWallet] = useState(localStorage.getItem('currentWallet'));

  useEffect(() => {
    getAccounts()
    getAccount(currentWallet as string)
  }, [publicKey, currentWallet])

  const getAccounts = async () => {
    try {
      const response = await fetch(`https://api.mtxo.dev/wallets/${publicKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setAccount(result)
    } catch (error) {
      console.error('Error sending POST request:', error);
    }
  }

  const getAccount = async (wallet: string) => {
    let result
    try {
      const response = await fetch(`https://api.mtxo.dev/wallet/${wallet}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      result = await response.json();
      setWalletInfor(result.signers)
      localStorage.setItem('currentWallet', result.address);
      localStorage.setItem('currentWalletInfor', JSON.stringify(result));
    } catch (error) {
      console.error('Error sending POST request:', error);
    }
    return result
  }

  const switchWallet = async (wallet: string) => {
    const res = await getAccount(wallet)
    if (res.address) {
      window.location.reload();
    }
  }

  return (
    <>
      <div className={styles.formBox}>
        <div className={styles.title}>Signer Publickey</div>
        {
          signers.map((item, index) => {
            return (
              <div className={styles.btcAccount} style={{ fontSize: '20px', marginBottom: '10px' }} key={item.id}>
                {item.publicKey}
              </div>
            )
          })
        }

      </div>

      <div className={styles.other}>
        <div className={styles.title}>Multi-sig Wallet List</div>
        <div className='grid grid-cols-4 gap-4 mt-6'>
          {account?.map((item, index) => {
            return (
              <div className={styles.itemBox} key={index}>
                <div className={styles.assets}>
                  <img src={asset} alt="" height={30} width={30} />
                  <div>
                    <div className={styles.address}>{shortenAddress(item.wallet.address)}</div>
                    {/* <div className={styles.address}>Total deposits</div>
                    <div className={styles.number}>$ 78,342</div> */}
                  </div>
                </div>
                <div className={styles.switch} onClick={() => { switchWallet(item.wallet.address) }}>Switch to this</div>
              </div>
            );
          })}
        </div>
      </div>

    </>
  )
}

export { Home };

