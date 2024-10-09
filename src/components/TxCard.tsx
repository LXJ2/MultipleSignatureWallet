import React, { FC, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Card, Row, Col, Button, Tooltip, Divider } from "antd";
import { CopyOutlined, EyeOutlined } from "@ant-design/icons";
import { getMusigInfo, shortenAddress, getTxInfo, satoshisToAmount } from '../utils'
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

interface TxCardData {
  item: ConfirmedTx,
  update: () => void
}

// 定义子组件方法的类型
export type TxCardHandle = {
  getData: () => void
};

export interface inputs { txid: string; index: Number }

export interface outputs { address: string; amount: BigInt }


const TxCard = forwardRef<TxCardHandle, TxCardData>((props: TxCardData, ref) => {
  const { item, update } = props

  const [currentWalletInfor, setCurrentWalletInfor] = useState(JSON.parse(localStorage.getItem('currentWalletInfor') || "{}"));
  const [currentWallet, setCurrentWallet] = useState(localStorage.getItem('currentWallet'));
  const [address, setAddress] = useState(localStorage.getItem("address") || "");
  const [publicKey, setPublicKey] = useState(localStorage.getItem("publicKey"));
  const [signerInfor, setSignerInfor] = useState<singerIfor>();
  const [isSigner, setIsSigner] = useState(false)
  const [signers, setSigners] = useState<string[] | undefined>([]);
  const [messageApi, contextHolder] = useMessage();
  const [psbtTx, setPsbtTx] = useState<btc.Transaction>();
  const [psbt, setPsbt] = useState();
  const [inputs, setInputs] = useState<inputs[]>([])
  const [outputs, setOutputs] = useState<outputs[]>([])
  const [chain, setChain] = useState(JSON.parse(localStorage.getItem('chain') || "{}"));

  useEffect(() => {
    getPsbt()
  }, [currentWallet])

  useEffect(() => {
    signers?.forEach((item, index) => {

      if (item == publicKey) {
        setIsSigner(true)
      }
    })
    console.log(isSigner);

  }, [signers, isSigner])

  useImperativeHandle(ref, () => ({
    getData: getPsbt
  }));

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
      let txData = getTxInfo(psbtTx)

      setInputs(txData.inputs)
      setOutputs(txData.outputs)
      const signer = getMusigInfo(psbtTx)
      setSignerInfor(signer)
      let singers = signer?.signers
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

      messageApi.success('Update Transaction Successfully!')
      update()
      getPsbt()
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

      if ((signerInfor!.added + 1) == currentWalletInfor?.threshold) {
        const psbtTx = btc.Transaction.fromPSBT(
          hex.decode(
            signPSBT,
          ),
        );

        psbtTx.finalize();
        const rawTx = psbtTx.hex;
        sendToChain(rawTx, signPSBT)
      } else {
        postPsbt({ id: item!.id, psbt: signPSBT })
      }
    } catch (error: any) {
      messageApi.error(error.message)
      console.log(error);
    }
  }

  const sendToChain = async (rawtx: string, signPSBT: string) => {
    try {
      const txid = await (window as any).unisat.pushTx(rawtx);
      console.log(txid);
      postPsbt({ id: item!.id, psbt: signPSBT })
    } catch (e) {
      console.log('pushTx', e);
    }
  }

  return (
    <>{contextHolder}
      <div className="flex justify-between">
        <Card size="small" style={{ margin: 10, background: 'rgba(255, 255, 255, 0.05)' }} className="grow">
          {item?.txid ? <div style={{ textAlign: "left", marginTop: 10, display: 'flex' }}>
            <div style={{ fontWeight: "bold" }}>Transaction hash:</div>
            <div style={{ marginLeft: 20 }}>{item?.txid}</div>
          </div> : ''}
          <div style={{ textAlign: "left", marginTop: 10, display: 'flex' }}>
            <div style={{ fontWeight: "bold", }}>Created:</div>
            <div style={{ marginLeft: 20 }}>{item?.createAt}</div>
          </div>
          <div style={{ textAlign: "left", marginTop: 10, }}>
            <div style={{ fontWeight: "bold", }}>Input:</div>
            <div style={{ border: '1px solid #fff', padding: 10, marginTop: 5 }}>
              {inputs.map(x => {
                return <div style={{ textAlign: "left", marginTop: 10, display: 'flex', alignItems: 'center' }} key={x.txid}>
                  <div style={{ fontWeight: "bold" }}>Txid:</div>
                  <div style={{ marginLeft: 20, }}>{shortenAddress(x?.txid)}</div>
                  <div style={{
                    width: 30,
                    height: 30,
                    marginRight: 10,
                    marginLeft: 10
                  }}>
                    <Tooltip title="Copy Address">
                      <Button
                        shape="circle"
                        icon={<CopyOutlined />}
                        onClick={() => navigator.clipboard.writeText(x?.txid)}
                        style={{
                          width: 30,
                          height: 30,
                          marginRight: 10,
                        }}
                      />
                    </Tooltip>
                  </div>
                  <div style={{ fontWeight: "bold", marginLeft: '10px' }}>Vout:</div>
                  <div style={{ marginLeft: '10px' }}>{x?.index + ''}</div>
                </div>
              })}
            </div>
          </div>
          <div style={{ textAlign: "left", marginTop: 10, }}>
            <div style={{ fontWeight: "bold", }}>Output:</div>
            <div style={{ border: '1px solid #fff', padding: 10, marginTop: 5 }}>
              {outputs.map((i, index) => {
                return <div style={{ textAlign: "left", marginTop: 10, display: 'flex', alignItems: 'center' }} key={index}>
                  <div style={{ fontWeight: "bold" }}>Address:</div>
                  <div style={{ marginLeft: 20, }}>{shortenAddress(i?.address)}</div>
                  <div style={{
                    width: 30,
                    height: 30,
                    marginRight: 10,
                    marginLeft: 10
                  }}>
                    <Tooltip title="Copy Address">
                      <Button
                        shape="circle"
                        icon={<CopyOutlined />}
                        onClick={() => navigator.clipboard.writeText(i?.address)}
                        style={{
                          width: 30,
                          height: 30,
                          marginRight: 10,
                        }}
                      />
                    </Tooltip>
                  </div>
                  <div style={{ fontWeight: "bold", marginLeft: '10px' }}>Amount:</div>
                  <div style={{ marginLeft: '10px' }}>{satoshisToAmount(Number(i?.amount))} {chain && chain.unit}</div>
                </div>
              })}

            </div></div>

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

          {item?.txid ? '' : isSigner ? '' : <Row style={{ marginTop: 20 }}>
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
})

export { TxCard };



