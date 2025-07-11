
// stellar.dao.ts
import axios from 'axios';
import * as StellarSdk from 'stellar-sdk';
import config from '../config/stellar.config';

const server = new StellarSdk.Horizon.Server(config.horizonUrl);

export class StellarDAO {
    static createKeypair() {
        const pair = StellarSdk.Keypair.random();
        return {
            publicKey: pair.publicKey(),
            secretKey: pair.secret()
        };
    }

    static getPublicKeyFromSecret(secretKey: string): string {
        const keypair = StellarSdk.Keypair.fromSecret(secretKey);
        return keypair.publicKey();
    }

    static async fundAccount(publicKey: string) {
        try {
            const response = await axios.get(`${config.friendbotUrl}?addr=${publicKey}`, {
                timeout: 10000 // 10 second timeout
            });

            if (response.status !== 200) {
                throw new Error(`Friendbot returned status ${response.status}`);
            }

            return true;
        } catch (error: any) {
            console.error('Account funding failed:', error.message);
            throw new Error(`Failed to fund account: ${error.message}`);
        }
    }

    static async waitForAccount(publicKey: string, maxRetries = 15): Promise<void> {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await server.loadAccount(publicKey);
                console.log(`Account ${publicKey} is now available on the network`);
                return; // Account found and ready
            } catch (error: any) {
                if (i === maxRetries - 1) {
                    console.error(error.message)
                    throw new Error(`Account ${publicKey} not found after ${maxRetries} attempts`);
                }
                console.log(`Waiting for account... attempt ${i + 1}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            }
        }
    }

    static async createTrustline(secretKey: string, assetCode: string, issuerPublicKey: string) {
        try {
            const keypair = StellarSdk.Keypair.fromSecret(secretKey);
            const account = await server.loadAccount(keypair.publicKey());
            const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);
            const fee = await server.fetchBaseFee();

            const transaction = new StellarSdk.TransactionBuilder(account, {
                fee: fee.toString(),
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                .addOperation(StellarSdk.Operation.changeTrust({
                    asset,
                    limit: config.trustLimit // Set trust limit from config
                }))
                .setTimeout(30)
                .build();

            transaction.sign(keypair);
            const result = await server.submitTransaction(transaction);

            console.log(`Trustline created successfully. Hash: ${result.hash}`);
            return result.hash;
        } catch (error: any) {
            console.error('Trustline creation failed:', error.response?.data || error.message);

            // Handle specific Stellar errors
            if (error.response?.data?.extras?.result_codes?.operations) {
                const opErrors = error.response.data.extras.result_codes.operations;
                throw new Error(`Trustline operation failed: ${opErrors.join(', ')}`);
            }

            if (error.response?.data?.extras?.result_codes?.transaction) {
                const txError = error.response.data.extras.result_codes.transaction;
                throw new Error(`Transaction failed: ${txError}`);
            }

            throw new Error(`Failed to create trustline: ${error.message}`);
        }
    }

    static async validateAccounts(senderSecretKey: string, receiverPublicKey: string) {
        try {
            // Validate sender secret key format
            const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecretKey);
            const senderPublicKey = senderKeypair.publicKey();

            // Validate receiver public key format
            StellarSdk.Keypair.fromPublicKey(receiverPublicKey);

            // Check if both accounts exist on the network
            await server.loadAccount(senderPublicKey);
            await server.loadAccount(receiverPublicKey);

            return true;
        } catch (error: any) {
            if (error.name === 'NotFoundError') {
                throw new Error('One or both accounts do not exist on the network');
            }
            throw new Error(`Account validation failed: ${error.message}`);
        }
    }

    static async checkTrustline(publicKey: string, assetCode: string, issuerPublicKey: string): Promise<boolean> {
        try {
            const account = await server.loadAccount(publicKey);
            const balances = account.balances;

            // Check if account has trustline for the asset
            const trustline = balances.find((balance: any) =>
                balance.asset_code === assetCode &&
                balance.asset_issuer === issuerPublicKey
            );

            return !!trustline;
        } catch (error: any) {
            console.error('Trustline check failed:', error.message);
            return false;
        }
    }

    static async sendPayment(
        senderSecretKey: string,
        receiverPublicKey: string,
        assetCode: string,
        issuerPublicKey: string,
        amount: string,
        memo?: string
    ) {
        try {
            const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecretKey);
            const senderAccount = await server.loadAccount(senderKeypair.publicKey());
            const asset = new StellarSdk.Asset(assetCode, issuerPublicKey);
            const fee = await server.fetchBaseFee();

            const transactionBuilder = new StellarSdk.TransactionBuilder(senderAccount, {
                fee: fee.toString(),
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                .addOperation(StellarSdk.Operation.payment({
                    destination: receiverPublicKey,
                    asset: asset,
                    amount: amount
                }))
                .setTimeout(30);

            // Add memo if provided
            if (memo) {
                transactionBuilder.addMemo(StellarSdk.Memo.text(memo));
            }

            const transaction = transactionBuilder.build();
            transaction.sign(senderKeypair);

            const result = await server.submitTransaction(transaction);

            console.log(`Payment sent successfully. Hash: ${result.hash}`);
            return result.hash;
        } catch (error: any) {
            console.error('Payment failed:', error.response?.data || error.message);

            // Handle specific Stellar errors
            if (error.response?.data?.extras?.result_codes?.operations) {
                const opErrors = error.response.data.extras.result_codes.operations;
                throw new Error(`Payment operation failed: ${opErrors.join(', ')}`);
            }

            if (error.response?.data?.extras?.result_codes?.transaction) {
                const txError = error.response.data.extras.result_codes.transaction;
                throw new Error(`Transaction failed: ${txError}`);
            }

            throw new Error(`Failed to send payment: ${error.message}`);
        }
    }

    static async getAllBalances(publicKey: string) {
        try {
            const account = await server.loadAccount(publicKey);
            return account.balances;
        } catch (error: any) {
            console.error('Get all balances failed:', error.message);
            throw new Error(`Failed to get account balances: ${error.message}`);
        }
    }
    static async getAssetBalance(publicKey: string, assetCode: string, issuerPublicKey: string) {
        try {
            const account = await server.loadAccount(publicKey);
            const balances = account.balances;

            // Find the specific asset balance
            const assetBalance = balances.find((balance: any) =>
                balance.asset_code === assetCode &&
                balance.asset_issuer === issuerPublicKey
            );

            return assetBalance ? assetBalance.balance : '0';
        } catch (error: any) {
            console.error('Get asset balance failed:', error.message);
            throw new Error(`Failed to get asset balance: ${error.message}`);
        }
    }

    // Add these new methods to your StellarDAO class

    static async createSellOffer(
        secretKey: string,
        assetCode: string,
        issuerPublicKey: string,
        amount: string,
        price: string,
        memo?: string
    ) {
        try {
            const keypair = StellarSdk.Keypair.fromSecret(secretKey);
            const account = await server.loadAccount(keypair.publicKey());
            const sellingAsset = new StellarSdk.Asset(assetCode, issuerPublicKey);
            const buyingAsset = StellarSdk.Asset.native(); // XLM
            const fee = await server.fetchBaseFee();

            const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
                fee: fee.toString(),
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                .addOperation(StellarSdk.Operation.manageSellOffer({
                    selling: sellingAsset,
                    buying: buyingAsset,
                    amount: amount,
                    price: price,
                    offerId: '0' // 0 means create new offer
                }))
                .setTimeout(30);

            // Add memo if provided
            if (memo) {
                transactionBuilder.addMemo(StellarSdk.Memo.text(memo));
            }

            const transaction = transactionBuilder.build();
            transaction.sign(keypair);

            const result = await server.submitTransaction(transaction);

            console.log(`Sell offer created successfully. Hash: ${result.hash}`);
            return result.hash;
        } catch (error: any) {
            console.error('Create sell offer failed:', error.response?.data || error.message);

            // Handle specific Stellar errors
            if (error.response?.data?.extras?.result_codes?.operations) {
                const opErrors = error.response.data.extras.result_codes.operations;
                throw new Error(`Sell offer operation failed: ${opErrors.join(', ')}`);
            }

            if (error.response?.data?.extras?.result_codes?.transaction) {
                const txError = error.response.data.extras.result_codes.transaction;
                throw new Error(`Transaction failed: ${txError}`);
            }

            throw new Error(`Failed to create sell offer: ${error.message}`);
        }
    }

    static async createBuyOffer(
        secretKey: string,
        assetCode: string,
        issuerPublicKey: string,
        amount: string,
        price: string,
        memo?: string
    ) {
        try {
            const keypair = StellarSdk.Keypair.fromSecret(secretKey);
            const account = await server.loadAccount(keypair.publicKey());
            const buyingAsset = new StellarSdk.Asset(assetCode, issuerPublicKey);
            const sellingAsset = StellarSdk.Asset.native(); // XLM
            const fee = await server.fetchBaseFee();

            const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
                fee: fee.toString(),
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                .addOperation(StellarSdk.Operation.manageBuyOffer({
                    selling: sellingAsset,
                    buying: buyingAsset,
                    buyAmount: amount,
                    price: price,
                    offerId: '0' // 0 means create new offer
                }))
                .setTimeout(30);

            // Add memo if provided
            if (memo) {
                transactionBuilder.addMemo(StellarSdk.Memo.text(memo));
            }

            const transaction = transactionBuilder.build();
            transaction.sign(keypair);

            const result = await server.submitTransaction(transaction);

            console.log(`Buy offer created successfully. Hash: ${result.hash}`);
            return result.hash;
        } catch (error: any) {
            console.error('Create buy offer failed:', error.response?.data || error.message);

            // Handle specific Stellar errors
            if (error.response?.data?.extras?.result_codes?.operations) {
                const opErrors = error.response.data.extras.result_codes.operations;
                throw new Error(`Buy offer operation failed: ${opErrors.join(', ')}`);
            }

            if (error.response?.data?.extras?.result_codes?.transaction) {
                const txError = error.response.data.extras.result_codes.transaction;
                throw new Error(`Transaction failed: ${txError}`);
            }

            throw new Error(`Failed to create buy offer: ${error.message}`);
        }
    }

    static async getAccountOffers(publicKey: string) {
        try {
            const offers = await server.offers()
                .forAccount(publicKey)
                .call();

            return offers.records.map((offer: any) => ({
                id: offer.id,
                selling: {
                    asset_type: offer.selling.asset_type,
                    asset_code: offer.selling.asset_code,
                    asset_issuer: offer.selling.asset_issuer
                },
                buying: {
                    asset_type: offer.buying.asset_type,
                    asset_code: offer.buying.asset_code,
                    asset_issuer: offer.buying.asset_issuer
                },
                amount: offer.amount,
                price: offer.price,
                price_r: offer.price_r,
                last_modified_ledger: offer.last_modified_ledger,
                last_modified_time: offer.last_modified_time
            }));
        } catch (error: any) {
            console.error('Get account offers failed:', error.message);
            throw new Error(`Failed to get account offers: ${error.message}`);
        }
    }

    // static async cancelOffer(secretKey: string, offerId: string) {
    //     try {
    //         const keypair = StellarSdk.Keypair.fromSecret(secretKey);
    //         const account = await server.loadAccount(keypair.publicKey());
    //         const fee = await server.fetchBaseFee();

    //         // Get the offer details first to know which assets to use
    //         const offers = await server.offers()
    //             .forAccount(keypair.publicKey())
    //             .call();

    //         const offer = offers.records.find((o: any) => o.id === offerId);
    //         if (!offer) {
    //             throw new Error(`Offer with ID ${offerId} not found`);
    //         }

    //         const sellingAsset = offer.selling.asset_type === 'native'
    //             ? StellarSdk.Asset.native()
    //             : new StellarSdk.Asset(offer.selling.asset_code, offer.selling.asset_issuer);

    //         const buyingAsset = offer.buying.asset_type === 'native'
    //             ? StellarSdk.Asset.native()
    //             : new StellarSdk.Asset(offer.buying.asset_code, offer.buying.asset_issuer);

    //         const transaction = new StellarSdk.TransactionBuilder(account, {
    //             fee: fee.toString(),
    //             networkPassphrase: StellarSdk.Networks.TESTNET,
    //         })
    //             .addOperation(StellarSdk.Operation.manageSellOffer({
    //                 selling: sellingAsset,
    //                 buying: buyingAsset,
    //                 amount: '0', // Setting amount to 0 cancels the offer
    //                 price: offer.price,
    //                 offerId: offerId
    //             }))
    //             .setTimeout(30)
    //             .build();

    //         transaction.sign(keypair);

    //         const result = await server.submitTransaction(transaction);

    //         console.log(`Offer canceled successfully. Hash: ${result.hash}`);
    //         return result.hash;
    //     } catch (error: any) {
    //         console.error('Cancel offer failed:', error.response?.data || error.message);

    //         // Handle specific Stellar errors
    //         if (error.response?.data?.extras?.result_codes?.operations) {
    //             const opErrors = error.response.data.extras.result_codes.operations;
    //             throw new Error(`Cancel offer operation failed: ${opErrors.join(', ')}`);
    //         }

    //         if (error.response?.data?.extras?.result_codes?.transaction) {
    //             const txError = error.response.data.extras.result_codes.transaction;
    //             throw new Error(`Transaction failed: ${txError}`);
    //         }

    //         throw new Error(`Failed to cancel offer: ${error.message}`);
    //     }
    // }
}