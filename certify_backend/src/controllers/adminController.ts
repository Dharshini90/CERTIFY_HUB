import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DepartmentModel } from '../models/Department';
import { SectionModel } from '../models/Section';
import { PlatformModel } from '../models/Platform';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';

export class AdminController {
    // ─── Departments ───────────────────────────────────────────────────────────
    static async getDepartments(req: AuthRequest, res: Response): Promise<void> {
        try {
            const departments = await DepartmentModel.findAll();
            res.json({ departments });
        } catch {
            res.status(500).json({ error: 'Failed to fetch departments' });
        }
    }

    static async createDepartment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { name } = req.body;
            if (!name) throw new AppError('Department name is required', 400);
            const department = await DepartmentModel.create(name.trim());
            res.status(201).json({ message: 'Department created', department });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to create department' });
        }
    }

    static async updateDepartment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { name } = req.body;
            if (!name) throw new AppError('Department name is required', 400);
            const department = await DepartmentModel.update(id, name.trim());
            if (!department) throw new AppError('Department not found', 404);
            res.json({ message: 'Department updated', department });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to update department' });
        }
    }

    static async deleteDepartment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const deleted = await DepartmentModel.delete(id);
            if (!deleted) throw new AppError('Department not found', 404);
            res.json({ message: 'Department deleted' });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to delete department' });
        }
    }

    // ─── Sections ──────────────────────────────────────────────────────────────
    static async getSections(req: AuthRequest, res: Response): Promise<void> {
        try {
            const sections = await SectionModel.findAll();
            res.json({ sections });
        } catch {
            res.status(500).json({ error: 'Failed to fetch sections' });
        }
    }

    static async createSection(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { name } = req.body;
            if (!name) throw new AppError('Section name is required', 400);
            const section = await SectionModel.create(name.trim().toUpperCase());
            res.status(201).json({ message: 'Section created', section });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to create section' });
        }
    }

    static async updateSection(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { name } = req.body;
            if (!name) throw new AppError('Section name is required', 400);
            const section = await SectionModel.update(id, name.trim().toUpperCase());
            if (!section) throw new AppError('Section not found', 404);
            res.json({ message: 'Section updated', section });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to update section' });
        }
    }

    static async deleteSection(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const deleted = await SectionModel.delete(id);
            if (!deleted) throw new AppError('Section not found', 404);
            res.json({ message: 'Section deleted' });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to delete section' });
        }
    }

    // ─── Platforms ─────────────────────────────────────────────────────────────
    static async createPlatform(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { name, has_categories } = req.body;
            if (!name) throw new AppError('Platform name is required', 400);
            const platform = await PlatformModel.create(name.trim(), has_categories === true || has_categories === 'true');
            res.status(201).json({ message: 'Platform created', platform });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to create platform' });
        }
    }

    static async updatePlatform(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { name, has_categories } = req.body;
            if (!name) throw new AppError('Platform name is required', 400);
            const platform = await PlatformModel.update(id, name.trim(), has_categories === true || has_categories === 'true');
            if (!platform) throw new AppError('Platform not found', 404);
            res.json({ message: 'Platform updated', platform });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to update platform' });
        }
    }

    static async deletePlatform(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const deleted = await PlatformModel.delete(id);
            if (!deleted) throw new AppError('Platform not found', 404);
            res.json({ message: 'Platform deleted' });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to delete platform' });
        }
    }

    static async createCategory(req: AuthRequest, res: Response): Promise<void> {
        try {
            const platformId = parseInt(req.params.platformId);
            const { name } = req.body;
            if (!name) throw new AppError('Category name is required', 400);
            const category = await PlatformModel.createCategory(platformId, name.trim());
            res.status(201).json({ message: 'Category created', category });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to create category' });
        }
    }

    static async deleteCategory(req: AuthRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.categoryId);
            const deleted = await PlatformModel.deleteCategory(id);
            if (!deleted) throw new AppError('Category not found', 404);
            res.json({ message: 'Category deleted' });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to delete category' });
        }
    }

    // ─── Faculty Management ────────────────────────────────────────────────────
    static async getFacultyList(req: AuthRequest, res: Response): Promise<void> {
        try {
            const faculty = await UserModel.findAllFaculty();
            res.json({ faculty });
        } catch {
            res.status(500).json({ error: 'Failed to fetch faculty list' });
        }
    }

    static async updateFaculty(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, email } = req.body;
            const updated = await UserModel.updateFaculty(id, { name, email });
            if (!updated) throw new AppError('Faculty not found', 404);
            const { password_hash: _, ...userWithoutPassword } = updated as any;
            res.json({ message: 'Faculty updated', faculty: userWithoutPassword });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to update faculty' });
        }
    }

    static async deleteFaculty(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const selfId = req.user?.id;
            if (id === selfId) throw new AppError("You cannot delete your own account", 400);
            const deleted = await UserModel.deleteFaculty(id);
            if (!deleted) throw new AppError('Faculty not found', 404);
            res.json({ message: 'Faculty deleted' });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to delete faculty' });
        }
    }
}
