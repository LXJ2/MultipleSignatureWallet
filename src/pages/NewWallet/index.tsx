import React, { FC } from 'react';
import {
    Form,
    Input,
    ConfigProvider,
    Col, Row, Space, Button, Select
} from 'antd';
import styles from "../../styles/home.module.css"
import { useEffect, useState, useMemo } from "react";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
interface fromProps {
    name: string;
    address: `0x${string}`
}

const NewWallet: FC<{ title?: string }> = ({ title }
) => {

    const [form] = Form.useForm();
    const [formValue, setFormValue] = useState<fromProps>();
    const option = [
        {
            value: '1',
            label: '1',
        },
        {
            value: '4',
            label: '4',
        },
        {
            value: '5',
            label: '5',
        },
    ]
    const onValuesChange = (changedValues: any, allValues: any) => {
        setFormValue(allValues)
    };

    const onChange = (value: string) => {
        console.log(`selected ${value}`);
    };

    const onSearch = (value: string) => {
        console.log('search:', value);
    };

    return (
        <>
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
                    >
                        <Row>
                            <Col span={6}>
                                <Form.Item
                                    label="Signer Name"
                                    name="name1"
                                    rules={[{ required: true, message: 'Required' }]}
                                >
                                    <Input style={{ height: '32px', marginRight: '20px' }} />
                                </Form.Item>
                            </Col>
                            <Col span={16}>
                                <Form.Item
                                    label="Public Address"
                                    name="address1"
                                    rules={[{ required: true, message: 'Required' }]}
                                >
                                    <Input style={{ height: '32px', width: '500px' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.List name="users">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key}>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Signer Name"
                                                    name="name1"
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <Input style={{ height: '32px', marginRight: '20px' }} />
                                                </Form.Item>
                                            </Col>

                                            <Col span={16}>
                                                <Space style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Form.Item
                                                        label="Public Address"
                                                        name="address1"
                                                        rules={[{ required: true, message: 'Required' }]}
                                                    >
                                                        <Input style={{ height: '32px', width: '500px' }} />
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
                                        onChange={onChange}
                                        onSearch={onSearch}
                                        options={option}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item> <div style={{ color: '#fff' }}>of signers</div> </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </ConfigProvider>
            </div>



        </>
    )
}

export { NewWallet };
