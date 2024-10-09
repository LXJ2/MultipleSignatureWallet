import React, { FC } from 'react';
import {
    Form,
    Input,
    ConfigProvider,
    Col, Row, Space, Button, Select
} from 'antd';
import styles from "../../styles/home.module.css"
import { useEffect, useState, useRef } from "react";
import { PlusOutlined } from '@ant-design/icons';
import * as btc from "@scure/btc-signer";
import { hex } from "@scure/base";
import useMessage from "antd/es/message/useMessage";
import { CHAINS_MAP, ChainType } from "../../const";
interface fromProps {
    address1: string,
    address2: string,
    others: string[]
}

interface SelectProps {
    value: string,
    label: string
}

interface postData {
    address: string,
    threshold: number,
    signers: string[]
}

const NewWallet: FC<{ title?: string }> = ({ title }
) => {

    const [form] = Form.useForm();
    const [formValue, setFormValue] = useState<fromProps>();
    const [selectedItem, setSelectedItem] = useState("");
    const [options, setOptions] = useState<SelectProps[]>([{
        value: '2',
        label: '2',
    },])
    const [unisatInstalled, setUnisatInstalled] = useState(false);
    const [connected, setConnected] = useState(Number(localStorage.getItem('connected')) || false);
    const [accounts, setAccounts] = useState<string[]>([]);
    const [publicKey, setPublicKey] = useState(localStorage.getItem("publicKey"));

    const [messageApi, contextHolder] = useMessage();

    const onValuesChange = (changedValues: any, allValues: any) => {
        if (allValues.others) {
            let array = [{
                value: '2',
                label: '2',
            }]
            allValues.others.forEach((item: any, index: string) => {
                array.push({
                    value: index + 3 + '',
                    label: index + 3 + '',
                })
            });
            setOptions(array)
        }
        setFormValue(allValues)
    };

    const onChange = (value: string) => {
        setSelectedItem(value)
    };

    const onSearch = (value: string) => {
        console.log('search:', value);
    };

    const onCheck = async (value: any) => {
        form.validateFields()
            .then((values) => {
                // 如果校验通过，执行相应操作
                createWallet()
            })
            .catch((errorInfo) => {
                // 如果校验失败，处理错误信息
                messageApi.error(errorInfo + '')
                console.log('errorInfo:', errorInfo);
            });
    };

    const createWallet = async () => {
        if (formValue!.address2.length == 66) {
            formValue!.address2 = formValue!.address2.slice(2)
        }
        const publicKey1 = hex.decode(publicKey as string);
        const publicKey2 = hex.decode(formValue?.address2 || "");
        let publicKeyCodeArray = [publicKey1, publicKey2]
        let publicKeyArray = [publicKey!, formValue!.address2]
        console.log(selectedItem, publicKeyCodeArray);
        if (formValue?.others) {
            formValue.others.forEach((item: any) => {
                if (item.address.length == 66) {
                    item.address = item.address.slice(2)
                }
                publicKeyCodeArray.push(hex.decode(item.address || ""))
                publicKeyArray.push(item.address!)
            });
        }

        try {
            const account = btc.p2tr(
                undefined,
                btc.p2tr_ms(Number(selectedItem), publicKeyCodeArray),
            );
            const postData = {
                "address": account.address!,
                "threshold": Number(selectedItem)!,
                "signers": publicKeyArray
            }
            postWallet(postData)
        } catch (error) {
            console.error('Error sending POST request:', error);
        }

    }

    const postWallet = async (postData: postData) => {
        try {
            const response = await fetch('https://api.mtxo.dev/create', {
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
            messageApi.success('Create Successfully!')
            console.log('Server response:', result);
            localStorage.setItem('currentWallet', postData.address);
            localStorage.setItem('currentWalletInfor', JSON.stringify(postData));
            window.location.reload();
            form.resetFields();
        } catch (error) {
            console.error('Error sending POST request:', error);
        }
    }

    const openConnect = async () => {
        messageApi.error('Connect wallet first!');
    }

    return (
        <>{contextHolder}
            <div className={styles.formBox}>
                <div className={styles.title} style={{ color: '#ffffff' }}>Signers</div>
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
                        initialValues={{
                            address1: publicKey,
                            address2: '',
                        }}
                    >
                        <Row>
                            <Col span={20}>
                                <Form.Item
                                    label="PublicKey"
                                >
                                    <div className={styles.btcAccount} style={{ marginBottom: '10px', color: '#ffffff' }}>
                                        {publicKey}
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={20}>
                                <Form.Item
                                    label="PublicKey"
                                    name="address2"
                                    rules={[{ required: true, message: 'Required' }]}
                                >
                                    <Input style={{ height: '32px', width: '730px' }} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.List name="others">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key}>
                                            <Col span={24}>
                                                <Space style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Form.Item
                                                        label="PublicKey"
                                                        name={[name, 'address']}
                                                        rules={[{ required: true, message: 'Required' }]}
                                                    >
                                                        <Input style={{ height: '32px', width: '730px' }} />
                                                    </Form.Item>
                                                    <div onClick={() => remove(name)} className={styles.deleteBtn}>-Delete</div>
                                                </Space>
                                            </Col>

                                        </Row>
                                    ))}
                                    <Form.Item>
                                        <Button type="text" onClick={() => add()} block icon={<PlusOutlined />} style={{ color: '#fff', width: '158px', marginTop: '20px' }}>
                                            Add new signer
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                >
                                    <div className={styles.tips}></div>
                                </Form.Item>
                            </Col>
                        </Row>
                        <div className={styles.title} style={{ color: '#ffffff', margin: '30px 0' }}>Threshold</div>
                        <div style={{ color: '#fff', marginBottom: 40 }}>Any transaction requires the confirmation of</div>
                        <Row>
                            <Col span={3}>
                                <Form.Item
                                    name="signers"
                                    rules={[{ required: true, message: 'Required' }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Select a person"
                                        optionFilterProp="label"
                                        value={selectedItem}
                                        onChange={onChange}
                                        onSearch={onSearch}
                                        options={options}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item> <div style={{ color: '#fff' }}>of signers</div> </Form.Item>
                            </Col>
                        </Row>
                        <Button type="primary"
                            style={{ marginTop: '50px' }}
                            htmlType="submit"
                            onClick={connected ? onCheck : openConnect}
                        >
                            Create Wallet
                        </Button>
                    </Form>
                </ConfigProvider>
            </div>
        </>
    )
}

export { NewWallet };
