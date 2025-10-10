const { User, Appointment } = require("../models");

/**
 * Controller: Get Admin Dashboard Data
 * ----------------------------------------------------
 * - Only accessible by admin users (protected by RBAC)
 * - Retrieves statistics about users in the system
 * - Returns total users and breakdown by role
 *
 * @route GET /admin/dashboard
 * @access Admin
 */
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const adminCount = await User.count({ where: { role: "admin" } });
    const doctorCount = await User.count({ where: { role: "doctor" } });
    const patientCount = await User.count({ where: { role: "patient" } });

    res.json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        statistics: {
          totalUsers,
          adminCount,
          doctorCount,
          patientCount,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Controller: Get All Users
 * ----------------------------------------------------
 * - Only admins can access this endpoint
 * - Fetches all users from the database (ordered by newest first)
 * - Automatically removes passwords before returning
 *
 * @route GET /admin/users
 * @access Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        users: users.map((user) => user.toJSON()),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Controller: Delete a User
 * ----------------------------------------------------
 * - Only admins can delete users
 * - Prevents an admin from deleting their own account
 * - Returns success message when deletion is complete
 *
 * @route DELETE /admin/users/:userId
 * @access Admin
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Controller: Create a new user (Doctor or Patient)
 * ----------------------------------------------------
 * - Only admins can create accounts
 * - Role must be either "doctor" or "patient"
 *
 * @route POST /api/admin/users
 * @access Admin
 */
const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate role
    if (!["doctor", "patient"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either doctor or patient",
      });
    }

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password, // assuming you hash in model hook
      role,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser.toJSON(), // excludes password
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Controller: Get All Appointments
 * ----------------------------------------------------
 * - Only admins can access this endpoint
 * - Fetches all appointments with patient and doctor info
 *
 * @route GET /admin/appointments
 * @access Admin
 */
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: User, as: "patient", attributes: ["id", "username", "email"] },
        { model: User, as: "doctor", attributes: ["id", "username", "email"] },
      ],
      order: [["date", "ASC"], ["time", "ASC"]],
    });

    res.json({
      success: true,
      message: "Appointments retrieved successfully",
      data: appointments, // ✅ send array directly
    });
  } catch (error) {
    console.error("Get all appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Controller: Confirm Appointment
 * ----------------------------------------------------
 * - Admin confirms a pending appointment
 *
 * @route PUT /admin/appointments/:id/confirm
 * @access Admin
 */
const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = "confirmed";
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment confirmed successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Confirm appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Controller: Cancel Appointment
 * ----------------------------------------------------
 * - Admin cancels an appointment
 *
 * @route PUT /admin/appointments/:id/cancel
 * @access Admin
 */
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  deleteUser,
  createUser,
  getAllAppointments,
  confirmAppointment,
  cancelAppointment,
};