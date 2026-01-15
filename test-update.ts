import { prisma } from "./lib/db";

async function testUpdate() {
  try {
    console.log("Testing event update with result...");
    
    // Az első eseményt frissítjük tesztként
    const event = await prisma.event.findFirst();
    
    if (!event) {
      console.log("No events found!");
      return;
    }
    
    console.log("Found event:", event);
    
    const updated = await prisma.event.update({
      where: { id: event.id },
      data: {
        finalHomeGoals: 2,
        finalAwayGoals: 1,
        status: "CLOSED",
      },
    });
    
    console.log("Updated event:", updated);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testUpdate();
