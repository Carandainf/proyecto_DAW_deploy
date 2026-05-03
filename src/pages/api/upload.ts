import type { APIRoute } from "astro";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // Límite de Vercel

export const POST: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || !session.user) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  try {
    const formData = await request.formData();
    const descripcion = formData.get("descripcion") as string;
    const prioridad = formData.get("prioridad") as string;
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: "No hay archivos" }), { status: 400 });
    }

    for (const file of files) {
      // 1. Convertir el archivo a un Buffer para que Cloudinary lo entienda
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 2. Subir a Cloudinary
      // Usamos una Promise porque el SDK de Cloudinary usa callbacks (vieja escuela)
      const uploadPromise = new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "raw", // CRÍTICO: .stl no es una imagen, es 'raw'
              folder: "diseños_dentales",
              public_id: `${Date.now()}-${file.name.replace(".stl", "")}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      const uploadResult = (await uploadPromise) as any;

      // 3. Guardar la URL de Cloudinary en tu base de datos (Neon DB)
      await prisma.archivo.create({
        data: {
          nombre_archivo: file.name,
          url_path: uploadResult.secure_url, // Esta es la URL pública que nos da Cloudinary
          id_usuario: session.user.id,
          estado: "pendiente",
          descripcion: descripcion || "",
          prioridad: prioridad || "normal",
        },
      });
    }

    return new Response(JSON.stringify({ message: "¡Subida exitosa a la nube!" }), { status: 200 });
  } catch (error) {
    console.error("Error en Cloudinary:", error);
    return new Response(JSON.stringify({ error: "Fallo al subir a la nube" }), { status: 500 });
  }
};
