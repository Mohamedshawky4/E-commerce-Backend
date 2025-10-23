import PDFDocument from "pdfkit";

export const generateInvoice = (order) => {
  const doc = new PDFDocument();
  let buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {});

  // --- Example Invoice Layout ---
  doc.fontSize(18).text("Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Order Number: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Customer ID: ${order.user}`);
  doc.moveDown().text("Items:", { underline: true });
  order.items.forEach((item) => {
    doc.text(
      `${item.productName} (${item.quantity} × ${item.unitPrice}) = ${item.lineTotal}`
    );
  });

  doc.moveDown();
  doc.text(`Subtotal: ${order.itemsSubtotal}`);
  doc.text(`Shipping Fee: ${order.shippingFee}`);
  doc.text(`Total: ${order.totalAmount}`, { bold: true });

  doc.end();

  // Return a promise that resolves with the buffer
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
};
