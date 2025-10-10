const { Appointment, User } = require("../models");



/**
 * 📌 Doctor: View all their appointments
 * ----------------------------------------------------
 * - Only accessible by a logged-in user with role = doctor
 * - Returns appointments where doctorId matches the logged-in doctor
 *
 * @route GET /api/doctors/appointments
 * @access Private (Doctor only)
 */
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { doctorId: req.user.id },
      include: [
        {
          model: User,
          as: "patient",
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["date", "ASC"], ["time", "ASC"]],
    });

    res.json({
      success: true,
      message: "Doctor appointments retrieved successfully",
      data: appointments,
    });
  } catch (error) {
    console.error("Doctor appointments error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * 📌 Doctor: Cancel an appointment
 * ----------------------------------------------------
 * - Only accessible by a logged-in user with role = doctor
 * - Doctor can cancel ONLY their own appointments
 *
 * @route PUT /api/doctors/appointments/:id/cancel
 * @access Private (Doctor only)
 */
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find appointment by ID
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // Ensure appointment belongs to the logged-in doctor
    if (appointment.doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this appointment",
      });
    }

    // Update status to cancelled
    appointment.status = "cancelled";
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Doctor cancel appointment error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getMyAppointments,
  cancelAppointment,
};