
// stellar.service.ts
import { StellarDAO } from '../dao/stellar.dao';
import config from '../config/stellar.config';
import { WalletsDAO} from '../dao/wallets.dao'

export class StellarService {
    static async createAndSetupAccount() {
        try {
            console.log('Step 1: Creating new account...');
            // Step 1: Create new keypair
            const { publicKey, secretKey } = StellarDAO.createKeypair();
            console.log(`Generated Keypair: Public Key: ${publicKey}, Secret Key: ${secretKey}`);
            console.log('Step 2: Funding account...');
            // Step 2: Fund the account
            await StellarDAO.fundAccount(publicKey);

            console.log('Step 3: Waiting for account to be available...');
            // Step 3: Wait for account to be properly funded and available
            await StellarDAO.waitForAccount(publicKey);

            console.log('Step 4: Creating Blue Dollar trustline...');
            // Step 4: Create trustline for Blue Dollar
            const trustHash = await StellarDAO.createTrustline(
                secretKey,
                config.assetCode,
                config.issuerPublicKey
            );

            console.log('Step 5: Setup complete!');
            return {
                message: 'Account created, funded, and Blue Dollar trustline established successfully.',
                publicKey,
                secretKey, // Consider removing in production
                trustTransactionHash: trustHash,
                assetCode: config.assetCode,
                issuerPublicKey: config.issuerPublicKey,
                steps: [
                    'Account keypair generated',
                    'Account funded via Friendbot',
                    'Account verified on network',
                    'Blue Dollar trustline created'
                ]
            };
        } catch (error: any) {
            console.error('Setup account error:', error);
            throw new Error(`Account setup failed: ${error.message}`);
        }
    }

    static async sendBlueDollar(senderSecretKey: string, receiverPublicKey: string, amount: string, memo?: string) {
        try {
            console.log('Step 1: Validating accounts...');
            // Step 1: Validate sender and receiver accounts
            await StellarDAO.validateAccounts(senderSecretKey, receiverPublicKey);

            console.log('Step 2: Checking receiver trustline...');
            // Step 2: Check if receiver has Blue Dollar trustline
            const hasTrustline = await StellarDAO.checkTrustline(receiverPublicKey, config.assetCode, config.issuerPublicKey);
            if (!hasTrustline) {
                throw new Error('Receiver does not have a trustline for Blue Dollar (BD)');
            }

            console.log('Step 3: Sending Blue Dollar...');
            // Step 3: Send Blue Dollar payment
            const transactionHash = await StellarDAO.sendPayment(
                senderSecretKey,
                receiverPublicKey,
                config.assetCode,
                config.issuerPublicKey,
                amount,
                memo
            );

            console.log('Step 4: Payment sent successfully!');
            return {
                message: 'Blue Dollar payment sent successfully.',
                transactionHash,
                from: StellarDAO.getPublicKeyFromSecret(senderSecretKey),
                to: receiverPublicKey,
                amount,
                assetCode: config.assetCode,
                issuerPublicKey: config.issuerPublicKey,
                memo: memo || null,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            console.error('Send Blue Dollar error:', error);
            throw new Error(`Failed to send Blue Dollar: ${error.message}`);
        }
    }

    static async getAccountBalance(publicKey: string) {
        try {
            const balances = await StellarDAO.getAllBalances(publicKey);
            const blueDollarBalance = await StellarDAO.getAssetBalance(publicKey, config.assetCode, config.issuerPublicKey);

            return {
                message: 'Account balance retrieved successfully',
                publicKey,
                balances: {
                    blueDollar: blueDollarBalance,
                    xlm: balances.find((b: any) => b.asset_type === 'native')?.balance || '0',
                    all: balances
                }
            };
        } catch (error: any) {
            console.error('Get account balance error:', error);
            throw new Error(`Failed to get account balance: ${error.message}`);
        }
    }
    static async issueBlueDollarToUser(receiverPublicKey: string, amount: string, memo?: string, walletId?:any) {
        try {
            const issuerSecretKey = config.issuerSecretKey;
            const issuerPublicKey = config.issuerPublicKey;

            if (!issuerSecretKey) {
                throw new Error('Issuer secret key is not set in environment');
            }

            const getWallet =  await WalletsDAO.getWalletById(walletId)
            console.log("getWalletgetWallet",getWallet);

           const updatedAmmount = (getWallet.balance === null)
                ? Number(amount) // Ensure amount is a number if balance is null
                : Number(getWallet.balance) + Number(amount);
            

            const upadteWallet = await WalletsDAO.updateWalletById(walletId,updatedAmmount)

            console.log("upadteWalletupadteWallet",upadteWallet);
            
            
            // Check if receiver has a trustline
            const hasTrustline = await StellarDAO.checkTrustline(receiverPublicKey, config.assetCode, issuerPublicKey);
            if (!hasTrustline) {
                throw new Error('Receiver does not have a trustline for Blue Dollar (BD)');
            }

            // Send BD from issuer to receiver
            const txHash = await StellarDAO.sendPayment(
                issuerSecretKey,
                receiverPublicKey,
                config.assetCode,
                issuerPublicKey,
                amount,
                memo
            );

            return {
                message: `Issued ${amount} BD to user`,
                transactionHash: txHash,
                from: issuerPublicKey,
                to: receiverPublicKey,
                amount,
                assetCode: config.assetCode,
                issuerPublicKey,
                memo: memo || null,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            console.error('Issue Blue Dollar error:', error.message);
            throw new Error(`Failed to issue Blue Dollar: ${error.message}`);
        }
    }
    static async getAssetBalance(publicKey: string, assetCode: string, issuerPublicKey: string) {
        try {
            const balance = await StellarDAO.getAssetBalance(publicKey, assetCode, issuerPublicKey);
            return {
                message: `Balance for ${assetCode} asset retrieved successfully`,
                publicKey,
                assetCode,
                issuerPublicKey,
                balance
            };
        } catch (error: any) {
            console.error('Get asset balance error:', error);
            throw new Error(`Failed to get asset balance: ${error.message}`);
        }
    }

    // Add these new methods to your StellarService class

    static async createSellOffer(secretKey: string, amount: string, price: string, memo?: string) {
        try {
            console.log('Step 1: Validating account...');
            const publicKey = StellarDAO.getPublicKeyFromSecret(secretKey);
            await StellarDAO.validateAccounts(secretKey, publicKey);

            console.log('Step 2: Creating sell offer...');
            const transactionHash = await StellarDAO.createSellOffer(
                secretKey,
                config.assetCode,
                config.issuerPublicKey,
                amount,
                price,
                memo
            );

            console.log('Step 3: Sell offer created successfully!');
            return {
                message: 'Blue Dollar sell offer created successfully',
                transactionHash,
                seller: publicKey,
                sellingAsset: config.assetCode,
                buyingAsset: 'XLM',
                amount,
                price,
                memo: memo || null,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            console.error('Create sell offer error:', error);
            throw new Error(`Failed to create sell offer: ${error.message}`);
        }
    }

    static async createBuyOffer(secretKey: string, amount: string, price: string, memo?: string) {
        try {
            console.log('Step 1: Validating account...');
            const publicKey = StellarDAO.getPublicKeyFromSecret(secretKey);
            await StellarDAO.validateAccounts(secretKey, publicKey);

            console.log('Step 2: Creating buy offer...');
            const transactionHash = await StellarDAO.createBuyOffer(
                secretKey,
                config.assetCode,
                config.issuerPublicKey,
                amount,
                price,
                memo
            );

            console.log('Step 3: Buy offer created successfully!');
            return {
                message: 'Blue Dollar buy offer created successfully',
                transactionHash,
                buyer: publicKey,
                sellingAsset: 'XLM',
                buyingAsset: config.assetCode,
                amount,
                price,
                memo: memo || null,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            console.error('Create buy offer error:', error);
            throw new Error(`Failed to create buy offer: ${error.message}`);
        }
    }

    static async getAccountOffers(publicKey: string) {
        try {
            const offers = await StellarDAO.getAccountOffers(publicKey);

            return {
                message: 'Account offers retrieved successfully',
                publicKey,
                offers,
                totalOffers: offers.length
            };
        } catch (error: any) {
            console.error('Get account offers error:', error);
            throw new Error(`Failed to get account offers: ${error.message}`);
        }
    }

    // static async cancelOffer(secretKey: string, offerId: string) {
    //     try {
    //         console.log('Step 1: Validating account...');
    //         const publicKey = StellarDAO.getPublicKeyFromSecret(secretKey);
    //         await StellarDAO.validateAccounts(secretKey, publicKey);

    //         console.log('Step 2: Canceling offer...');
    //         const transactionHash = await StellarDAO.cancelOffer(secretKey, offerId);

    //         console.log('Step 3: Offer canceled successfully!');
    //         return {
    //             message: 'Offer canceled successfully',
    //             transactionHash,
    //             publicKey,
    //             offerId,
    //             timestamp: new Date().toISOString()
    //         };
    //     } catch (error: any) {
    //         console.error('Cancel offer error:', error);
    //         throw new Error(`Failed to cancel offer: ${error.message}`);
    //     }
    // }
}