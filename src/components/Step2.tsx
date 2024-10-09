import React, { forwardRef, useImperativeHandle } from 'react';
import {
    PlusOutlined, MinusCircleOutlined
} from '@ant-design/icons';
import {
    Form,
    Input,
    ConfigProvider,
    Col, Row, Space, Button, Select
} from 'antd';
import useMessage from "antd/es/message/useMessage";
import Btc from "../assets/images/btc.svg"
import arrowDown from "../assets/images/arrowDown.svg"
import { useEffect, useState, useRef } from "react";
import styles from "../styles/home.module.css"
import { copyToClipboard, satoshisToAmount, shortenTransaction, getTxFee } from "../utils";
import { UTXO, generatePSBT } from '../utils'
import * as btc from "@scure/btc-signer";
import { hex } from "@scure/base";

interface step1Data {
    utxoAccount: number,
    selectUtxos: UTXO[]
}

interface fromProps {
    address: string,
    amount: string
}

interface postData {
    wallet: string,
    psbt: string
}


// 定义子组件方法的类型
export type Step1Handle = {
    submitCheck: () => void
};

const Step2 = forwardRef<Step1Handle, step1Data>((props: step1Data, ref) => {
    const { utxoAccount, selectUtxos } = props;
    const [currentWallet, setCurrentWallet] = useState(localStorage.getItem('currentWallet'));
    const [chain, setChain] = useState(JSON.parse(localStorage.getItem('chain') || ""));
    const [currentWalletInfor, setCurrentWalletInfor] = useState(JSON.parse(localStorage.getItem('currentWalletInfor') || "{}"));
    const [messageApi, contextHolder] = useMessage();
    const [fee, setFee] = useState(0)
    const [feeRate, setFeeRate] = useState(0)
    const [address, setAddress] = useState(localStorage.getItem("address") || "");
    const [balance, setBalance] = useState(localStorage.getItem("currentWalletBalance") || "");
    const [form] = Form.useForm();
    const [formValue, setFormValue] = useState<fromProps>();
    const [outputs, setOutputs] = useState<fromProps[]>([]);

    const onValuesChange = (changedValues: any, allValues: any) => {
        try {
            getMaxAccount(allValues)
        } catch (error) {
            // messageApi.error(error + '')
            console.log('errorInfo:', error);
        }
        setFormValue(allValues)
        // 如果校验通过，执行相应操作
    };

    const getMaxAccount = (values: any) => {
        let amount = values.amount
        let arr: fromProps[] = [{
            address: values.address,
            amount: values.amount
        }]
        if (values.others) {
            values.others.forEach((item: fromProps) => {
                if (item?.amount) {
                    amount = amount + item.amount
                    arr.push({
                        address: item.address,
                        amount: item.amount
                    })
                }
            })
        }

        const fee = getTxFee(currentWalletInfor?.threshold, currentWalletInfor?.signers?.length + 1, selectUtxos, arr)
        setFee(fee.fee)
        setFeeRate(fee.feeRate)
        let max = amount + fee.fee
        if (max >= utxoAccount) {
            messageApi.error('Utxo amount is not enough!')
            return true
        }

        setOutputs(arr)
        return false
    }

    const postPsbt = async (postData: postData) => {
        try {
            const response = await fetch('https://api.mtxo.dev/psbt/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            messageApi.success('Create Transaction Successfully!')
            console.log('Server response:', result);
            form.resetFields();
        } catch (error) {
            console.error('Error sending POST request:', error);
        }
    }

    const sendToSigner = async () => {
        const unisat = (window as any).unisat;
        let arr = currentWalletInfor.signers.map((item: any) => hex.decode(item.publicKey || ""))
        const account = btc.p2tr(
            undefined,
            btc.p2tr_ms(currentWalletInfor.threshold, arr),
        );

        const tx = new btc.Transaction();
        let toSignInputs = Array.from(selectUtxos, (item, index) => { return { index: index, address: address, disableTweakSigner: true } })

        const psbt = generatePSBT(account, selectUtxos, outputs)

        try {
            const signPSBT = await unisat.signPsbt(hex.encode(psbt), {
                autoFinalized: false,
                toSignInputs: toSignInputs,
            })

            postPsbt({ wallet: currentWalletInfor.address, psbt: signPSBT })
        } catch (error: any) {
            messageApi.error(error.message)
            console.log(error);
        }
    }

    const submitCheck = () => {
        form.validateFields()
            .then((values) => {
                // 如果校验通过，执行相应操作
                let isOverflow = getMaxAccount(values)
                if (!isOverflow) {
                    sendToSigner()
                }
            })
            .catch((errorInfo) => {
                // 如果校验失败，处理错误信息
                messageApi.error(errorInfo + "")
                console.log('errorInfo:', errorInfo);
            });
    }

    const addCheck = (add: () => void) => {
        form.validateFields()
            .then((values) => {
                // 如果校验通过，执行相应操作
                let isOverflow = getMaxAccount(values)
                if (!isOverflow) {
                    add()
                }

            })
            .catch((errorInfo) => {
                // 如果校验失败，处理错误信息
                messageApi.error(errorInfo + '')
                console.log('errorInfo:', errorInfo);
            });
    }

    // 将子组件方法暴露给父组件
    useImperativeHandle(ref, () => ({
        submitCheck: submitCheck
    }));

    return (
        <>
            {contextHolder}
            <div className={styles.btcAccount} style={{ width: '730px' }}>
                <div className={styles.btcLeft}>UTXO amount</div>
                <div className={styles.btcRight}>{satoshisToAmount(utxoAccount)} {chain && chain.unit}</div>
            </div>
            <div style={{ width: '730px', marginTop: '50px' }}>
                <div className={styles.title} style={{ color: '#ffffff', textAlign: 'left' }}>Recipicent</div>
            </div>
            <div style={{ width: '730px', marginTop: '10px' }}>
                <ConfigProvider
                    theme={{
                        components: {
                            Form: {
                                labelColor: '#ffffff',
                                labelFontSize: 12,
                                labelColonMarginInlineStart: 4,
                                labelColonMarginInlineEnd: 1,
                                itemMarginBottom: 10,
                                inlineItemMarginBottom: 1
                            },
                        },
                    }}>

                    <Form
                        form={form}
                        onValuesChange={onValuesChange}
                        layout="vertical"
                    >
                        <Row>
                            <Col span={16}>
                                <Form.Item
                                    label="Public Address"
                                    name="address"
                                    rules={[{ required: true, message: 'Required' }]}
                                >
                                    <Input style={{ height: '32px', width: '480px' }} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label="Amount"
                                    name="amount"
                                    rules={[{ required: true, message: 'Required' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.List name="others">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key}>
                                            <Col span={16}>
                                                <Form.Item
                                                    label="Public Address"
                                                    name={[name, 'address']}
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <Input style={{ height: '32px', width: '480px' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={5}>
                                                <Form.Item
                                                    label="Amount"
                                                    name={[name, 'amount']}
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <Input />

                                                </Form.Item>

                                            </Col>
                                            <MinusCircleOutlined
                                                className={styles.deleteBtn}
                                                onClick={() => remove(name)}
                                            />
                                        </Row>
                                    ))}
                                    <Form.Item>
                                        <Button type="text" onClick={() => {
                                            addCheck(add)
                                        }} block icon={<PlusOutlined />} style={{ color: '#fff', width: '158px', marginTop: '20px' }}>
                                            Add new publicKey
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form>

                </ConfigProvider>
            </div>
            <div style={{ width: '730px', marginTop: '50px' }}>
                <div className={styles.title} style={{ color: '#ffffff', textAlign: 'left' }}>Fee</div>
                <div className={styles.itemBox}>
                    <div
                        className={`${styles.utxoBox}`}
                    >
                        <div className={styles.number}>{satoshisToAmount(fee)} {chain && chain.unit}</div>
                        <div className={styles.number}>{feeRate.toFixed(4)} sats/vB </div>
                    </div>
                </div>
            </div>

        </>
    );
});

export { Step2 };