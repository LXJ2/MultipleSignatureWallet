import React, { FC } from 'react';
import {
  Form,
  Input,
  ConfigProvider,
  Col, Row
} from 'antd';
import styles from "../../styles/home.module.css"
import { useEffect, useState, useMemo } from "react";
import asset from "../../assets/images/wallet.svg"
interface fromProps {
  name: string;
  address: `0x${string}`
}

const Home: FC<{ title?: string }> = ({ title }
) => {

  const [form] = Form.useForm();
  const [formValue, setFormValue] = useState<fromProps>();

  const onValuesChange = (changedValues: any, allValues: any) => {
    setFormValue(allValues)
  };

  return (
    <>
      <div className={styles.formBox}>
        <div className={styles.title}>Current Wallet</div>
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
            <Row>
              <Col span={6}>
                <Form.Item
                  label="Signer Name"
                  name="name2"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input style={{ height: '32px', marginRight: '20px' }} />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  label="Public Address"
                  name="address2"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input style={{ height: '32px', width: '500px' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={6}>
                <Form.Item
                  label="Signer Name"
                  name="name3"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input style={{ height: '32px', marginRight: '20px' }} />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  label="Public Address"
                  name="address3"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input style={{ height: '32px', width: '500px' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Form.Item
                label=""
                name=""
              >
                <div className={styles.viewAll}>View All</div>
              </Form.Item>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label=""
                  name=""
                >
                  <div className={styles.tips}>Any transaction requires the confirmation of 2 of signers.</div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </ConfigProvider>
      </div>

      <div className={styles.other}>
        <div className={styles.title}>Other Wallet</div>
        <div className='flex'>
          <div className={styles.itemBox}>
            <div className={styles.assets}>
              <img src={asset} alt="" height={30} width={30} />
              <div>
                <div className={styles.address}>bc1pzx...ygwcn</div>
                <div className={styles.address}>Total deposits</div>
                <div className={styles.number}>$ 78,342</div>
              </div>
            </div>
            <div className={styles.switch}>Switch to this</div>
          </div>
          <div className={styles.itemBox}>
            <div className={styles.assets}>
              <img src={asset} alt="" height={30} width={30} />
              <div>
                <div className={styles.address}>bc1pzx...ygwcn</div>
                <div className={styles.address}>Total deposits</div>
                <div className={styles.number}>$ 78,342</div>
              </div>
            </div>
            <div className={styles.switch}>Switch to this</div>
          </div>
          <div className={styles.itemBox}>
            <div className={styles.assets}>
              <img src={asset} alt="" height={30} width={30} />
              <div>
                <div className={styles.address}>bc1pzx...ygwcn</div>
                <div className={styles.address}>Total deposits</div>
                <div className={styles.number}>$ 78,342</div>
              </div>
            </div>
            <div className={styles.switch}>Switch to this</div>
          </div>
        </div>
      </div>

    </>
  )
}

export { Home };
