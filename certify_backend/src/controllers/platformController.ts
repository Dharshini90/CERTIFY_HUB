import { Request, Response } from 'express';
import { PlatformModel } from '../models/Platform';

export class PlatformController {
    static async getAllPlatforms(req: Request, res: Response): Promise<void> {
        try {
            const platforms = await PlatformModel.findAll();
            res.json({ platforms });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch platforms' });
        }
    }

    static async getPlatformCategories(req: Request, res: Response): Promise<void> {
        try {
            const { platformId } = req.params;
            const categories = await PlatformModel.getCategoriesByPlatformId(
                parseInt(platformId)
            );
            res.json({ categories });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }
}
