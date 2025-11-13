import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; memberId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { groupId, memberId } = await params

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
        { error: "Only commissioners can skip turns" },
        { status: 403 }
      )
    }

    const { skip } = await request.json()

    await prisma.groupMember.update({
      where: { id: memberId },
      data: { isSkipped: skip },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Skip turn error:", error)
    return NextResponse.json(
      { error: "An error occurred while updating skip status" },
      { status: 500 }
    )
  }
}
