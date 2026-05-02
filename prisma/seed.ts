import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function main() {
  console.log("🌱 Iniciando el sembrado de base de datos...");

  // --- 1. LIMPIEZA ---
  // Borramos en orden para no romper restricciones de clave foránea
  await prisma.contacto.deleteMany();
  await prisma.mensaje.deleteMany();
  await prisma.archivo.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // --- 2. CREACIÓN DE ROLES ---
  const adminRole = await prisma.role.create({
    data: {
      nombre: "admin",
      descripcion: "Control total del laboratorio dental",
    },
  });

  const userRole = await prisma.role.create({
    data: {
      nombre: "user",
      descripcion: "Cliente que sube trabajos y recibe mensajes",
    },
  });

  // --- 3. CREACIÓN DE USUARIOS CON BETTER-AUTH ---
  const usuariosAcrear = [
    { name: "Admin Carlos", email: "admin@dentallab.com", role: "admin" },
    { name: "Clínica Dental Málaga", email: "malaga@dental.com", role: "user" },
    { name: "Dr. García Pro", email: "garcia@dental.com", role: "user" },
    { name: "Dental Sonrisas", email: "sonrisas@dental.com", role: "user" },
  ];

  const creados = [];

  for (const u of usuariosAcrear) {
    // Usamos el API de Better-Auth para que gestione el hash de la contraseña automáticamente
    await auth.api.signUpEmail({
      body: {
        email: u.email,
        password: "123456789",
        name: u.name,
        role: u.role,
      },
    });

    // Como Better-Auth crea el usuario pero no conoce tu tabla de Roles personalizada,
    // lo actualizamos justo después para vincularlo.
    const userUpdated = await prisma.user.update({
      where: { email: u.email },
      data: {
        roleId: u.role === "admin" ? adminRole.id : userRole.id,
      },
    });
    creados.push(userUpdated);
  }

  // Desestructuramos para asignar trabajos fácilmente
  const [admin, cliente1, cliente2, cliente3] = creados;

  // --- 4. COLA DE TRABAJOS (Solo .stl) ---
  await prisma.archivo.createMany({
    data: [
      {
        id_usuario: cliente1.id,
        nombre_archivo: "puente_molar_16.stl",
        url_path: "/uploads/puente_molar_16.stl", // <-- RUTA SIMULADA AÑADIDA
        estado: "completado",
        prioridad: "normal",
        descripcion: "Caso terminado con éxito",
      },
      {
        id_usuario: cliente1.id,
        nombre_archivo: "ferula_ajuste.stl",
        url_path: "/uploads/ferula_ajuste.stl", // <-- RUTA SIMULADA AÑADIDA
        estado: "en_proceso",
        prioridad: "urgente",
        descripcion: "Ajustar grosor a 2mm",
      },
      {
        id_usuario: cliente2.id,
        nombre_archivo: "arcada_completa.stl",
        url_path: "/uploads/arcada_completa.stl", // <-- RUTA SIMULADA AÑADIDA
        estado: "pendiente",
        prioridad: "urgente",
        descripcion: "Paciente en espera",
      },
      {
        id_usuario: cliente2.id,
        nombre_archivo: "inlay_molar_36.stl",
        url_path: "/uploads/inlay_molar_36.stl", // <-- RUTA SIMULADA AÑADIDA
        estado: "completado",
        prioridad: "normal",
      },
      {
        id_usuario: cliente3.id,
        nombre_archivo: "protesis_inf.stl",
        url_path: "/uploads/protesis_inf.stl", // <-- RUTA SIMULADA AÑADIDA
        estado: "en_proceso",
        prioridad: "normal",
      },
      {
        id_usuario: cliente3.id,
        nombre_archivo: "corona_v2.stl",
        url_path: "/uploads/corona_v2.stl", // <-- RUTA SIMULADA AÑADIDA
        estado: "pendiente",
        prioridad: "normal",
      },
    ],
  });

  // --- 5. MENSAJES (Sistema de conversación) ---
  const trabajo = await prisma.archivo.findFirst({
    where: { nombre_archivo: "ferula_ajuste.stl" },
  });

  if (trabajo) {
    await prisma.mensaje.create({
      data: {
        id_emisor: cliente1.id,
        id_archivo: trabajo.id_archivo,
        contenido: "Hola, ¿podéis revisar la oclusión de este caso?",
      },
    });
    await prisma.mensaje.create({
      data: {
        id_emisor: admin.id,
        id_archivo: trabajo.id_archivo,
        contenido: "Claro, lo revisamos y te subimos el diseño corregido en 1 hora.",
      },
    });
  }

  // --- 6. CONTACTOS WEB ---
  await prisma.contacto.createMany({
    data: [
      {
        nombre: "Dr. Julián López",
        email: "julian@externo.com",
        asunto: "Presupuesto",
        mensaje: "Hola, quiero saber vuestras tarifas de impresión STL.",
        leido: false,
      },
      {
        nombre: "Clínica El Palo",
        email: "info@elpalo.com",
        asunto: "Colaboración",
        mensaje: "Interesados en vuestro flujo digital.",
        leido: true,
        id_admin: admin.id,
        fecha_gestion: new Date(),
      },
    ],
  });

  console.log("---");
  console.log("✅ SEED COMPLETADO");
  console.log("🔑 Admin: admin@dentallab.com / 123456789");
  console.log("🔑 Cliente: malaga@dental.com / 123456789");
  console.log("---");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error en el seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
