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
            const department = req.user?.department;
            const faculty = await UserModel.findAllFaculty(department);
            res.json({ faculty });
        } catch {
            res.status(500).json({ error: 'Failed to fetch faculty list' });
        }
    }

    static async updateFaculty(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const requester = req.user;
            if (!requester) throw new AppError('Authentication required', 401);

            const { name, email, is_department_admin } = req.body;
            
            // Get target faculty member to check department
            const targetUser = await UserModel.findById(id);
            if (!targetUser || targetUser.role !== 'faculty') {
                throw new AppError('Faculty member not found', 404);
            }

            // Check authority: HOD of same dept OR Admin of same dept
            const isHod = requester.role === 'hod';
            const isAdmin = requester.is_department_admin;
            const sameDept = requester.department === targetUser.department;

            if (!isHod && !(isAdmin && sameDept)) {
                throw new AppError('Unauthorized: You can only update faculty in your own department', 403);
            }

            // If toggling admin status, only same-department HOD/Admin (which is already checked) 
            // but we might want to restrict revoking a "Super Admin" only to HOD? 
            // User: "chandra (hod)should able to revoke super admin if she wants"
            // I'll allow both to match previous delegable logic, but Chandra's power is guaranteed here.

            const updated = await UserModel.updateFaculty(id, { name, email, is_department_admin });
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
            const requester = req.user;
            if (!requester) throw new AppError('Authentication required', 401);

            const targetUser = await UserModel.findById(id);
            if (!targetUser || targetUser.role !== 'faculty') {
                throw new AppError('Faculty member not found', 404);
            }

            // Check authority: HOD of same dept OR Admin of same dept
            const isHod = requester.role === 'hod';
            const isAdmin = requester.is_department_admin;
            const sameDept = requester.department === targetUser.department;

            if (id === requester.id) throw new AppError("You cannot delete your own account", 400);

            if (!isHod && !(isAdmin && sameDept)) {
                throw new AppError('Unauthorized: You can only delete faculty in your own department', 403);
            }

            const deleted = await UserModel.deleteFaculty(id);
            if (!deleted) throw new AppError('Failed to delete faculty', 500);
            res.json({ message: 'Faculty deleted' });
        } catch (error) {
            if (error instanceof AppError) res.status(error.statusCode).json({ error: error.message });
            else res.status(500).json({ error: 'Failed to delete faculty' });
        }
    }
}
