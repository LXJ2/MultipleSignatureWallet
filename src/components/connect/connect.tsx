import useMessage from "antd/es/message/useMessage";
import React, { useEffect, useRef, useState } from "react";
import { Divider, Dropdown, Menu } from 'antd';
import { CHAINS_MAP, ChainType } from "../../const";
import styles from "../../styles/Nav.module.css"
import { shortenAddress, satoshisToAmount } from "../../utils"
import { useNavigate } from 'react-router-dom';

export default function Connect() {
  const navigate = useNavigate(); // 创建导航器
  const [unisatInstalled, setUnisatInstalled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [publicKey, setPublicKey] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  });
  const [network, setNetwork] = useState("livenet");
  const [chainType, setChainType] = useState<ChainType>(
    ChainType.BITCOIN_MAINNET
  );
  const chain = CHAINS_MAP[chainType];

  useEffect(() => {
    localStorage.setItem('publicKey', publicKey);
    localStorage.setItem('connected', connected ? '1' : '0');
    localStorage.setItem('address', address);
    localStorage.setItem('balance', JSON.stringify(balance));
    localStorage.setItem('chainType', chainType);
    localStorage.setItem('chain', JSON.stringify(chain));
  }, [publicKey, address, balance, network, chainType, connected])

  const getBasicInfo = async () => {
    const unisat = (window as any).unisat;

    try {
      const accounts = await unisat.getAccounts();
      setAccounts(accounts);
    } catch (e) {
      console.log("getAccounts error", e);
    }

    try {
      const publicKey = await unisat.getPublicKey();
      setPublicKey(publicKey.slice(2));
    } catch (e) {
      console.log("getPublicKey error", e);
    }

    try {
      const balance = await unisat.getBalance();
      setBalance(balance);
    } catch (e) {
      console.log("getBalance error", e);
    }

    try {
      const chain = await unisat.getChain();
      setChainType(chain.enum);
    } catch (e) {
      console.log("getChain error", e);
    }

    try {
      const network = await unisat.getNetwork();
      setNetwork(network);
    } catch (e) {
      console.log("getNetwork error", e);
    }

    if (unisat.getChain !== undefined) {
      try {
        const chain = await unisat.getChain();
        setChainType(chain.enum);
      } catch (e) {
        console.log("getChain error", e);
      }
    }
  };

  const selfRef = useRef<{ accounts: string[] }>({
    accounts: [],
  });
  const self = selfRef.current;
  const handleAccountsChanged = (_accounts: string[]) => {
    if (self.accounts[0] === _accounts[0]) {
      // prevent from triggering twice
      return;
    }
    self.accounts = _accounts;
    if (_accounts.length > 0) {
      setAccounts(_accounts);
      setConnected(true);

      setAddress(_accounts[0]);

      getBasicInfo();
    } else {
      setConnected(false);
    }
  };

  const handleNetworkChanged = (network: string) => {
    setNetwork(network);
    getBasicInfo();
  };

  const handleChainChanged = (chain: {
    enum: ChainType;
    name: string;
    network: string;
  }) => {
    setChainType(chain.enum);
    getBasicInfo();
  };

  useEffect(() => {
    async function checkUnisat() {
      let unisat = (window as any).unisat;

      for (let i = 1; i < 10 && !unisat; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 100 * i));
        unisat = (window as any).unisat;
      }

      if (unisat) {
        setUnisatInstalled(true);
      } else if (!unisat) return;

      unisat
        .getAccounts()
        .then((accounts: string[]) => {
          // 主动获取一次账户信息
          handleAccountsChanged(accounts);
        })
        .catch((e: any) => {
          messageApi.error((e as any).message);
        });

      unisat.on("accountsChanged", handleAccountsChanged);
      unisat.on("networkChanged", handleNetworkChanged);
      unisat.on("chainChanged", handleChainChanged);

      return () => {
        unisat.removeListener("accountsChanged", handleAccountsChanged);
        unisat.removeListener("networkChanged", handleNetworkChanged);
        unisat.removeListener("chainChanged", handleChainChanged);
      };
    }

    checkUnisat().then();
  }, []);

  const [messageApi, contextHolder] = useMessage();

  const unisat = (window as any).unisat;

  if (!unisatInstalled) {
    return (
      <div className="App">
        <header className="App-header">
          {contextHolder}
          <div>
            <div
              onClick={() => {
                window.location.href = "https://unisat.io";
              }}
              className={styles.connectWalletBtn}
            >
              Install Unisat Wallet
            </div>
          </div>
        </header>
      </div>
    );
  }

  const menuItems = [
    {
      label: (
        <a href={`https://unisat.io/address/${address}`} target="_blank" rel="noopener noreferrer">
          (Unisat) {shortenAddress(address)}
        </a>
      ),
      key: 'unisat',
    },
    {
      label: 'My portfolio',
      key: 'portfolio',
      onClick: () => navigate('/deposits'),
    },
    {
      label: (<>
        <div onClick={async () => {
          await unisat.disconnect();
        }}>Disconnect</div>
      </>),
      key: 'disconnect',
    },
  ];
  return <>
    <div>
      {contextHolder}
      {connected ? (
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <div className={styles.connect} >
            <div className={styles.account}>
              {satoshisToAmount(balance.total)} {chain && chain.unit}
            </div>
            <div

              className={styles.connectWalletBtn}
            >
              {shortenAddress(address)}
            </div>
          </div>
        </Dropdown>
      ) : <div>
        <div
          onClick={async () => {
            try {
              const result = await unisat.requestAccounts();
              handleAccountsChanged(result);
            } catch (e) {
              messageApi.error((e as any).message);
            }
          }}
          className={styles.connectWalletBtn}
        >
          Connect Unisat Wallet
        </div>
      </div>}
    </div>
  </>;
}
