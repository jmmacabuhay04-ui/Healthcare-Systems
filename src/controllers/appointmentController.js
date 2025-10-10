const { Appointment, User } = require("../models");

/**
 * 📌 Patient: Book a new appointment
 */
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date, time, and reason are required.",
      });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id, // logged-in patient
      doctorId,
      date,
      time,
      reason,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully (pending confirmation).",
      data: appointment,
    });
  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 📌 Patient: View their own appointments
 */
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { patientId: req.user.id },
      include: [
        { model: User, as: "doctor", attributes: ["id", "username", "email"] },
      ],
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Get my appointments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
};