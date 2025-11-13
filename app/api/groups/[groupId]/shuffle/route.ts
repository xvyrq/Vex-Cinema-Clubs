import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { groupId } = await params

    // Check if user is commissioner
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id,
        role: "COMMISSIONER",
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Only commissioners can shuffle order" },
        { status: 403 }
      )
    }

    // Get all members
    const members = await prisma.groupMember.findMany({
      where: { groupId },
    })

    // Shuffle array using Fisher-Yates algorithm
    const shuffled = [...members]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Update rotation orders
    for (let i = 0; i < shuffled.length; i++) {
      await prisma.groupMember.update({
        where: { id: shuffled[i].id },
        data: { rotationOrder: i },
      })
    }

    // Reset current picker index
    await prisma.groupSettings.update({
      where: { groupId },
      data: { currentPickerIndex: 0 },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Shuffle error:", error)
    return NextResponse.json(
      { error: "An error occurred while shuffling" },
      { status: 500 }
    )
  }
}
