// Ejecuta este script aparte, por ejemplo en un archivo updateFileUrl.js
const mongoose = require("mongoose");
const path = require("path");
const Document = require("../backend/models/Document"); // Ajusta la ruta si es necesario

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://revidoc-backend.onrender.com";

async function updateDocuments() {
  await mongoose.connect("mongodb+srv://JosueLm7:2xuaJJErVN9faE0F@revidocuc.t8lo6ej.mongodb.net/?retryWrites=true&w=majority&appName=ReviDocUC"); // Cambia el nombre de tu BD

  const docs = await Document.find({ fileUrl: { $exists: false } });
  for (const doc of docs) {
    const filename = path.basename(doc.filePath);
    doc.fileUrl = `${API_URL}/api/documents/file/${filename}`;
    await doc.save();
    console.log(`Actualizado: ${doc._id} -> ${doc.fileUrl}`);
  }

  mongoose.disconnect();
}

updateDocuments();