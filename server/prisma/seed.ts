import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@hostsync.app" },
    update: {},
    create: { name: "Demo Host", email: "demo@hostsync.app", passwordHash },
  });

  const propertiesData = [
    { name: "Loft Palermo", address: "Av. Santa Fe 3200, CABA", platform: "airbnb" as const, maxGuests: 4, basePrice: 85 },
    { name: "Depto Recoleta", address: "Vicente Lopez 1900, CABA", platform: "booking" as const, maxGuests: 2, basePrice: 60 },
    { name: "Casa Nordelta", address: "Nordelta, Tigre", platform: "airbnb" as const, maxGuests: 8, basePrice: 220 },
  ];

  const properties = [];
  for (const p of propertiesData) {
    const property =
      (await prisma.property.findFirst({ where: { userId: user.id, name: p.name } })) ??
      (await prisma.property.create({
        data: { ...p, userId: user.id, platformId: p.name.toLowerCase().replace(/\s+/g, "-") },
      }));
    properties.push(property);
  }

  const providersData = [
    { name: "Limpieza Express", phone: "+5491122334455", email: "limpieza@example.com" },
    { name: "Mantenimiento Juan", phone: "+5491133445566", email: "juan@example.com" },
  ];
  const providers = [];
  for (const p of providersData) {
    const provider = await prisma.provider.create({ data: { ...p, userId: user.id } });
    providers.push(provider);
  }

  const now = new Date();
  const inDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const reservation1 = await prisma.reservation.create({
    data: {
      propertyId: properties[0].id,
      guestName: "Sofia Martinez",
      guestPhone: "+5491111111111",
      checkIn: inDays(2),
      checkOut: inDays(5),
      platform: "airbnb",
      platformReservationId: `seed-${properties[0].id}-1`,
    },
  });

  await prisma.reservation.create({
    data: {
      propertyId: properties[1].id,
      guestName: "Liam Chen",
      guestPhone: "+5491122222222",
      checkIn: inDays(4),
      checkOut: inDays(9),
      platform: "booking",
      platformReservationId: `seed-${properties[1].id}-1`,
    },
  });

  await prisma.task.create({
    data: {
      reservationId: reservation1.id,
      providerId: providers[0].id,
      type: "cleaning",
      scheduledDate: inDays(2),
      notes: "Limpieza post check-out del huesped anterior.",
    },
  });

  await prisma.task.create({
    data: {
      providerId: providers[1].id,
      type: "maintenance",
      status: "in_progress",
      scheduledDate: inDays(1),
      notes: "Revisar aire acondicionado en Casa Nordelta.",
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seed complete. Login with demo@hostsync.app / demo1234");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
