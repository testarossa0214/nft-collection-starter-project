// useEffect と useState 関数を React.js からインポート
import myEpicNft from './utils/MyEpicNFT.json';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'my04125429';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const App = () => {
  /*
  * ユーザーのウォレットアドレスを格納するために使用する状態変数を定義
  */
  const [currentAccount, setCurrentAccount] = useState("");
  /* この段階でcurrentAccountの中身は空 */
  console.log("currentAccount: ", currentAccount);
    /*
    * ユーザーが認証可能なウォレットアドレス（MetaMask）を持っているか確認
    */
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
    } else {
        console.log("We have the ethereum object", ethereum);
    }
    /* 
    * ユーザーが認証可能なウォレットアドレスを持っている場合は、
    * ユーザーに対してウォレットへのアクセス許可を求める。
    * 許可されれば、ユーザーの最初のウォレットアドレスを
    * accounts に格納する
    */
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length !== 0) {  // !==は型まで含めて違いあれば
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      // **** イベントリスナーをここで設定 ****
      // この時点で、ユーザーはウォレット接続が済んでる
      setupEventListener()
    } else {
      console.log("No authorized account found");
    }
  };

  /* 
  * connectWallet メソッドを実装する
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /*
      * ウォレットアドレスに対してアクセスをリクエスト
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      /*
      * ウォレットアドレスをcurrentAccountに紐づける
      */
      setCurrentAccount(accounts[0]);

      // **** イベントリスナーをここで設定 ****
      setupEventListener()
    } catch (error) {
      console.log(error);
    }
  };

  // setupEventListener 関数を定義
  // MyEpicNFT.sol の中で event がemit されたときに、
  // 情報を受け取ります
  // const setupEventListener = async () => {       // NFTが発行される際にemitされるNewEpicNFTMinted(MyEpicNFT.sol)イベントを受信。TokenIdを取得して、新しくmintされたNFTへのOpenSeaリンクをユーザーに提供している
  //   try {
  //     const { ethereum } = window;
  //     if (ethereum) {
  //       const provider = new ethers.providers.Web3Provider(ethereum);
  //       const signer = provider.getSigner();
  //       // NFTが発行される
  //       const connectedContract = new ethers.Contract(
  //         CONTRACT_ADDRESS,
  //         myEpicNft.abi,
  //         signer
  //       );
  //       // Event がemitされる際に、コントラクトから送信される情報を受け取っている
  //       connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
  //         console.log(from, tokenId.toNumber());
  //         alert(
  //           `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大10分かかることがあります。NFT へのリンクはこちらです： https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
  //         );
  //       });
  //       console.log("Setup event listener!");
  //     } else {
  //       console.log("Ethereum object doesn't exist!");
  //     } 
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // setupEventListener 関数を定義します。
  // MyEpicNFT.sol の中で event が　emit された時に、
  // 情報を受け取ります。
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    const CONTRACT_ADDRESS = "0x4174f958d1a62AcD94f020542f932F5dd09fc25b";
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);                           // ethersライブラリからproviderのインスタンスを新規作成
        const signer = provider.getSigner();                                                    // ウォレットアドレスの抽象化。トランザクションに署名しデータをETHNETに送信
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer); // コントラクトへの接続。3つの変数を渡す
        console.log("Going to pop wallet now to pay gas...");                                   // コントラクトとの接続を行った後、承認が開始されることを通知
        let nftTxn = await connectedContract.makeAnEpicNFT();                                   // makeAnEpicNFT関数をコントラクトから呼び出し、awaitを使用してNFTの発行が承認（＝マイニング）されるまで処理をとめている
        console.log("Mining...please wait.");
        await nftTxn.wait();                                                                    // 承認が終わったらawait nftTxn.wait()が実行され、トランザクションの結果を取得
        console.log(nftTxn);
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // renderNotConnectedContainer メソッド(Connect to Wallet を表示する関数)を定義します。
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  let chainId = await ethereum.request({ method: 'eth_chainId' });
  console.log("Connected to chain " + chainId);
  // 0x4はRinkebyのID
  const rinkebyChainId = "0x4";
  if (chainId !== rinkebyChainId ) {
    alert("You are not connected to the Rinkeby Test Network!");
  }

  /*
  * ページがロードされたときに useEffect()内の関数が呼び出される 
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
          あなただけの特別な NFT を Mint しよう💫
          </p>
          {/* 条件付きレンダリングを追加
          * 既に接続されている場合は
          Connect to Walletを表示しないようにする */}
          {currentAccount === "" ? (                                                    // 条件付きレンダリング currentAccountにユーザのウォレットアドレスが紐づいているかどうか判定
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
