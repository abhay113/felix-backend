// stellar.controller.ts
import { Request, Response } from 'express';
import { StellarService } from '../services/stellar.service';
import config from '../config/stellar.config';

export class StellarController {
    static async setupAccount(req: Request, res: Response) {
        try {
            const result = await StellarService.createAndSetupAccount();
            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Setup account error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    static async sendBlueDollar(req: Request, res: Response) {
        try {
            const { senderSecretKey, receiverPublicKey, amount, memo } = req.body;

            // Validate required fields
            if (!senderSecretKey || !receiverPublicKey || !amount) {
                res.status(400).json({
                    success: false,
                    error: 'senderSecretKey, receiverPublicKey, and amount are required'
                });
            }

            const result = await StellarService.sendBlueDollar(
                senderSecretKey,
                receiverPublicKey,
                amount,
                memo
            );

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Send Blue Dollar error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    static async getBalance(req: Request, res: Response) {
        try {
            const { publicKey } = req.params;
            const result = await StellarService.getAccountBalance(publicKey);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Get balance error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    static async issueBlueDollarToUser(req: Request, res: Response) {
        try {
            const { receiverPublicKey, amount, memo , walletId} = req.body;

            console.log('req.bodyreq.body',req.body);
            

            if (!receiverPublicKey || !amount) {
                res.status(400).json({
                    success: false,
                    error: 'receiverPublicKey and amount are required'
                });
            }

            const result = await StellarService.issueBlueDollarToUser(receiverPublicKey, amount, memo, walletId);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Issue Blue Dollar error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    static async getAssetBalance(req: Request, res: Response) {
        try {
            const { publicKey } = req.params;
            const assetCode = config.assetCode;
            const issuerPublicKey = config.issuerPublicKey;

            if (!assetCode || !issuerPublicKey) {
                res.status(400).json({
                    success: false,
                    error: 'assetCode and issuerPublicKey are required'
                });
            }
            const result = await StellarService.getAssetBalance(publicKey, assetCode, issuerPublicKey);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Get asset balance error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Add these new methods to your StellarController class

    static async createSellOffer(req: Request, res: Response) {
        try {
            const { secretKey, amount, price, memo } = req.body;

            if (!secretKey || !amount || !price) {
                res.status(400).json({
                    success: false,
                    error: 'secretKey, amount, and price are required'
                });
            }

            const result = await StellarService.createSellOffer(secretKey, amount, price, memo);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Create sell offer error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async createBuyOffer(req: Request, res: Response) {
        try {
            const { secretKey, amount, price, memo } = req.body;

            if (!secretKey || !amount || !price) {
                res.status(400).json({
                    success: false,
                    error: 'secretKey, amount, and price are required'
                });
            }

            const result = await StellarService.createBuyOffer(secretKey, amount, price, memo);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Create buy offer error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getOffers(req: Request, res: Response) {
        try {
            const { publicKey } = req.params;

            const result = await StellarService.getAccountOffers(publicKey);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Get offers error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // static async cancelOffer(req: Request, res: Response) {
    //     try {
    //         const { secretKey, offerId } = req.body;

    //         if (!secretKey || !offerId) {
    //             res.status(400).json({
    //                 success: false,
    //                 error: 'secretKey and offerId are required'
    //             });
    //         }

    //         const result = await StellarService.cancelOffer(secretKey, offerId);

    //         res.status(200).json({
    //             success: true,
    //             data: result
    //         });
    //     } catch (error: any) {
    //         console.error('Cancel offer error:', error);
    //         res.status(500).json({
    //             success: false,
    //             error: error.message
    //         });
    //     }
    // }
}