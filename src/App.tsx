import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import erc20abi from './contracts/erc20abi.json';
import TxList from './TxList';

declare global {
  interface Window {
    ethereum: any;
  }
}

interface Tx {
  txHash: string;
  from: string;
  to: string;
  amount: string;
}

export default function App() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [contractListened, setContractListened] = useState<
    ethers.Contract | undefined
  >(undefined);
  const [contractInfo, setContractInfo] = useState({
    address: '-',
    tokenName: '-',
    tokenSymbol: '-',
    totalSupply: '-'
  });
  const [balanceInfo, setBalanceInfo] = useState({
    address: '-',
    balance: '-'
  });

  useEffect(() => {
    if (contractInfo.address !== '-') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc20 = new ethers.Contract(
        contractInfo.address,
        erc20abi,
        provider
      );

      erc20.on('Transfer', (from, to, amount, event) => {
        console.log({ from, to, amount, event });

        setTxs((currentTxs) => [
          ...currentTxs,
          {
            txHash: event.transactionHash,
            from,
            to,
            amount: String(amount)
          }
        ]);
      });
      setContractListened(erc20);

      return () => {
        if (contractListened) {
          contractListened.removeAllListeners();
        }
      };
    }
  }, [contractInfo.address]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const erc20 = new ethers.Contract(
      data.get('addr') as string,
      erc20abi,
      provider
    );

    const tokenName = await erc20.name();
    const tokenSymbol = await erc20.symbol();
    const totalSupply = await erc20.totalSupply();

    setContractInfo({
      address: data.get('addr') as string,
      tokenName,
      tokenSymbol,
      totalSupply
    });
  };

  const getMyBalance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const erc20 = new ethers.Contract(contractInfo.address, erc20abi, provider);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    const balance = await erc20.balanceOf(signerAddress);

    setBalanceInfo({
      address: signerAddress,
      balance: String(balance)
    });
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = new FormData(e.target as HTMLFormElement);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const erc20 = new ethers.Contract(contractInfo.address, erc20abi, signer);
      const tx = await erc20.transfer(
        data.get('recipient') as string,
        data.get('amount') as string
      );
      await tx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  const connectMetaMask = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
  };

  const switchNetwork = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('wallet_switchEthereumChain', [
      { chainId: '0xAA36A7' }
    ]); // Sepolia chain ID
  };

  return (
    <div className='min-h-screen bg-gray-100 p-6'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Left Column */}
        <div className='space-y-6'>
          {/* Connect MetaMask and Switch Network Buttons */}
          <div className='flex space-x-4'>
            <button
              onClick={connectMetaMask}
              className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200'
            >
              Connect MetaMask
            </button>
            <button
              onClick={switchNetwork}
              className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200'
            >
              Switch to Sepolia
            </button>
          </div>

          {/* Read from Smart Contract */}
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h1 className='text-2xl font-bold text-gray-800 mb-4'>
              Read from Smart Contract
            </h1>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <input
                type='text'
                name='addr'
                className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='ERC20 Contract Address'
              />
              <button
                type='submit'
                className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200'
              >
                Get Token Info
              </button>
            </form>

            {/* Token Info Table */}
            <div className='mt-6'>
              <table className='w-full text-left'>
                <thead>
                  <tr className='border-b'>
                    <th className='py-2'>Name</th>
                    <th className='py-2'>Symbol</th>
                    <th className='py-2'>Total Supply</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='py-2'>{contractInfo.tokenName}</td>
                    <td className='py-2'>{contractInfo.tokenSymbol}</td>
                    <td className='py-2'>{String(contractInfo.totalSupply)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Get My Balance Button */}
            <button
              onClick={getMyBalance}
              className='w-full mt-4 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200'
            >
              Get My Balance
            </button>

            {/* Balance Info Table */}
            <div className='mt-6'>
              <table className='w-full text-left'>
                <thead>
                  <tr className='border-b'>
                    <th className='py-2'>Address</th>
                    <th className='py-2'>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='py-2'>{balanceInfo.address}</td>
                    <td className='py-2'>{balanceInfo.balance}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Write to Contract */}
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h1 className='text-2xl font-bold text-gray-800 mb-4'>
              Write to Contract
            </h1>
            <form onSubmit={handleTransfer} className='space-y-4'>
              <input
                type='text'
                name='recipient'
                className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Recipient Address'
              />
              <input
                type='text'
                name='amount'
                className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Amount to Transfer'
              />
              <button
                type='submit'
                className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200'
              >
                Transfer
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Recent Transactions */}
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h1 className='text-2xl font-bold text-gray-800 mb-4'>
            Recent Transactions
          </h1>
          <TxList txs={txs} />
        </div>
      </div>
    </div>
  );
}
