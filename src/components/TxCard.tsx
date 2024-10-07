import React, { FC, useEffect, useRef, useState } from "react";
import { Card, Row, Col, Button, Tooltip, Divider } from "antd";
import { CopyOutlined, EyeOutlined } from "@ant-design/icons";
import { getMusigInfo, shortenAddress } from '../utils'
import styles from "../styles/home.module.css"
import * as btc from "@scure/btc-signer";
import { hex } from "@scure/base";
import useMessage from "antd/es/message/useMessage";

export interface ConfirmedTx {
  id: number
  signerCount: number
  createAt: string
  txid?: string
}

interface postData {
  id: number,
  psbt: string
}

export interface singerIfor {
  added: number,
  m: number
}
export const TxCard: FC<{ item: ConfirmedTx, update: () => void }> = ({ item, update }) => {
  const [currentWalletInfor, setCurrentWalletInfor] = useState(JSON.parse(localStorage.getItem('currentWalletInfor') || "{}"));
  const [currentWallet, setCurrentWallet] = useState(localStorage.getItem('currentWallet'));
  const [address, setAddress] = useState(localStorage.getItem("address") || "");

  const [signerInfor, setSignerInfor] = useState<singerIfor>();
  const [signers, setSigners] = useState<string[] | undefined>([]);
  const [messageApi, contextHolder] = useMessage();
  const [psbtTx, setPsbtTx] = useState<btc.Transaction>();
  const [psbt, setPsbt] = useState();


  useEffect(() => {
    getPsbt()
  }, [currentWallet])

  const getPsbt = async () => {
    try {
      const response = await fetch(`https://api.mtxo.dev/psbt/id/${item?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();

      const psbtTx = btc.Transaction.fromPSBT(
        hex.decode(
          result?.psbt,
        ),
      );
      setPsbt(result?.psbt)
      setPsbtTx(psbtTx)
      const signer = getMusigInfo(psbtTx)
      setSignerInfor(signer)
      let singers = signer?.signatures?.map(item => hex.encode(item))
      setSigners(singers)

    } catch (error) {
      console.error('Error sending POST request:', error);
    }
  }

  const postPsbt = async (postData: postData) => {
    try {
      const response = await fetch('https://api.mtxo.dev/psbt/update', {
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
      update()
      messageApi.success('Update Transaction Successfully!')
      console.log('Server response:', result);
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

    let toSignInputs = Array.from({ length: psbtTx!.inputsLength }, (item, index) => { return { index: index, address: address, disableTweakSigner: true } })

    try {
      const signPSBT = await unisat.signPsbt(psbt, {
        autoFinalized: false,
        toSignInputs: toSignInputs,
      })

      postPsbt({ id: item!.id, psbt: signPSBT })
      if ((signerInfor!.added + 1) == currentWalletInfor?.threshold) {
        const psbtTx = btc.Transaction.fromPSBT(
          hex.decode(
            signPSBT,
          ),
        );
        psbtTx.finalize();
        const rawTx = psbtTx.hex;
        sendToChain(rawTx)
      }
    } catch (error: any) {
      messageApi.error(error.message)
      console.log(error);
    }
  }

  const sendToChain = async (rawtx: string) => {
    const unisat = (window as any).unisat;
    try {
      let txid = await unisat.pushTx({
        rawtx: rawtx
      });
      update()
      getPsbt()
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <>{contextHolder}
      <div className="flex justify-between">
        <Card size="small" style={{ margin: 10, background: 'rgba(255, 255, 255, 0.05)' }} className="grow">
          {item?.txid ? <div style={{ textAlign: "left", marginTop: 10, display: 'flex' }}>
            <div style={{ fontWeight: "bold" }}>Transaction hash:</div>
            <div style={{ marginLeft: '10px' }}>{item?.txid}</div>
          </div> : ''}
          <div style={{ textAlign: "left", marginTop: 10, display: 'flex' }}>
            <div style={{ fontWeight: "bold" }}>Created:</div>
            <div style={{ marginLeft: '10px' }}>{item?.createAt}</div>
          </div>
        </Card>
        {/* Right side content */}
        <div className="flex-none w-[250px] m-[20px] text-[12px]">
          {/* Created Status */}
          <Row style={{ alignItems: "center" }}>
            <Col>
              <span style={{ color: "green", fontWeight: "bold", fontSize: '12px' }}>+ Created</span>
            </Col>
          </Row>

          {/* Confirmations Section */}
          {item?.txid ? '' : <Row style={{ alignItems: "center", marginTop: 10 }}>
            <Col>
              <span style={{ color: "red", fontWeight: "bold", fontSize: '12px' }}>Confirmations ({signerInfor?.added} of {signerInfor?.m})</span>
            </Col>
          </Row>}

          {signers?.map((conf, index) => (
            <Row key={index} style={{ marginTop: 10, marginBottom: 10, alignItems: "center", fontSize: '10px' }}>
              <Col>
                <img
                  src={''}
                  alt="avatar"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: `2px solid ${conf == '' ? 'gray' : 'green'}`,
                    marginRight: 10,
                  }}
                />
              </Col>
              <Col>
                <div style={{ fontSize: '10px', width: '100px', boxSizing: 'border-box' }}>{shortenAddress(conf)}</div>
              </Col>
              <Col style={{
                width: 30,
                height: 30,
                marginRight: 10,
              }}>
                <Tooltip title="Copy Address">
                  <Button
                    shape="circle"
                    icon={<CopyOutlined />}
                    onClick={() => navigator.clipboard.writeText(conf)}
                    style={{
                      width: 30,
                      height: 30,
                      marginRight: 10,
                    }}
                  />
                </Tooltip>
              </Col>
            </Row>
          ))}

          <Row>
            <span style={{ fontSize: '12px' }}>{item?.txid ? 'Executed' : 'Can be executed'}</span>
          </Row>

          {/* Execution Section */}
          {item?.txid ? '' : <Row style={{ marginTop: 10 }}>
            <Col>
              <span style={{ color: "gray", fontWeight: "bold", fontSize: '12px' }}>
                Can be executed once the threshold is reached
              </span>
            </Col>
          </Row>}

          {item?.txid ? '' : <Row style={{ marginTop: 20 }}>
            <div className={styles.connectWalletBtn} style={{ marginRight: '20px' }} onClick={() => { sendToSigner() }}>
              Confirm
            </div >
            {/* <div className={styles.connectWalletBtn} style={{ background: 'rgb(244, 97, 113)' }}>
              Reject
            </div > */}
          </Row>}
        </div>
      </div>

    </>

  );
}


