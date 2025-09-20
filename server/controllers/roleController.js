const { Role, Permission } = require("../database/rolesDB");
const slugify = require("slugify");

const roleController = {
    createRole: async (req, res) => {
        try {
            const { title, description, permissions } = req.body;
            const existingRole = await Role.findOne({ slug: slugify(title) });
            if (existingRole) {
                return res.status(200).json({ success: false, message: "A role with the same name already exists" });
            }
            const newRole = new Role({
                title,
                slug: slugify(title.toLowerCase()),
                description,
                permissions: permissions || [],
            });
            await newRole.save();
            return res.status(200).json({ success: true, message: "Role created successfully", role: newRole });          

        } catch (error) {
            console.error("Error creating role:", error);
            return res.status(200).json({ success: false, message: "Internal server error" });
        }
    },

    editRole: async (req, res) => {
        try {
            const { id, title, description, permissions } = req.body;
            const existingRole = await Role.findById(id);
            if (!existingRole) {
                return res.status(200).json({ success: false, message: "Role not found" });
            }
            existingRole.title = title;
            existingRole.slug = slugify(title.toLowerCase());
            existingRole.description = description;
            existingRole.permissions = permissions || [];
            await existingRole.save();
            return res.status(200).json({ success: true, message: "Role updated successfully", role: existingRole });

        } catch (error) {
            console.error("Error editing role:", error);
            return res.status(200).json({ success: false, message: "Internal server error" });
        }
    },

    deleteRole: async (req, res) => {
        try {
            const { id } = req.body;
            const existingRole = await Role.findById(id);
            if (!existingRole) {
                return res.status(200).json({ success: false, message: "Role not found" });
            }
            await Role.findByIdAndDelete(id);
            return res.status(200).json({ success: true, message: "Role deleted successfully" });
        } catch (error) {
            console.error("Error deleting role:", error);
            return res.status(200).json({ success: false, message: "Internal server error" });
        }
    },
    getRoles: async (req, res) => {
        try {
            const { page, limit } = req.query;
            const pageLimit = parseInt(limit) || 10;
            const skip = (parseInt(page) - 1) * pageLimit;
            const totalRoles = await Role.countDocuments();
            const totalPages = Math.ceil(totalRoles / pageLimit);
            const roles = await Role.find({}).populate("permissions", "name slug").skip(skip).limit(pageLimit);
            return res.status(200).json({ success: true, roles, totalPages, totalRoles });
        }
        catch (error) {
            console.error("Error fetching roles:", error);
            return res.status(200).json({ success: false, message: "Internal server error" });
        }
    },
    getRole: async (req, res) => {
        try {
            const { id } = req.params;
            const role = await Role.findById(id).populate("permissions", "name slug");
            return res.status(200).json({ success: true, role });
        }
        catch (error) {
            console.error("Error fetching role:", error);
            return res.status(200).json({ success: false, message: "Internal server error" });
        }
    },
}

const permissionController = {
    create: async (req, res) => {
        try {
            const { name, slug, description } = req.body;
            const existingPermission = await Permission.findOne({ slug });
            if (existingPermission) {
                return res.status(200).json({ success: false, message: "A permission with the same name already exists" });
            }
            const newPermission = new Permission({
                name,
                slug,
                description,
            });
            await newPermission.save();
            return res.status(200).json({ success: true, message: "Permission created successfully", permission: newPermission });
        } catch (error) {
            console.error("Error creating permission:", error);
            return res.status(200).json({ success: false, message: "Internal server error" });
        }
    },

    edit: async (req, res) => {
        try {
            const { id, name, slug, description } = req.body;
            const existingPermission = await Permission.findById(id);
            if (!existingPermission) {
                return res.status(200).json({ success: false, message: "Permission not found" });
            }
            existingPermission.name = name;
            existingPermission.slug = slug;
            existingPermission.description = description;
            await existingPermission.save();
            return res.status(200).json({ success: true, message: "Permission updated successfully", permission: existingPermission });
        } catch (error) {
            console.error("Error editing permission:", error);
            return res.status(200).json({ success: false, message: "Internal server error" });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.body;
            const existingPermission = await Permission.findById(id);
            if (!existingPermission) {
                return res.status(200).json({ success: false, message: "Permission not found" });
            }
            await Permission.findByIdAndDelete(id);
            return res.status(200).json({ success: true, message: "Permission deleted successfully" });
        } catch (error) {
            console.error("Error deleting permission:", error);
            return res.status(200).json({ success: false, message: "Internal server error" });
        }
    },

    getAll: async (req, res) => {
        try {
            const { page, limit } = req.query;
            const pageLimit = parseInt(limit) || 10;
            const skip = (parseInt(page) - 1) * pageLimit;
            const totalPermissions = await Permission.countDocuments();
            const totalPages = Math.ceil(totalPermissions / pageLimit);
            const permissions = await Permission.find({}).skip(skip).limit(pageLimit);
            return res.status(200).json({ success: true, permissions, totalPages, totalPermissions });
        }
        catch (error) {
            console.error("Error fetching permissions:", error);
            return res.status(200).json({ success: false, message: "Internal server error" });
        }
    },
    get: async (req, res) => {
        try {
            const { page, limit } = req.query;
            const pageLimit = parseInt(limit) || 10;
            const skip = (parseInt(page) - 1) * pageLimit;
            const totalPermissions = await Permission.countDocuments();
            const totalPages = Math.ceil(totalPermissions / pageLimit);
            const permissions = await Permission.find({}).skip(skip).limit(pageLimit);
            return res.status(200).json({ success: true, permissions, totalPages, totalPermissions });
        }
        catch (error) {
            console.error("Error fetching permissions:", error);
            return res.status(200).json({ success: false, message: "Internal server error" });
        }
    },
}


module.exports = roleController;