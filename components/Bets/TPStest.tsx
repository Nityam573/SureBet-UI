"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";

const TpsTester = () => {
    const [running, setRunning] = useState(false);
    const [finalMetrics, setFinalMetrics] = useState<{
        tps: number;
        totalTx: number;
        duration: number;
    } | null>(null);
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
    const [diagnosticInfo, setDiagnosticInfo] = useState<string[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<{
        rpcConnected: boolean;
        walletInitialized: boolean;
    }>({
        rpcConnected: false,
        walletInitialized: false
    });

    const runningRef = useRef(false);
    const providerRef = useRef<ethers.providers.Web3Provider | null>(null);
    const walletRef = useRef<ethers.Wallet | null>(null);
    const nonceRef = useRef(0);
    const startTimeRef = useRef<Date | null>(null);
    const successfulTxRef = useRef<Set<string>>(new Set());

    const logDiagnostic = (message: string) => {
        setDiagnosticInfo(prev => [...prev, `[${new Date().toISOString()}] ${message}`].slice(-50));
        console.log(message);
    };

    useEffect(() => {
        const initializeWallet = async () => {
            const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
            const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY;
            const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS;

            if (!RPC_URL || !PRIVATE_KEY || !RECEIVER_ADDRESS) {
                logDiagnostic("Missing configuration: RPC_URL, PRIVATE_KEY, or RECEIVER_ADDRESS");
                return;
            }

            try {
                const newProvider = new ethers.providers.JsonRpcProvider(RPC_URL);
                await newProvider.getNetwork();
                setConnectionStatus(prev => ({ ...prev, rpcConnected: true }));
                const formattedPrivateKey = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;
                const newWallet = new ethers.Wallet(formattedPrivateKey, newProvider);
                const balance = await newWallet.getBalance();

                setProvider(newProvider);
                setWallet(newWallet);
                providerRef.current = newProvider;
                walletRef.current = newWallet;
                nonceRef.current = await newProvider.getTransactionCount(newWallet.address);

                setConnectionStatus(prev => ({ ...prev, walletInitialized: true }));

                logDiagnostic(`Initialized wallet with balance: ${ethers.utils.formatEther(balance)} ETH`);
            } catch (error) {
                logDiagnostic(`Initialization Error: ${error instanceof Error ? error.message : String(error)}`);
                console.error(error);
            }
        };

        initializeWallet();
    }, []);

    const sendTransaction = useCallback(async () => {
        if (!walletRef.current || !providerRef.current) return null;

        try {
            const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS;
            if (!RECEIVER_ADDRESS) throw new Error("Missing receiver address");

            const currentNonce = nonceRef.current++;
            const gasPrice = ethers.utils.parseUnits("50", "gwei");

            const tx = await walletRef.current.sendTransaction({
                to: RECEIVER_ADDRESS,
                value: ethers.utils.parseEther("0.000001"),
                nonce: currentNonce,
                gasPrice,
                gasLimit: 21000,
            });

            return tx.hash;
        } catch (error: any) {
            if (error.code === -32000 || error.code === 'NONCE_EXPIRED') {
                try {
                    nonceRef.current = await providerRef.current.getTransactionCount(walletRef.current.address);
                } catch (e) {
                    logDiagnostic(`Nonce refresh failed: ${e}`);
                }
            }
            logDiagnostic(`Transaction Error: ${error.message}`);
            return null;
        }
    }, []);

    const startTest = useCallback(async () => {
        if (!walletRef.current || !providerRef.current) return;

        setRunning(true);
        runningRef.current = true;
        setFinalMetrics(null);
        successfulTxRef.current.clear();
        startTimeRef.current = new Date();

        const sendBatch = async () => {
            while (runningRef.current) {
                try {
                    const batchSize = 200;
                    const txPromises = Array(batchSize)
                        .fill(null)
                        .map(async () => {
                            const txHash = await sendTransaction();
                            if (txHash) successfulTxRef.current.add(txHash);
                        });

                    await Promise.all(txPromises);
                    await new Promise(resolve => setTimeout(resolve, 1));
                } catch (error) {
                    logDiagnostic(`Batch Error: ${error instanceof Error ? error.message : String(error)}`);
                    await new Promise(resolve => setTimeout(resolve, 5));
                }
            }
        };

        const batchCount = 10;
        const batchPromises = Array(batchCount).fill(null).map(() => sendBatch());
        await Promise.all(batchPromises);
    }, [sendTransaction]);

    const stopTest = useCallback(() => {
        runningRef.current = false;
        setRunning(false);

        if (startTimeRef.current) {
            const endTime = new Date();
            const duration = (endTime.getTime() - startTimeRef.current.getTime()) / 1000;
            const totalTx = successfulTxRef.current.size;
            const calculatedTps = totalTx / duration;

            setFinalMetrics({
                tps: calculatedTps,
                totalTx,
                duration,
            });

            logDiagnostic(`Test Complete - Duration: ${duration.toFixed(2)}s | Total TX: ${totalTx} | TPS: ${calculatedTps.toFixed(2)}`);
        }
    }, []);

    return (
        <div style={{ 
            fontFamily: 'Arial, sans-serif',
            padding: "20px", 
            textAlign: "center", 
            maxWidth: "800px", 
            margin: "0 auto",
            backgroundColor: "#f4f4f4",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
            <h1 style={{ color: "#333", marginBottom: "20px" }}>
                Blockchain Transaction Performance Tester
            </h1>

            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                gap: "10px", 
                marginBottom: "20px",
                backgroundColor: "white",
                padding: "10px",
                borderRadius: "5px"
            }}>
                <div style={{ 
                    color: connectionStatus.rpcConnected ? "green" : "red",
                    fontWeight: "bold"
                }}>
                    RPC Connection: {connectionStatus.rpcConnected ? "✓ Connected" : "✗ Disconnected"}
                </div>
                <div style={{ 
                    color: connectionStatus.walletInitialized ? "green" : "red",
                    fontWeight: "bold"
                }}>
                    Wallet: {connectionStatus.walletInitialized ? "✓ Initialized" : "✗ Not Ready"}
                </div>
            </div>
            
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                gap: "10px", 
                marginBottom: "20px" 
            }}>
                <button 
                    onClick={startTest} 
                    disabled={running || !wallet || !connectionStatus.walletInitialized}
                    style={{ 
                        padding: "10px 20px", 
                        backgroundColor: running ? "#aaa" : "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: running ? "not-allowed" : "pointer"
                    }}
                >
                    Start Transaction Test
                </button>
                <button 
                    onClick={stopTest} 
                    disabled={!running}
                    style={{ 
                        padding: "10px 20px", 
                        backgroundColor: !running ? "#aaa" : "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: !running ? "not-allowed" : "pointer"
                    }}
                >
                    Stop and Calculate
                </button>
            </div>

            {finalMetrics && (
                <div style={{ 
                    backgroundColor: "white", 
                    padding: "15px", 
                    borderRadius: "5px", 
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    margin: "10px 0"
                }}>
                    <h2 style={{ color: "#333" }}>Test Results</h2>
                    <div style={{ display: "flex", justifyContent: "space-around" }}>
                        <div>
                            <p style={{ color: "#666" }}>Final TPS</p>
                            <strong style={{ color: "#4CAF50", fontSize: "1.5em" }}>
                                {finalMetrics.tps.toFixed(2)}
                            </strong>
                        </div>
                        <div>
                            <p style={{ color: "#666" }}>Total Transactions</p>
                            <strong style={{ color: "#2196F3", fontSize: "1.5em" }}>
                                {finalMetrics.totalTx}
                            </strong>
                        </div>
                        <div>
                            <p style={{ color: "#666" }}>Test Duration</p>
                            <strong style={{ color: "#FF9800", fontSize: "1.5em" }}>
                                {finalMetrics.duration.toFixed(2)}s
                            </strong>
                        </div>
                    </div>
                </div>
            )}

            {running && (
                <div style={{ 
                    backgroundColor: "#e3f2fd", 
                    padding: "15px", 
                    borderRadius: "5px", 
                    margin: "10px 0",
                    color: "#1976d2"
                }}>
                    <p>Transaction Test in Progress...</p>
                </div>
            )}
        </div>
    );
};

export default TpsTester;