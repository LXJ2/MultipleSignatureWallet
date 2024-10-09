import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Setting from './Setting';
import Trade from './Trade';
import Donate from './Donate';
import Transaction from './Transaction'
import asset from "../../assets/images/wallet.svg"
import type { MenuProps } from 'antd';
import { Button, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';  // 导入 useNavigate
// 引入Ant-Design样式 & Animate.CSS样式
import 'animate.css/animate.min.css'
import 'font-awesome/css/font-awesome.min.css'
import { useLocation } from 'react-router-dom';
import {
    PlusCircleOutlined,
} from '@ant-design/icons';
import styles from "../../styles/home.module.css"
import { shortenAddress } from '../../utils';
import { CHAINS_MAP, ChainType } from "../../const";

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    { key: '/', icon: <Dashboard />, label: 'Dashboard' },  // 使用路径作为 key
    { key: '/newwallet', icon: <Setting />, label: 'Create New Wallet' },
    { key: '/deposits', icon: <Donate />, label: 'Deposits' },
    { key: '/newtransaction', icon: <Trade />, label: 'New Transactions' },
    { key: '/transactions', icon: <Transaction />, label: 'Transactions' }

];

const Sider: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [currentWallet, setCurrentWallet] = useState(localStorage.getItem('currentWallet'));
    const [chain, setChain] = useState(JSON.parse(localStorage.getItem('chain') || "{}"));
    const [balance, setBalance] = useState('')
    const navigate = useNavigate();  // 使用 useNavigate 钩子
    const location = useLocation(); // 获取当前的 location 对象
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    // 处理菜单项点击事件
    const handleMenuClick: MenuProps['onClick'] = (e) => {
        navigate(e.key);  // 根据 key 跳转到对应的路由
    }

    const getbanlance = async () => {
        const res = await fetch(
            `${chain.endpoints}/v5/address/balance?address=${currentWallet}`,
            {
                method: "GET",
            },
        );
        const data = (await res.json()).data;
        setBalance(data?.amount)
        localStorage.setItem('currentWalletBalance', data?.amount)
    }

    useEffect(() => {
        getbanlance()
    }, [chain, currentWallet])

    return (
        <div style={{ width: 240 }}>
            <div className={styles.itemBox}>
                <div className={styles.assets}>
                    <img src={asset} alt="" height={30} width={30} />
                    <div>
                        <div className={styles.address}>{shortenAddress(currentWallet as string)}</div>
                        <div className={styles.address}>Total deposits</div>
                        <div className={styles.number}>{balance}{chain && chain.unit}</div>
                    </div>
                </div>
            </div>
            <Menu
                defaultSelectedKeys={[location.pathname]}
                defaultOpenKeys={['/']}
                mode="inline"
                style={{ width: 240, background: 'none' }}
                items={items}
                onClick={handleMenuClick}  // 将 onClick 绑定到 handleMenuClick
            />
        </div>
    );
};

export default Sider;
