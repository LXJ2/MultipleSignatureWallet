import React, { FC } from 'react';
import {
  Form,
  Input,
  ConfigProvider,
  Button
} from 'antd';
import styles from "../../styles/home.module.css"

export default function Launch() {

  return (
    <>
      <div className={styles.title}>Current Wallet</div>
      <div>
        <ConfigProvider
          theme={{
            components: {
              Form: {
                labelColor: '#232D9E',
                labelFontSize: 16,
                labelColonMarginInlineStart: 4,
                labelColonMarginInlineEnd: 12,
                itemMarginBottom: 18,
                inlineItemMarginBottom: 18,
              },
            },
          }}>
          <Form
            form={form}
            onValuesChange={onValuesChange}
            layout="vertical"
          >
            <Row>
              <Col span={8}>
                <Form.Item
                  label="Image"
                  name="tokenImage"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <ImageUploader onImageUpload={handleImageUpload} account={account as `0x${string}`}></ImageUploader>
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  label="Token Name"
                  name="name"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input.TextArea showCount maxLength={20} style={{ height: '70px' }} />
                </Form.Item>
                <Form.Item
                  label="Token Symbol"
                  name="symbol"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input.TextArea showCount maxLength={10} style={{ height: '70px' }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Token Description"
              name="desc"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input.TextArea maxLength={256} showCount style={{ height: '220px' }} />
            </Form.Item>
            <Form.Item
              label="Website"
              name="website"
            >
              <Input style={{ height: '70px' }} placeholder='Optional' />
            </Form.Item>
            <Form.Item
              label="Telegram"
              name="telegram"
            >
              <Input style={{ height: '70px' }} placeholder='Optional' />
            </Form.Item>
            <Form.Item
              label="Twitter"
              name="twitter"
            >
              <Input style={{ height: '70px' }} placeholder='Optional' />
            </Form.Item>

          </Form>
        </ConfigProvider>
      </div>
    </>
  )
}


