type ExportOptions = {
  slides: Array<{ title: string; bullets: string[] }>
  selectedStyle: {
    name: string
    palette: string[]
    font: string
  }
  title?: string
}

export async function generatePDF(options: ExportOptions) {
  const { jsPDF } = await import('jspdf')

  const { slides, selectedStyle, title = 'Presentation' } = options
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2

  pdf.setFillColor(
    Number.parseInt(selectedStyle.palette[0].substring(1, 3), 16),
    Number.parseInt(selectedStyle.palette[0].substring(3, 5), 16),
    Number.parseInt(selectedStyle.palette[0].substring(5, 7), 16)
  )
  pdf.rect(0, 0, pageWidth, pageHeight, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(48)
  pdf.setFont(selectedStyle.font === 'Georgia' ? 'times' : 'helvetica', 'bold')

  const titleLines = pdf.splitTextToSize(title, contentWidth - 40)
  pdf.text(titleLines, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' })

  pdf.setFontSize(14)
  pdf.text(`${slides.length} slides`, pageWidth / 2, pageHeight / 2 + 30, {
    align: 'center',
  })

  for (let i = 0; i < slides.length; i++) {
    pdf.addPage()

    pdf.setFillColor(
      Number.parseInt(selectedStyle.palette[0].substring(1, 3), 16),
      Number.parseInt(selectedStyle.palette[0].substring(3, 5), 16),
      Number.parseInt(selectedStyle.palette[0].substring(5, 7), 16)
    )
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')

    const textColor = selectedStyle.palette[1]
    pdf.setTextColor(
      Number.parseInt(textColor.substring(1, 3), 16),
      Number.parseInt(textColor.substring(3, 5), 16),
      Number.parseInt(textColor.substring(5, 7), 16)
    )

    pdf.setFontSize(32)
    pdf.setFont(
      selectedStyle.font === 'Georgia'
        ? 'times'
        : selectedStyle.font === 'Poppins'
          ? 'helvetica'
          : 'helvetica',
      'bold'
    )

    const titleLines = pdf.splitTextToSize(slides[i].title, contentWidth - 40)
    let yPosition = margin + 20
    pdf.text(titleLines, margin + 20, yPosition)

    yPosition += titleLines.length * 10 + 20

    pdf.setFontSize(16)
    pdf.setFont(
      selectedStyle.font === 'Georgia'
        ? 'times'
        : selectedStyle.font === 'Poppins'
          ? 'helvetica'
          : 'helvetica',
      'normal'
    )

    for (const bullet of slides[i].bullets) {
      const bulletLines = pdf.splitTextToSize(bullet, contentWidth - 60)
      pdf.text(bulletLines, margin + 40, yPosition, {
        maxWidth: contentWidth - 60,
      })
      yPosition += bulletLines.length * 8 + 8

      if (yPosition > pageHeight - margin - 20) {
        yPosition = margin + 20
      }
    }

    pdf.setFontSize(10)
    pdf.setTextColor(200, 200, 200)
    pdf.text(
      `Slide ${i + 1} of ${slides.length}`,
      pageWidth - margin - 30,
      pageHeight - margin + 5
    )
  }

  return pdf.output('blob')
}

export async function downloadPDF(
  options: ExportOptions,
  filename = 'presentation.pdf'
) {
  try {
    const blob = await generatePDF(options)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    throw error
  }
}
