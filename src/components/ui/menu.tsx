import React, { useState } from 'react';
import Dashboard from './Dashboard';
import Setting from './Setting';
import Trade from './Trade';
import Donate from './Donate';
import Wallet from './Wallet';
import type { MenuProps } from 'antd';
import { Button, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';  // 导入 useNavigate
// 引入Ant-Design样式 & Animate.CSS样式
import 'animate.css/animate.min.css'
import 'font-awesome/css/font-awesome.min.css'


type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
    { key: '/', icon: <Dashboard />, label: 'Dashboard' },  // 使用路径作为 key
    { key: '/newwallet', icon: <Setting />, label: 'Create New Wallet' },
    { key: '/deposits', icon: <Donate />, label: 'Deposits' },
    { key: '/newtransaction', icon: <Trade />, label: 'New Transactions' }
];

const Sider: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();  // 使用 useNavigate 钩子

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    // 处理菜单项点击事件
    const handleMenuClick: MenuProps['onClick'] = (e) => {
        navigate(e.key);  // 根据 key 跳转到对应的路由
    };

    return (
        <div style={{ width: 240 }}>
            <Menu
                defaultSelectedKeys={['/']}
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
