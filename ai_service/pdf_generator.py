import base64
import io
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_LEFT

def generate_rti_pdf(application_text: str) -> str:
    """Render RTI application text into a clean PDF using ReportLab and return base64-encoded string."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'RTITitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        alignment=TA_LEFT,
        spaceAfter=14
    )
    body_style = ParagraphStyle(
        'RTIBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        alignment=TA_LEFT,
        spaceAfter=8
    )
    
    story = [
        Paragraph("APPLICATION FOR INFORMATION UNDER THE RTI ACT, 2005", title_style),
        Spacer(1, 10)
    ]
    
    paragraphs = application_text.split("\n\n")
    for para in paragraphs:
        cleaned_para = para.strip().replace("\n", "<br/>")
        if cleaned_para:
            story.append(Paragraph(cleaned_para, body_style))
            story.append(Spacer(1, 6))
            
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return base64.b64encode(pdf_bytes).decode("utf-8")
