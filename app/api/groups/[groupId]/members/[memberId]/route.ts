import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { groupId: string; memberId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is commissioner
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: params.groupId,
        userId: session.user.id,
        role: "COMMISSIONER",
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Only commissioners can remove members" },
        { status: 403 }
      )
    }

    // Don't allow removing self
    const memberToRemove = await prisma.groupMember.findUnique({
      where: { id: params.memberId },
    })

    if (memberToRemove?.userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot remove yourself" },
        { status: 400 }
      )
    }

    // Remove member
    await prisma.groupMember.delete({
      where: { id: params.memberId },
    })

    // Reorder remaining members
    const remainingMembers = await prisma.groupMember.findMany({
      where: { groupId: params.groupId },
      orderBy: { rotationOrder: "asc" },
    })

    for (let i = 0; i < remainingMembers.length; i++) {
      await prisma.groupMember.update({
        where: { id: remainingMembers[i].id },
        data: { rotationOrder: i },
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Member removal error:", error)
    return NextResponse.json(
      { error: "An error occurred while removing member" },
      { status: 500 }
    )
  }
}
