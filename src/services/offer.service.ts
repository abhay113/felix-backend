import { OfferDAO } from '../dao/offer.dao';

export class OfferService {
  static async getAvailableSellOffers(userId: string) {
    return await OfferDAO.getActiveSellOffersExcludingUser(userId);
  }
}
