import Icon from '@ant-design/icons';
import { IconComponentProps } from '@ant-design/icons/lib/components/Icon';
import { RefAttributes } from 'react';
import { JSX } from 'react/jsx-runtime';

// 定义你的 SVG 图标
const IconSvg = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="icon / 24 / trade">
            <path id="Vector" d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" fill="white" />
            <path id="Vector_2" d="M7.33011 15.24C7.17011 15.24 7.01011 15.19 6.87011 15.08C6.54011 14.83 6.48011 14.36 6.73011 14.03L9.11011 10.94C9.40011 10.57 9.81011 10.33 10.2801 10.27C10.7401 10.21 11.2101 10.34 11.5801 10.63L13.4101 12.07C13.4801 12.13 13.5501 12.13 13.6001 12.12C13.6401 12.12 13.7101 12.1 13.7701 12.02L16.0801 9.04001C16.3301 8.71001 16.8101 8.65001 17.1301 8.91001C17.4601 9.16001 17.5201 9.63001 17.2601 9.96001L14.9501 12.94C14.6601 13.31 14.2501 13.55 13.7801 13.6C13.3101 13.66 12.8501 13.53 12.4801 13.24L10.6501 11.8C10.5801 11.74 10.5001 11.74 10.4601 11.75C10.4201 11.75 10.3501 11.77 10.2901 11.85L7.91011 14.94C7.78011 15.14 7.56011 15.24 7.33011 15.24Z" fill="white" />
        </g>
    </svg>
);

// 创建自定义的 Icon 组件
const Trade = (props: JSX.IntrinsicAttributes & Omit<IconComponentProps, "ref"> & RefAttributes<HTMLSpanElement>) => <Icon component={IconSvg} {...props} />;

export default Trade;
