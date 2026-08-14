package com.careconnect.service;

import com.careconnect.entity.Appointment;
import com.careconnect.entity.DoctorProfile;
import com.careconnect.entity.Prescription;
import com.careconnect.entity.User;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class PdfGeneratorService {

    public byte[] generatePrescriptionPdf(Appointment appointment, Prescription prescription) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Styling Fonts
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(0, 104, 95));
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(100, 110, 110));
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(0, 104, 95));
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);

            // 1. Header Banner
            Paragraph brand = new Paragraph("CARECONNECT DIGITAL HEALTH", headerFont);
            brand.setAlignment(Element.ALIGN_LEFT);
            document.add(brand);

            Paragraph subtitle = new Paragraph("Official Electronic Medical Prescription", subHeaderFont);
            subtitle.setAlignment(Element.ALIGN_LEFT);
            subtitle.setSpacingAfter(15);
            document.add(subtitle);

            // Divider Line
            PdfPTable divider = new PdfPTable(1);
            divider.setWidthPercentage(100);
            PdfPCell lineCell = new PdfPCell();
            lineCell.setBackgroundColor(new Color(0, 104, 95));
            lineCell.setFixedHeight(2f);
            lineCell.setBorder(Rectangle.NO_BORDER);
            divider.addCell(lineCell);
            divider.setSpacingAfter(15);
            document.add(divider);

            // 2. Doctor & Patient Info Table (2 Columns)
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{50f, 50f});

            DoctorProfile doctor = appointment.getDoctor();
            User docUser = doctor != null ? doctor.getUser() : null;
            User patient = appointment.getPatient();

            // Left Cell: Doctor Info
            PdfPCell docCell = new PdfPCell();
            docCell.setBorder(Rectangle.NO_BORDER);
            docCell.addElement(new Paragraph("DOCTOR DETAILS", sectionTitleFont));
            docCell.addElement(new Paragraph(docUser != null ? docUser.getName() : "Dr. Medical Specialist", boldFont));
            docCell.addElement(new Paragraph("Degree: " + (doctor != null && doctor.getDegree() != null ? doctor.getDegree() : "MBBS / Specialist"), regularFont));
            docCell.addElement(new Paragraph("Specialization: " + (doctor != null && doctor.getSpeciality() != null ? doctor.getSpeciality().getName() : "General"), regularFont));
            docCell.addElement(new Paragraph("License No: " + (doctor != null && doctor.getLicenseNumber() != null ? doctor.getLicenseNumber() : "MCI-VALID"), regularFont));
            docCell.addElement(new Paragraph("Clinic: " + (doctor != null && doctor.getClinicName() != null ? doctor.getClinicName() : "CareConnect Virtual Clinic"), regularFont));

            // Right Cell: Patient & Appointment Info
            PdfPCell patCell = new PdfPCell();
            patCell.setBorder(Rectangle.NO_BORDER);
            patCell.addElement(new Paragraph("PATIENT & CONSULTATION DETAILS", sectionTitleFont));
            patCell.addElement(new Paragraph("Patient Name: " + (patient != null ? patient.getName() : "N/A"), boldFont));
            patCell.addElement(new Paragraph("Mobile: " + (patient != null ? patient.getMobileNumber() : "N/A"), regularFont));
            patCell.addElement(new Paragraph("Booking ID: " + appointment.getBookingId(), regularFont));
            patCell.addElement(new Paragraph("Date: " + appointment.getAppointmentDate().toString(), regularFont));
            patCell.addElement(new Paragraph("Medium: " + appointment.getConsultationMedium(), regularFont));

            infoTable.addCell(docCell);
            infoTable.addCell(patCell);
            infoTable.setSpacingAfter(20);
            document.add(infoTable);

            // 3. Diagnosis & Doctor Notes Section
            Paragraph notesTitle = new Paragraph("CLINICAL DIAGNOSIS & DOCTOR NOTES", sectionTitleFont);
            notesTitle.setSpacingAfter(5);
            document.add(notesTitle);

            Paragraph notesContent = new Paragraph(
                    prescription != null && prescription.getDoctorNotes() != null && !prescription.getDoctorNotes().isBlank()
                            ? prescription.getDoctorNotes()
                            : "Patient consulted. Follow general medical precautions.", regularFont);
            notesContent.setSpacingAfter(20);
            document.add(notesContent);

            // 4. Prescribed Medicines Section
            Paragraph medTitle = new Paragraph("PRESCRIBED MEDICATIONS", sectionTitleFont);
            medTitle.setSpacingAfter(5);
            document.add(medTitle);

            Paragraph medContent = new Paragraph(
                    prescription != null && prescription.getMedicines() != null && !prescription.getMedicines().isBlank()
                            ? prescription.getMedicines()
                            : "No oral medications prescribed.", boldFont);
            medContent.setSpacingAfter(30);
            document.add(medContent);

            // 5. Footer & Signature
            PdfPTable footerTable = new PdfPTable(1);
            footerTable.setWidthPercentage(100);
            PdfPCell sigCell = new PdfPCell();
            sigCell.setBorder(Rectangle.NO_BORDER);
            sigCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            sigCell.addElement(new Paragraph("Digitally Signed by: " + (docUser != null ? docUser.getName() : "Authorized Physician"), boldFont));
            sigCell.addElement(new Paragraph("Prescription Date: " + (prescription != null && prescription.getCreatedAt() != null ? prescription.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE) : LocalDate.now().toString()), regularFont));
            footerTable.addCell(sigCell);
            document.add(footerTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Error generating prescription PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate prescription PDF: " + e.getMessage());
        }
    }
}
