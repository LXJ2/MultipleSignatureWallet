import BigNumber from "bignumber.js";
import * as btc from "@scure/btc-signer";
import { tapLeafHash, type P2TROut } from "@scure/btc-signer/payment";
import { equalBytes, type Bytes } from "@scure/btc-signer/utils";
import * as P from "micro-packed";


export function satoshisToAmount(val: number) {
  const num = new BigNumber(val);
  return num.dividedBy(100000000).toFixed(8);
}

export function amountToSatoshis(val: any) {
  const num = new BigNumber(val);
  return num.multipliedBy(100000000).toNumber();
}

export interface UTXO {
  addressType: number;
  satoshis: number;
  txid: string,
  vout: number,
  select: boolean
}

export const copyToClipboard = (textToCopy: string | number) => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(textToCopy.toString());
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy.toString();
    textArea.style.position = "absolute";
    textArea.style.opacity = "0";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise<void>((res, rej) => {
      document.execCommand("copy") ? res() : rej();
      textArea.remove();
    });
  }
};


export const shortenAddress = (address: string) => {
  if (!address) return ''; // 确保地址存在
  const start = address.slice(0, 6); // 前四位
  const end = address.slice(-5); // 后四位
  return `${start}...${end}`;
}

export const shortenTransaction = (address: string) => {
  if (!address) return ''; // 确保地址存在
  const start = address.slice(0, 6);
  const end = address.slice(-5); // 后四位
  return `${start}...${end}`;
}

export const formatDuration = (timestamp: number) => {
  const time = Date.now() - (timestamp * 1000)
  const minutes = Math.floor(time / 60000); // 将时间戳转换为分钟
  const hours = Math.floor(minutes / 60); // 将分钟转换为小时


  if (hours > 0) {
    return `${hours} hours ago`;
  } else {
    return `${minutes}minutes ago`;
  }
}

export const getTxFee = (
  n: number,
  m: number,
  inputs: UTXO[],
  outputs: { address: string; amount: string }[],
) => {
  const publicKeys = [];
  const privateKeys = [];
  for (let i = 0; i < m; i++) {
    const privKey = btc.utils.randomPrivateKeyBytes();
    privateKeys.push(privKey);
    publicKeys.push(btc.utils.pubSchnorr(privKey));
  }

  const internalAccount = btc.p2tr(undefined, btc.p2tr_ms(n, publicKeys));

  const tx = new btc.Transaction();

  inputs.map((item) => {
    tx.addInput({
      ...internalAccount,
      txid: item.txid,
      index: item.vout,
      witnessUtxo: {
        amount: BigInt(item.satoshis),
        script: internalAccount.script,
      },
    });
  });

  outputs.map((item) => {
    tx.addOutputAddress(item.address, btc.Decimal.decode(item?.amount));
  });

  for (let i = 0; i < n; i++) {
    const privKey = privateKeys[i];
    tx.sign(privKey);
  }

  tx.finalize();
  return {
    fee: Number(tx.fee),
    feeRate: Number(tx.fee) / tx.vsize,
  };
};

export const generatePSBT = (
  account: P2TROut,
  inputs: { txid: string; vout: number; satoshis: number }[],
  outputs: { address: string; amount: string }[],
) => {
  const tx = new btc.Transaction();

  inputs.map((item) => {
    tx.addInput({
      ...account,
      txid: item.txid,
      index: item.vout,
      witnessUtxo: {
        amount: BigInt(item.satoshis),
        script: account.script,
      },
    });
  });

  outputs.map((item) => {
    tx.addOutputAddress(item.address, btc.Decimal.decode(item.amount));
  });

  const psbt = tx.toPSBT();
  return psbt;
};

export const getMusigInfo = (tx: btc.Transaction) => {
  let m;
  let n;
  const input = tx.getInput(0);

  const leafs = input.tapLeafScript!.sort(
    (a, b) =>
      btc.TaprootControlBlock.encode(a[0]).length -
      btc.TaprootControlBlock.encode(b[0]).length,
  );
  for (const [cb, _script] of leafs) {
    // Last byte is version
    const script = _script.slice(0, -1);
    const ver = _script[_script.length - 1];
    const outScript = btc.OutScript.decode(script);
    const hash = tapLeafHash(script, ver);

    let signatures: Bytes[] = [];

    if (outScript.type === "tr_ms") {
      const m = outScript.m;

      if (input.tapScriptSig === undefined) {
        return {
          m,
          added: 0,
        };
      }
      const scriptSig = input.tapScriptSig!.filter((i) =>
        equalBytes(i[0].leafHash, hash),
      );

      const pubkeys = outScript.pubkeys;
      let added = 0;
      for (const pub of pubkeys) {
        const sigIdx = scriptSig.findIndex((i) => equalBytes(i[0].pubKey, pub));
        // Should have exact amount of signatures (more -- will fail)
        if (added === m || sigIdx === -1) {
          signatures.push(P.EMPTY);
          continue;
        }
        signatures.push(scriptSig[sigIdx][1]);
        added++;
      }

      return {
        m,
        added,
        signatures
      };
    }
  }
};
